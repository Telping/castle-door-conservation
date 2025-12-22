import type { AIAnalysis } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Analyze a door image using Claude Vision via Supabase Edge Function.
 * The API key is stored securely server-side in Supabase secrets.
 */
export async function analyzeDoorImage(imageBase64: string, mediaType: string = 'image/jpeg'): Promise<AIAnalysis> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-door`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      image: imageBase64,
      mediaType: mediaType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Edge Function error:', errorData);
    throw new Error(errorData?.error || 'Failed to analyze door image');
  }

  const data = await response.json();
  return data.analysis;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Get media type from file
export function getMediaType(file: File): string {
  const type = file.type;
  if (type === 'image/png') return 'image/png';
  if (type === 'image/gif') return 'image/gif';
  if (type === 'image/webp') return 'image/webp';
  return 'image/jpeg'; // default
}

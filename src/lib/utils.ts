import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_surveyor: 'bg-yellow-100 text-yellow-800',
    pending_conservation: 'bg-orange-100 text-orange-800',
    pending_budget: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-emerald-100 text-emerald-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    pending_surveyor: 'Awaiting Surveyor',
    pending_conservation: 'Awaiting Conservation',
    pending_budget: 'Awaiting Budget',
    approved: 'Approved',
    rejected: 'Rejected',
    in_progress: 'In Progress',
    completed: 'Completed',
  };
  return labels[status] || status;
}

export function getEffortLabel(level: string): string {
  const labels: Record<string, string> = {
    low: 'Low (1-8 hours)',
    medium: 'Medium (8-40 hours)',
    high: 'High (40-80 hours)',
    critical: 'Critical (80+ hours)',
  };
  return labels[level] || level;
}

export function getConditionLabel(rating: number): string {
  const labels: Record<number, string> = {
    1: 'Critical - Immediate action required',
    2: 'Poor - Significant deterioration',
    3: 'Fair - Moderate issues',
    4: 'Good - Minor wear',
    5: 'Excellent - Well maintained',
  };
  return labels[rating] || 'Unknown';
}

export function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

import { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, RotateCcw, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { compressImage } from '@/lib/utils';

// Sample images for testing
const sampleImages = [
  { id: 1, src: '/samples/door-1.png', name: 'Sample Door 1' },
  { id: 2, src: '/samples/door-2.png', name: 'Sample Door 2' },
  { id: 3, src: '/samples/door-3.png', name: 'Sample Door 3' },
];

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel?: () => void;
  capturedImage?: string | null;
}

export function CameraCapture({ onCapture, onCancel, capturedImage }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(capturedImage || null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Failed to access camera:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  }, [stream]);

  const switchCamera = async () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setTimeout(startCamera, 100);
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
          if (blob) {
            const compressed = await compressImage(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
            const file = new File([compressed], `door-${Date.now()}.jpg`, { type: 'image/jpeg' });

            const reader = new FileReader();
            reader.onloadend = () => {
              setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(compressed);

            stopCamera();
            onCapture(file);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        const newFile = new File([compressed], `door-${Date.now()}.jpg`, { type: 'image/jpeg' });

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(compressed);

        onCapture(newFile);
      } catch (err) {
        console.error('Failed to process image:', err);
        setError('Failed to process image. Please try again.');
      }
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSampleSelect = async (sampleSrc: string) => {
    try {
      setError(null);
      // Fetch the sample image
      const response = await fetch(sampleSrc);
      const blob = await response.blob();

      // Create a file from the blob
      const file = new File([blob], `sample-door-${Date.now()}.png`, { type: 'image/png' });

      // Compress the image
      const compressed = await compressImage(file);
      const newFile = new File([compressed], `door-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // Set preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(compressed);

      onCapture(newFile);
    } catch (err) {
      console.error('Failed to load sample image:', err);
      setError('Failed to load sample image. Please try again.');
    }
  };

  if (previewImage) {
    return (
      <div className="relative">
        <img
          src={previewImage}
          alt="Captured door"
          className="w-full rounded-lg object-cover"
          style={{ maxHeight: '60vh' }}
        />
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          <Button variant="destructive" size="sm" onClick={clearImage}>
            <X className="mr-1 h-4 w-4" />
            Retake
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isStreaming ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg bg-black"
            style={{ maxHeight: '60vh' }}
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            <Button variant="secondary" size="sm" onClick={switchCamera}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="lg" onClick={capturePhoto}>
              <Camera className="mr-2 h-5 w-5" />
              Capture
            </Button>
            <Button variant="outline" size="sm" onClick={stopCamera}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-gray-300 p-8">
          <div className="rounded-full bg-gray-100 p-4">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-center text-sm text-gray-500">
            Take a photo of the door to assess its condition
          </p>
          <div className="flex gap-3">
            <Button onClick={startCamera}>
              <Camera className="mr-2 h-4 w-4" />
              Open Camera
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Sample Images Section */}
          <div className="mt-4 w-full border-t pt-4">
            <div className="mb-3 flex items-center justify-center gap-2 text-sm text-gray-500">
              <ImageIcon className="h-4 w-4" />
              <span>Or use a sample image for testing</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sampleImages.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSampleSelect(sample.src)}
                  className="group relative overflow-hidden rounded-lg border-2 border-gray-200 transition-all hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <img
                    src={sample.src}
                    alt={sample.name}
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                    <span className="text-xs font-medium text-white">
                      {sample.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {onCancel && !isStreaming && !previewImage && (
        <Button variant="ghost" className="w-full" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}

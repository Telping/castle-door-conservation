import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { useAuth } from '@/hooks/useAuth';
import { useCreateAssessment, useAnalyzeDoor, useSites } from '@/hooks/useAssessments';

type Step = 'photo' | 'details' | 'analyzing' | 'review';

export function NewAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('photo');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [siteId, setSiteId] = useState('');
  const [doorLocation, setDoorLocation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createAssessment = useCreateAssessment();
  const analyzeDoor = useAnalyzeDoor();
  const { data: sites } = useSites();

  const handlePhotoCapture = (file: File) => {
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setStep('details');
  };

  const handleSubmit = async () => {
    if (!photo || !siteId || !doorLocation || !user) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      setStep('analyzing');

      // Create the assessment
      const assessment = await createAssessment.mutateAsync({
        siteId,
        doorLocation,
        photo,
        userId: user.id,
      });

      // Analyze with Claude Vision
      await analyzeDoor.mutateAsync({
        assessmentId: assessment.id,
        photo,
      });

      // Navigate to the assessment detail
      navigate(`/assessments/${assessment.id}`);
    } catch (err) {
      console.error('Failed to create assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create assessment');
      setStep('details');
    }
  };

  const siteOptions = sites?.map((site) => ({
    value: site.id,
    label: site.name,
  })) || [];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">New Assessment</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 'photo' && (
        <Card>
          <CardHeader>
            <CardTitle>Capture Door Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <CameraCapture
              onCapture={handlePhotoCapture}
              onCancel={() => navigate(-1)}
            />
          </CardContent>
        </Card>
      )}

      {step === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {photoPreview && (
              <div className="mb-4">
                <img
                  src={photoPreview}
                  alt="Captured door"
                  className="w-full rounded-lg object-cover"
                  style={{ maxHeight: '200px' }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setPhoto(null);
                    setPhotoPreview(null);
                    setStep('photo');
                  }}
                >
                  Retake Photo
                </Button>
              </div>
            )}

            <Select
              label="Site / Castle"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              options={siteOptions}
              placeholder="Select a site"
            />

            <Input
              label="Door Location"
              placeholder="e.g., Main entrance, North tower ground floor"
              value={doorLocation}
              onChange={(e) => setDoorLocation(e.target.value)}
            />

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPhoto(null);
                  setPhotoPreview(null);
                  setStep('photo');
                }}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!siteId || !doorLocation}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Door
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'analyzing' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-green-700" />
            <h3 className="mb-2 text-lg font-semibold">Analyzing Door...</h3>
            <p className="text-center text-sm text-gray-500">
              Our AI is examining the door for conservation requirements.
              This may take a moment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

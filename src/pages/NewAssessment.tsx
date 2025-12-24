import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles, MapPin, Navigation, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { useAuth } from '@/hooks/useAuth';
import { useCreateAssessment, useAnalyzeDoor, useSites } from '@/hooks/useAssessments';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { GeoLocation } from '@/types';

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
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [geolocation, setGeolocation] = useState<GeoLocation | null>(null);

  const createAssessment = useCreateAssessment();
  const analyzeDoor = useAnalyzeDoor();
  const { data: sites } = useSites();
  const {
    location: autoLocation,
    error: geoError,
    isLoading: geoLoading,
    getCurrentLocation
  } = useGeolocation();

  // Update geolocation when auto-location is captured
  useEffect(() => {
    if (autoLocation) {
      setGeolocation(autoLocation);
    }
  }, [autoLocation]);

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
        geolocation,
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

            {/* Geolocation Section */}
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  <MapPin className="mr-1 inline h-4 w-4" />
                  GPS Location
                </label>
                {geolocation && (
                  <span className="text-xs text-green-600">✓ Captured</span>
                )}
              </div>

              {geolocation ? (
                <div className="space-y-2">
                  <div className="rounded bg-gray-50 p-2 text-sm">
                    <div className="font-mono text-gray-600">
                      {geolocation.latitude.toFixed(6)}, {geolocation.longitude.toFixed(6)}
                    </div>
                    {geolocation.accuracy > 0 && (
                      <div className="text-xs text-gray-500">
                        Accuracy: ±{geolocation.accuracy.toFixed(0)}m
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setGeolocation(null);
                      setShowManualLocation(false);
                    }}
                  >
                    Clear Location
                  </Button>
                </div>
              ) : showManualLocation ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Latitude"
                      placeholder="e.g., 53.5548"
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      type="number"
                      step="any"
                    />
                    <Input
                      label="Longitude"
                      placeholder="e.g., -6.7894"
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      type="number"
                      step="any"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const lat = parseFloat(manualLat);
                        const lng = parseFloat(manualLng);
                        if (!isNaN(lat) && !isNaN(lng)) {
                          setGeolocation({ latitude: lat, longitude: lng, accuracy: 0 });
                          setShowManualLocation(false);
                        }
                      }}
                      disabled={!manualLat || !manualLng}
                    >
                      Set Location
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowManualLocation(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={geoLoading}
                  >
                    {geoLoading ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="mr-1 h-4 w-4" />
                    )}
                    {geoLoading ? 'Getting...' : 'Auto-detect'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowManualLocation(true)}
                  >
                    <Edit3 className="mr-1 h-4 w-4" />
                    Enter manually
                  </Button>
                </div>
              )}
              {geoError && (
                <p className="mt-2 text-xs text-red-600">{geoError}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Optional: Capture GPS coordinates for mapping
              </p>
            </div>

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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { SitesMap } from '@/components/map/SitesMap';
import { useSites, useAssessments } from '@/hooks/useAssessments';
import type { Site } from '@/types';

export function MapView() {
  const navigate = useNavigate();
  const { data: sites, isLoading: sitesLoading } = useSites();
  const { data: assessments } = useAssessments();
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  // Get assessment count for each site
  const getAssessmentCount = (siteId: string) => {
    return assessments?.filter(a => a.site_id === siteId).length || 0;
  };

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site);
  };

  const handleViewSiteAssessments = (siteId: string) => {
    navigate(`/assessments?site=${siteId}`);
  };

  if (sitesLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-green-700 border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-white p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-700" />
          <h1 className="text-xl font-bold text-gray-900">Heritage Sites Map</h1>
        </div>
        <span className="ml-auto text-sm text-gray-500">
          {sites?.filter(s => s.latitude && s.longitude).length || 0} sites with coordinates
        </span>
      </div>

      {/* Map Container */}
      <div className="relative flex-1">
        <SitesMap
          sites={sites || []}
          onSiteSelect={handleSiteSelect}
          selectedSiteId={selectedSite?.id}
          className="h-full"
        />

        {/* Site Detail Panel */}
        {selectedSite && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] md:left-auto md:right-4 md:w-96">
            <Card className="shadow-lg">
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-700" />
                    <h3 className="font-semibold text-gray-900">{selectedSite.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedSite(null)}
                    className="rounded p-1 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>

                <div className="mb-3 space-y-2 text-sm">
                  <p className="text-gray-600">{selectedSite.location}</p>
                  {selectedSite.county && (
                    <p className="text-gray-500">County: {selectedSite.county}</p>
                  )}
                  {selectedSite.description && (
                    <p className="text-gray-500">{selectedSite.description}</p>
                  )}
                  {selectedSite.latitude && selectedSite.longitude && (
                    <p className="font-mono text-xs text-gray-400">
                      {selectedSite.latitude.toFixed(4)}, {selectedSite.longitude.toFixed(4)}
                    </p>
                  )}
                </div>

                <div className="mb-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Door Assessments</span>
                    <span className="font-semibold text-green-700">
                      {getAssessmentCount(selectedSite.id)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleViewSiteAssessments(selectedSite.id)}
                  >
                    View Assessments
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/assessments/new', { state: { siteId: selectedSite.id } })}
                  >
                    New Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Legend */}
        <div className="absolute left-4 top-4 z-[1000] rounded-lg bg-white/90 p-3 shadow-md backdrop-blur">
          <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Legend</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Heritage Site</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Selected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

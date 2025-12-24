import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Site } from '@/types';

// Fix for default marker icons in Leaflet with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error - Leaflet types don't include _getIconUrl
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Ireland center coordinates
const IRELAND_CENTER: [number, number] = [53.5, -7.5];
const DEFAULT_ZOOM = 7;

interface SitesMapProps {
  sites: Site[];
  onSiteSelect?: (site: Site) => void;
  selectedSiteId?: string | null;
  className?: string;
}

// Component to fit bounds when sites change
function FitBounds({ sites }: { sites: Site[] }) {
  const map = useMap();

  useEffect(() => {
    const sitesWithCoords = sites.filter(s => s.latitude && s.longitude);
    if (sitesWithCoords.length > 0) {
      const bounds = L.latLngBounds(
        sitesWithCoords.map(s => [s.latitude!, s.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [sites, map]);

  return null;
}

export function SitesMap({ sites, onSiteSelect, selectedSiteId, className = '' }: SitesMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Filter sites that have coordinates
  const sitesWithCoords = sites.filter(s => s.latitude !== null && s.longitude !== null);

  // Create custom icons
  const defaultIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const selectedIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [35, 57],
    iconAnchor: [17, 57],
    popupAnchor: [1, -48],
    shadowSize: [57, 57],
    className: 'selected-marker',
  });

  return (
    <div className={`relative ${className}`}>
      <style>{`
        .selected-marker {
          filter: hue-rotate(120deg) saturate(1.5);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 12px 16px;
        }
      `}</style>
      <MapContainer
        center={IRELAND_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds sites={sitesWithCoords} />
        {sitesWithCoords.map((site) => (
          <Marker
            key={site.id}
            position={[site.latitude!, site.longitude!]}
            icon={site.id === selectedSiteId ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: () => onSiteSelect?.(site),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="mb-1 font-semibold text-gray-900">{site.name}</h3>
                <p className="mb-2 text-sm text-gray-600">{site.location}</p>
                {site.description && (
                  <p className="text-xs text-gray-500">{site.description}</p>
                )}
                {onSiteSelect && (
                  <button
                    onClick={() => onSiteSelect(site)}
                    className="mt-2 w-full rounded bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

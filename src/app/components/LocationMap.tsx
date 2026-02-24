import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom red marker icon for current location
const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map center when location changes
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
};

interface LocationMapProps {
  latitude: number;
  longitude: number;
  accuracy?: number;
  zoom?: number;
  height?: string;
  showAccuracyCircle?: boolean;
  markerLabel?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  latitude,
  longitude,
  accuracy = 100,
  zoom = 15,
  height = '300px',
  showAccuracyCircle = true,
  markerLabel = 'Your Current Location'
}) => {
  const position: [number, number] = [latitude, longitude];
  
  return (
    <div className="rounded-xl overflow-hidden shadow-lg border-2 border-slate-200 dark:border-slate-700" style={{ height }}>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Accuracy Circle */}
        {showAccuracyCircle && (
          <Circle
            center={position}
            radius={accuracy}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.2,
              weight: 2
            }}
          />
        )}
        
        {/* Current Location Marker */}
        <Marker position={position} icon={currentLocationIcon}>
          <Popup>
            <div className="text-center p-1">
              <p className="font-semibold text-slate-900 mb-1">{markerLabel}</p>
              <p className="text-xs text-slate-600">
                Lat: {latitude.toFixed(6)}
              </p>
              <p className="text-xs text-slate-600">
                Long: {longitude.toFixed(6)}
              </p>
              {showAccuracyCircle && (
                <p className="text-xs text-slate-500 mt-1">
                  Accuracy: ±{accuracy.toFixed(0)}m
                </p>
              )}
            </div>
          </Popup>
        </Marker>
        
        <MapUpdater center={position} />
      </MapContainer>
    </div>
  );
};

interface MultiLocationMapProps {
  locations: Array<{
    id: string;
    latitude: number;
    longitude: number;
    label: string;
    timestamp?: string;
    riskLevel?: 'low' | 'medium' | 'high';
  }>;
  height?: string;
  zoom?: number;
}

export const MultiLocationMap: React.FC<MultiLocationMapProps> = ({
  locations,
  height = '400px',
  zoom = 12
}) => {
  if (locations.length === 0) return null;
  
  // Calculate center point (average of all locations)
  const centerLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
  const centerLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
  const center: [number, number] = [centerLat, centerLng];
  
  // Create custom icons based on risk level
  const getRiskIcon = (riskLevel?: string) => {
    const color = riskLevel === 'high' ? 'red' : riskLevel === 'medium' ? 'orange' : 'green';
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };
  
  return (
    <div className="rounded-xl overflow-hidden shadow-lg border-2 border-slate-200 dark:border-slate-700" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={getRiskIcon(location.riskLevel)}
          >
            <Popup>
              <div className="text-center p-1">
                <p className="font-semibold text-slate-900 mb-1">{location.label}</p>
                {location.riskLevel && (
                  <p className="text-xs font-semibold text-slate-700 mb-1 uppercase">
                    Risk: {location.riskLevel}
                  </p>
                )}
                <p className="text-xs text-slate-600">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
                {location.timestamp && (
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(location.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

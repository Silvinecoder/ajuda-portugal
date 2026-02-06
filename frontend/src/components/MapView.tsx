import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { HelpRequest, Urgency } from '../types';
import { fetchRequests } from '../api';
import AskHelpForm from './AskHelpForm';
import SuccessModal from './SuccessModal';
import PinCard from './PinCard';
import FilterBar from './FilterBar';
import MapSearchBar from './MapSearchBar';

const pinColors: Record<Urgency, string> = {
  Critico: '#dc2626',
  urgent: '#ea580c',
  standard: '#eab308',
  recovery: '#22c55e',
};

function createIcon(color: string) {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      width: 24px; height: 24px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 10);
  }, [map, center]);
  return null;
}

export default function MapView() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [filter, setFilter] = useState<Urgency | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [successRequest, setSuccessRequest] = useState<HelpRequest | null>(null);
  const [selectedPin, setSelectedPin] = useState<HelpRequest | null>(null);
  const [center, setCenter] = useState<[number, number]>([39.5, -8]);

  const loadRequests = useCallback(() => {
    fetchRequests(filter === 'all' ? undefined : filter)
      .then(setRequests)
      .catch(() => setRequests([]));
  }, [filter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadRequests();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [loadRequests]);

  const handleFormSuccess = (req: HelpRequest) => {
    setShowForm(false);
    setSuccessRequest(req);
    setRequests((prev) => [req, ...prev]);
  };

  return (
    <div className="map-view">
      <MapContainer
        center={center}
        zoom={7}
        style={{ height: '100vh', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter center={center} />
        {requests.map((req) => (
          <Marker
            key={req.id}
            position={[req.lat, req.lng]}
            icon={createIcon(pinColors[req.urgency as Urgency] || pinColors.standard)}
            eventHandlers={{
              click: () => setSelectedPin(req),
            }}
          >
            <Popup>
              <PinCard
                request={req}
                compact
                onShowFull={() => setSelectedPin(req)}
                onClose={() => setSelectedPin(null)}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <MapSearchBar onLocationSelect={(lat, lng) => setCenter([lat, lng])} />

      <FilterBar value={filter} onChange={setFilter} />

      <button
        className="ask-help-btn"
        onClick={() => setShowForm(true)}
        aria-label="Pedir ajuda"
      >
        Pedir ajuda
      </button>

      {showForm && (
        <AskHelpForm
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
          onLocationChange={setCenter}
        />
      )}

      {successRequest && (
        <SuccessModal
          request={successRequest}
          onClose={() => setSuccessRequest(null)}
        />
      )}

      {selectedPin && (
        <div className="pin-detail-overlay" onClick={() => setSelectedPin(null)}>
          <div className="pin-detail-card" onClick={(e) => e.stopPropagation()}>
            <PinCard request={selectedPin} onClose={() => setSelectedPin(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

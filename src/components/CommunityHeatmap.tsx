import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Map, AlertCircle } from 'lucide-react';
import { Language } from '../services/aiService';

// Fix for Leaflet icons in Vite
import 'leaflet/dist/leaflet.css';

interface Props {
  language: Language;
}

const TRANSLATIONS = {
  en: { title: "Community Heatmap", loading: "Finding nearby farms...", error: "Enable location to see the community map.", risk: "Reported Risk" },
  sw: { title: "Ramani ya Kijamii", loading: "Inatafuta mashamba...", error: "Wezesha eneo kuona ramani.", risk: "Hatari Iliyoripotiwa" },
  rw: { title: "Ikarita y'Akarere", loading: "Gushaka imirima...", error: "Fungura location ngo ubone ikarita.", risk: "Ibyago byavuzwe" },
  fr: { title: "Carte Communautaire", loading: "Recherche de fermes...", error: "Activez la localisation pour voir la carte.", risk: "Risque Signalé" }
};

// Component to dynamically change map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export function CommunityHeatmap({ language }: Props) {
  const t = TRANSLATIONS[language];
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<boolean>(false);
  
  // Mock data points around user location
  const [mockPoints, setMockPoints] = useState<Array<{lat: number, lng: number, risk: string}>>([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        
        // Generate mock points (e.g. Blight, Rust, Pests)
        const points = [];
        for(let i=0; i<5; i++) {
          points.push({
            lat: lat + (Math.random() - 0.5) * 0.05,
            lng: lng + (Math.random() - 0.5) * 0.05,
            risk: ['High', 'Medium', 'Critical'][Math.floor(Math.random() * 3)]
          });
        }
        setMockPoints(points);
      },
      () => setError(true)
    );
  }, []);

  if (error) {
    return (
      <div className="bg-[#EF4444]/10 p-6 rounded-2xl text-center border border-[#EF4444]/30 flex flex-col items-center justify-center h-64">
        <Map size={32} className="text-[#FCA5A5] mb-2" />
        <p className="text-[#FCA5A5] font-bold">{t.error}</p>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="bg-[#0A1F17] p-6 rounded-2xl animate-pulse text-[#10B981] font-bold flex items-center justify-center h-64 border border-[#10B981]/15">
        {t.loading}
      </div>
    );
  }

  return (
    <div className="bg-[#0A1F17] rounded-[24px] p-6 border border-[#10B981]/15 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
      <h3 className="font-bold text-xl text-white flex items-center gap-2 mb-6">
        <Map className="text-[#10B981]" />
        {t.title}
      </h3>
      <div className="h-64 rounded-xl overflow-hidden border border-[#10B981]/20 relative z-0">
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={position} />
          
          {/* User Location */}
          <CircleMarker center={position} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.5 }} radius={8}>
            <Popup>Your Farm</Popup>
          </CircleMarker>

          {/* Community Data */}
          {mockPoints.map((pt, i) => (
            <CircleMarker 
              key={i} 
              center={[pt.lat, pt.lng]} 
              pathOptions={{ 
                color: pt.risk === 'Critical' ? 'red' : pt.risk === 'High' ? 'orange' : 'yellow',
                fillOpacity: 0.6
              }} 
              radius={15}
            >
              <Popup>
                <strong>{t.risk}:</strong> {pt.risk}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

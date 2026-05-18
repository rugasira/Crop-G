import { useState, useEffect } from 'react';
import { CloudRain, Sun, Thermometer, AlertTriangle } from 'lucide-react';
import { Language } from '../services/aiService';

interface Props {
  language: Language;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  risk: 'Low' | 'Medium' | 'High';
}

const TRANSLATIONS = {
  en: { title: "Weather & Disease Risk", temp: "Temp", humidity: "Humidity", rain: "Rainfall", riskLabel: "5-Day Risk Alert", low: "Low", med: "Medium", high: "High", loading: "Locating farm...", error: "Could not fetch weather data." },
  sw: { title: "Hali ya Hewa na Hatari", temp: "Joto", humidity: "Unyevu", rain: "Mvua", riskLabel: "Hatari Siku 5", low: "Chini", med: "Kati", high: "Juu", loading: "Inatafuta shamba...", error: "Imeshindwa kupata hali ya hewa." },
  rw: { title: "Iteganyagihe n'Ibyago", temp: "Ubushyuhe", humidity: "Ubuhehere", rain: "Imvura", riskLabel: "Ibyago mu minsi 5", low: "Hasi", med: "Hagati", high: "Hejuru", loading: "Gushaka aho uri...", error: "Ntibishobora kubona amakuru y'iteganyagihe." },
  fr: { title: "Météo et Risques", temp: "Temp", humidity: "Humidité", rain: "Pluie", riskLabel: "Risque sur 5 Jours", low: "Faible", med: "Moyen", high: "Élevé", loading: "Localisation...", error: "Impossible de récupérer la météo." }
};

export function WeatherRisk({ language }: Props) {
  const t = TRANSLATIONS[language];
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(t.error);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Open-Meteo requires no API key
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation&forecast_days=1`);
          const json = await res.json();
          
          const temp = json.current.temperature_2m;
          const humidity = json.current.relative_humidity_2m;
          const rain = json.current.precipitation;
          
          // Simple risk algorithm
          let risk: 'Low' | 'Medium' | 'High' = 'Low';
          if (humidity > 80 || rain > 10) risk = 'High';
          else if (humidity > 60 || temp > 30) risk = 'Medium';

          setData({ temperature: temp, humidity, rainfall: rain, risk });
        } catch (e) {
          setError(t.error);
        }
      },
      (err) => {
        console.warn(err);
        setError("Location access denied. Cannot predict weather risks.");
      }
    );
  }, [language]);

  if (error) {
    return (
      <div className="bg-[#EF4444]/10 text-[#FCA5A5] p-4 rounded-[24px] border border-[#EF4444]/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="shrink-0 text-sm font-bold text-[#10B981] bg-[#10B981]/10 px-4 py-2 rounded-xl hover:bg-[#10B981]/20 transition-colors"
        >
          Enable Location
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-brand-50 p-6 rounded-2xl animate-pulse text-brand-500 font-bold flex items-center justify-center h-32">
        {t.loading}
      </div>
    );
  }

  const getRiskColor = (r: string) => {
    if (r === 'High') return 'bg-red-500 text-white';
    if (r === 'Medium') return 'bg-yellow-500 text-white';
    return 'bg-green-500 text-white';
  };

  const getRiskText = (r: 'Low' | 'Medium' | 'High') => {
    if (r === 'High') return t.high;
    if (r === 'Medium') return t.med;
    return t.low;
  };

  return (
    <div className="bg-[#0A1F17] rounded-[24px] p-6 border border-[#10B981]/15 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
      <div className="flex items-center justify-between mb-6 border-b border-[#10B981]/20 pb-4">
        <h3 className="font-bold text-xl text-white flex items-center gap-2">
          <Sun className="text-[#10B981]" />
          {t.title}
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(data.risk)}`}>
          {t.riskLabel}: {getRiskText(data.risk)}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-[#0F2E22] p-4 rounded-[12px] border border-[#10B981]/10">
          <Thermometer className="mx-auto text-[#10B981] mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{data.temperature}°C</p>
          <p className="text-xs text-[#6EE7B7] uppercase font-bold mt-1">{t.temp}</p>
        </div>
        <div className="bg-[#0F2E22] p-4 rounded-[12px] border border-[#10B981]/10">
          <CloudRain className="mx-auto text-[#3B82F6] mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{data.rainfall}mm</p>
          <p className="text-xs text-[#6EE7B7] uppercase font-bold mt-1">{t.rain}</p>
        </div>
        <div className="bg-[#0F2E22] p-4 rounded-[12px] border border-[#10B981]/10">
          <AlertTriangle className="mx-auto text-[#F59E0B] mb-2" size={24} />
          <p className="text-2xl font-bold text-white">{data.humidity}%</p>
          <p className="text-xs text-[#6EE7B7] uppercase font-bold mt-1">{t.humidity}</p>
        </div>
      </div>
    </div>
  );
}

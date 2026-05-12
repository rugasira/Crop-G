import { HistoryItem } from '../hooks/useHistory';
import { Clock, AlertCircle } from 'lucide-react';
import { Language } from '../services/aiService';

interface Props {
  history: HistoryItem[];
  language: Language;
  onSelect: (item: HistoryItem) => void;
}

const TRANSLATIONS = {
  en: { title: "Recent Scans", noHistory: "No recent scans found." },
  sw: { title: "Uchunguzi wa Hivi Karibuni", noHistory: "Hakuna uchunguzi wa hivi karibuni." },
  rw: { title: "Ibyasuzumwe Vuba", noHistory: "Nta byasuzumwe vuba byabonetse." },
  fr: { title: "Analyses Récentes", noHistory: "Aucune analyse récente trouvée." }
};

export function HistoryList({ history, language, onSelect }: Props) {
  const t = TRANSLATIONS[language];

  if (history.length === 0) {
    return (
      <div className="bg-white/80 rounded-[2rem] p-8 border border-brand-100 text-center text-brand-900/50">
        <Clock className="mx-auto mb-3 opacity-50" size={32} />
        <p className="font-sans font-medium">{t.noHistory}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 rounded-[2rem] p-6 sm:p-8 border border-brand-100 shadow-xl shadow-brand-900/5">
      <h3 className="text-2xl font-bold text-brand-950 mb-6 flex items-center gap-2">
        <Clock className="text-brand-600" />
        {t.title}
      </h3>
      <div className="space-y-4">
        {history.map(item => (
          <button 
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left flex items-center gap-4 bg-brand-50/30 p-4 rounded-2xl border border-brand-100 hover:bg-brand-50 transition-colors group"
          >
            {item.image ? (
              <img src={item.image} alt="Crop" className="w-16 h-16 rounded-xl object-cover bg-brand-100" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-brand-100 flex items-center justify-center text-brand-400">
                <AlertCircle />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-brand-950 truncate">
                {item.result.disease || "Unknown Issue"}
              </h4>
              <p className="text-sm text-brand-900/60 truncate">
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              &rarr;
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

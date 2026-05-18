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
      <div className="bg-[#0A1F17] rounded-[2rem] p-8 border border-[#10B981]/15 text-center text-[#6EE7B7]">
        <Clock className="mx-auto mb-3 opacity-50" size={32} />
        <p className="font-sans font-medium">{t.noHistory}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0A1F17] rounded-[2rem] p-6 sm:p-8 border border-[#10B981]/15 shadow-[0_0_40px_rgba(16,185,129,0.05)]">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Clock className="text-[#10B981]" />
        {t.title}
      </h3>
      <div className="space-y-4">
        {history.map(item => (
          <button 
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left flex items-center gap-4 bg-[#0F2E22] p-4 rounded-[12px] border border-[#10B981]/20 hover:bg-[#10B981]/10 transition-colors group"
          >
            {item.image ? (
              <img src={item.image} alt="Crop" className="w-16 h-16 rounded-xl object-cover bg-[#10B981]/10 border border-[#10B981]/20" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
                <AlertCircle />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white truncate">
                {item.result.disease || "Unknown Issue"}
              </h4>
              <p className="text-sm text-[#6EE7B7] truncate">
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              &rarr;
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

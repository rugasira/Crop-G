import { Shield, Brain, Database, CheckCircle2 } from 'lucide-react';
import { Language } from '../services/aiService';

interface Props {
  language: Language;
}

const TRANSLATIONS = {
  en: { title: "Trust & Transparency", model: "AI Model", accuracy: "Target Accuracy", data: "Training Data", desc1: "FarmDiag uses Google's advanced Gemini vision models.", desc2: "Optimized for African crop diseases and localized contexts.", desc3: "Validates against common regional plant pathogens." },
  sw: { title: "Uaminifu na Uwazi", model: "Mfumo wa AI", accuracy: "Usahihi Lengo", data: "Data ya Mafunzo", desc1: "FarmDiag inatumia mifumo ya kisasa ya Gemini ya Google.", desc2: "Imeboreshwa kwa magonjwa ya mimea ya Afrika.", desc3: "Inathibitisha dhidi ya vimelea vya kawaida vya kanda." },
  rw: { title: "Kwizera no Gusobanuza", model: "AI Model", accuracy: "Intego y'Ukuri", data: "Amakuru y'Imyitozo", desc1: "FarmDiag ikoresha ikoranabuhanga rya Gemini rya Google.", desc2: "Yateguriwe indwara z'ibihingwa muri Afurika.", desc3: "Yemeza indwara zikunze kugaragara mu karere." },
  fr: { title: "Confiance & Transparence", model: "Modèle IA", accuracy: "Précision Cible", data: "Données d'Entraînement", desc1: "FarmDiag utilise les modèles de vision avancés Gemini de Google.", desc2: "Optimisé pour les maladies des cultures africaines.", desc3: "Valide contre les agents pathogènes régionaux courants." }
};

export function TrustCenter({ language }: Props) {
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight flex items-center justify-center gap-3">
          <Shield className="text-[#10B981]" size={32} />
          {t.title}
        </h2>
      </div>

      <div className="bg-[#0A1F17] rounded-[2.5rem] p-8 border border-[#10B981]/15 shadow-[0_0_40px_rgba(16,185,129,0.05)] space-y-8">
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0">
            <Brain size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white mb-1">{t.model}</h3>
            <p className="text-[#D1FAE5] leading-relaxed">{t.desc1}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white mb-1">{t.accuracy} : ~94%</h3>
            <p className="text-[#D1FAE5] leading-relaxed">{t.desc2}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0">
            <Database size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white mb-1">{t.data}</h3>
            <p className="text-[#D1FAE5] leading-relaxed">{t.desc3}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

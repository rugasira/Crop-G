import { Store, Sprout, ShieldCheck, PhoneCall } from 'lucide-react';
import { Language } from '../services/aiService';

interface Props {
  language: Language;
}

const TRANSLATIONS = {
  en: { title: "Agro-Dealers & Services", seeds: "Quality Seeds", chemical: "Treatments", agronomist: "Agronomist Consult", call: "Contact", coming: "Coming Soon" },
  sw: { title: "Maduka ya Kilimo na Huduma", seeds: "Mbegu Bora", chemical: "Dawa za Kilimo", agronomist: "Ushauri wa Mtaalamu", call: "Wasiliana", coming: "Inakuja Hivi Karibuni" },
  rw: { title: "Amaduka y'Ubuhinzi na Serivisi", seeds: "Imbuto Nziza", chemical: "Imiti", agronomist: "Inama z'Inzobere", call: "Hamagara", coming: "Biri hafi kuza" },
  fr: { title: "Agro-Revendeurs & Services", seeds: "Semences de Qualité", chemical: "Traitements", agronomist: "Consultation Agronome", call: "Contacter", coming: "Bientôt Disponible" }
};

export function Marketplace({ language }: Props) {
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight flex items-center justify-center gap-3">
          <Store className="text-[#10B981]" size={40} />
          {t.title}
        </h2>
        <p className="text-[#6EE7B7]">{t.coming}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A1F17] p-6 rounded-[24px] border border-[#10B981]/15 shadow-[0_0_40px_rgba(16,185,129,0.05)] transition-all text-center">
          <div className="w-16 h-16 mx-auto bg-[#10B981]/15 text-[#10B981] rounded-2xl flex items-center justify-center mb-4">
            <Sprout size={32} />
          </div>
          <h3 className="font-bold text-xl mb-2 text-white">{t.seeds}</h3>
          <button className="w-full py-2 bg-[#0F2E22] text-[#D1FAE5] font-bold rounded-xl mt-4 border border-[#10B981]/20 hover:bg-[#10B981]/20 transition-colors">{t.coming}</button>
        </div>

        <div className="bg-[#0A1F17] p-6 rounded-[24px] border border-[#10B981]/15 shadow-[0_0_40px_rgba(16,185,129,0.05)] transition-all text-center">
          <div className="w-16 h-16 mx-auto bg-[#10B981]/15 text-[#10B981] rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck size={32} />
          </div>
          <h3 className="font-bold text-xl mb-2 text-white">{t.chemical}</h3>
          <button className="w-full py-2 bg-[#0F2E22] text-[#D1FAE5] font-bold rounded-xl mt-4 border border-[#10B981]/20 hover:bg-[#10B981]/20 transition-colors">{t.coming}</button>
        </div>

        <div className="bg-[#0A1F17] p-6 rounded-[24px] border border-[#10B981]/15 shadow-[0_0_40px_rgba(16,185,129,0.05)] transition-all text-center">
          <div className="w-16 h-16 mx-auto bg-[#10B981]/15 text-[#10B981] rounded-2xl flex items-center justify-center mb-4">
            <PhoneCall size={32} />
          </div>
          <h3 className="font-bold text-xl mb-2 text-white">{t.agronomist}</h3>
          <button className="w-full py-2 bg-[#0F2E22] text-[#D1FAE5] font-bold rounded-xl mt-4 border border-[#10B981]/20 hover:bg-[#10B981]/20 transition-colors">{t.coming}</button>
        </div>
      </div>
    </div>
  );
}

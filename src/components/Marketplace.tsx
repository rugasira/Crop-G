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
        <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight flex items-center justify-center gap-3">
          <Store className="text-brand-600" size={40} />
          {t.title}
        </h2>
        <p className="text-brand-900/70">{t.coming}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-brand-100 shadow-xl shadow-brand-900/5 hover:shadow-brand-900/10 transition-all text-center">
          <div className="w-16 h-16 mx-auto bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
            <Sprout size={32} />
          </div>
          <h3 className="font-bold text-xl mb-2">{t.seeds}</h3>
          <button className="w-full py-2 bg-brand-50 text-brand-900 font-bold rounded-xl mt-4 hover:bg-brand-100">{t.coming}</button>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-brand-100 shadow-xl shadow-brand-900/5 hover:shadow-brand-900/10 transition-all text-center">
          <div className="w-16 h-16 mx-auto bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck size={32} />
          </div>
          <h3 className="font-bold text-xl mb-2">{t.chemical}</h3>
          <button className="w-full py-2 bg-brand-50 text-brand-900 font-bold rounded-xl mt-4 hover:bg-brand-100">{t.coming}</button>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-brand-100 shadow-xl shadow-brand-900/5 hover:shadow-brand-900/10 transition-all text-center">
          <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <PhoneCall size={32} />
          </div>
          <h3 className="font-bold text-xl mb-2">{t.agronomist}</h3>
          <button className="w-full py-2 bg-brand-50 text-brand-900 font-bold rounded-xl mt-4 hover:bg-brand-100">{t.coming}</button>
        </div>
      </div>
    </div>
  );
}

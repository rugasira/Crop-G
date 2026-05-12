import { CloudRain, Sun, Leaf } from 'lucide-react';
import { Language } from '../services/aiService';

interface Props {
  language: Language;
}

const ADVISORY = {
  en: {
    title: "Seasonal Advisory",
    subtitle: "Insights for this month",
    tips: [
      { icon: CloudRain, text: "Expect heavy rains this week. Ensure good drainage for your potatoes." },
      { icon: Sun, text: "High heat incoming. Water crops early morning or late evening." },
      { icon: Leaf, text: "Maize stalk borer season is starting. Check your plants regularly." }
    ]
  },
  sw: {
    title: "Ushauri wa Msimu",
    subtitle: "Maelezo ya mwezi huu",
    tips: [
      { icon: CloudRain, text: "Tarajia mvua kubwa wiki hii. Hakikisha mifereji mizuri ya maji kwa viazi vyako." },
      { icon: Sun, text: "Joto kali linakuja. Mwagilia mimea asubuhi na mapema au jioni." },
      { icon: Leaf, text: "Msimu wa funza wa mahindi unaanza. Kagua mimea yako mara kwa mara." }
    ]
  },
  rw: {
    title: "Inama z'Igihe",
    subtitle: "Iby'ingenzi muri uku kwezi",
    tips: [
      { icon: CloudRain, text: "Hateganyijwe imvura nyinshi muri iki cyumweru. Kora imiyoboro y'amazi mu birayi." },
      { icon: Sun, text: "Izuba ryinshi riraje. Vomerera ibihingwa mu gitondo cya kare cyangwa nimugoroba." },
      { icon: Leaf, text: "Igihe cy' nanda y'ibigori kiratangiye. Kugenzura imyaka yawe kenshi." }
    ]
  },
  fr: {
    title: "Conseils Saisonniers",
    subtitle: "Aperçus pour ce mois",
    tips: [
      { icon: CloudRain, text: "Fortes pluies prévues cette semaine. Assurez un bon drainage pour vos pommes de terre." },
      { icon: Sun, text: "Fortes chaleurs à venir. Arrosez tôt le matin ou tard le soir." },
      { icon: Leaf, text: "La saison de la pyrale du maïs commence. Vérifiez régulièrement vos plants." }
    ]
  }
};

export function SeasonalAdvisory({ language }: Props) {
  const content = ADVISORY[language];

  return (
    <div className="bg-brand-50/50 rounded-[2rem] p-6 sm:p-8 border border-brand-100 shadow-xl shadow-brand-900/5 transition-all hover:shadow-brand-900/10">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-brand-950">{content.title}</h3>
        <p className="text-brand-900/70">{content.subtitle}</p>
      </div>
      <div className="space-y-4">
        {content.tips.map((tip, idx) => {
          const Icon = tip.icon;
          return (
            <div key={idx} className="flex items-start gap-4 bg-white p-4 rounded-2xl border border-brand-50 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 shrink-0">
                <Icon size={20} />
              </div>
              <p className="text-brand-950 font-medium text-sm leading-relaxed">{tip.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

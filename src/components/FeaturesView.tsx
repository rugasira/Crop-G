import React, { useState, useRef, useEffect } from 'react';
import { MapIcon, CloudSun, Store, ShieldCheck } from 'lucide-react';
import { Language } from '../services/aiService';
import { CommunityHeatmap } from './CommunityHeatmap';
import { WeatherRisk } from './WeatherRisk';
import { SeasonalAdvisory } from './SeasonalAdvisory';
import { Marketplace } from './Marketplace';
import { TrustCenter } from './TrustCenter';

interface FeaturesViewProps {
  language: Language;
}

const TRANSLATIONS = {
  en: {
    features: { map: 'Community', advisory: 'Weather', ecosystem: 'Dealers', trust: 'Trust' }
  },
  sw: {
    features: { map: 'Kijamii', advisory: 'Hali ya Hewa', ecosystem: 'Maduka', trust: 'Uaminifu' }
  },
  rw: {
    features: { map: 'Akarere', advisory: 'Iteganyagihe', ecosystem: 'Amaduka', trust: 'Kwizera' }
  },
  fr: {
    features: { map: 'Carte', advisory: 'Météo', ecosystem: 'Boutiques', trust: 'Confiance' }
  }
};

type FeatureSection = 'map' | 'advisory' | 'ecosystem' | 'trust';

export const FeaturesView: React.FC<FeaturesViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [activeSection, setActiveSection] = useState<FeatureSection>('map');
  
  const mapRef = useRef<HTMLDivElement>(null);
  const advisoryRef = useRef<HTMLDivElement>(null);
  const ecosystemRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  const sections: { id: FeatureSection; ref: React.RefObject<HTMLDivElement>; icon: React.ReactNode }[] = [
    { id: 'map', ref: mapRef, icon: <MapIcon size={18} /> },
    { id: 'advisory', ref: advisoryRef, icon: <CloudSun size={18} /> },
    { id: 'ecosystem', ref: ecosystemRef, icon: <Store size={18} /> },
    { id: 'trust', ref: trustRef, icon: <ShieldCheck size={18} /> },
  ];

  const scrollToSection = (id: FeatureSection) => {
    setActiveSection(id);
    const section = sections.find(s => s.id === id);
    if (section && section.ref.current) {
      const yOffset = -180; // Account for fixed header + local navbar
      const y = section.ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250; // Trigger line
      let currentSectionId: FeatureSection = 'map';
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.ref.current && section.ref.current.offsetTop <= scrollPosition) {
          currentSectionId = section.id;
          break;
        }
      }
      setActiveSection(currentSectionId);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="space-y-12 pb-24 relative">
      {/* Sticky Local Navigation */}
      <div className="sticky top-[72px] sm:top-[80px] z-30 bg-white/90 backdrop-blur-xl border border-brand-100 p-2 rounded-2xl shadow-lg mb-8 flex items-center gap-2 overflow-x-auto hide-scrollbar max-w-3xl mx-auto w-full">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-1 ${
              activeSection === section.id 
                ? 'bg-brand-900 text-white shadow-md scale-105' 
                : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}
          >
            {section.icon}
            {t.features[section.id]}
          </button>
        ))}
      </div>

      <div ref={mapRef} className="scroll-mt-[200px] pt-4">
        <CommunityHeatmap language={language} />
      </div>

      <div ref={advisoryRef} className="space-y-8 scroll-mt-[200px] pt-4">
        <WeatherRisk language={language} />
        <SeasonalAdvisory language={language} />
      </div>

      <div ref={ecosystemRef} className="scroll-mt-[200px] pt-4">
        <Marketplace language={language} />
      </div>

      <div ref={trustRef} className="scroll-mt-[200px] pt-4">
        <TrustCenter language={language} />
      </div>
    </div>
  );
};

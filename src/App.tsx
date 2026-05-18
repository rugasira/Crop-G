import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  AlertCircle, 
  RefreshCw,
  Sprout,
  Globe,
  CloudSun,
  LayoutDashboard,
  ShieldCheck,
  Store,
  Map as MapIcon,
  WifiOff,
  Home as HomeIcon,
  Layers,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Language, AnalysisResult, analyzeCropData, compressImage } from './services/aiService';
import { useHistory, HistoryItem } from './hooks/useHistory';

import { CameraUploader } from './components/CameraUploader';
import { ResultCard } from './components/ResultCard';
import { HistoryList } from './components/HistoryList';
import { Dashboard } from './components/Dashboard';
import { Home } from './components/Home';
import { FeaturesView } from './components/FeaturesView';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TRANSLATIONS = {
  en: {
    welcome: 'Welcome to FarmDiag',
    description: 'The complete agricultural intelligence ecosystem. Scan diseases, predict risks, and connect with experts.',
    askGenius: 'Analyze Crop',
    analyzing: 'Analyzing...',
    offline: "You are offline. Scans will be saved and synced later.",
    tabs: { home: 'Home', diagnosis: 'Scan', dashboard: 'Dashboard', features: 'Features' }
  },
  sw: {
    welcome: 'Karibu FarmDiag',
    description: 'Mfumo kamili wa akili wa kilimo. Chunguza magonjwa, tabiri hatari, na wasiliana na wataalamu.',
    askGenius: 'Chambua Zao',
    analyzing: 'Inachambua...',
    offline: "Uko nje ya mtandao. Skana zitahifadhiwa na kusawazishwa baadaye.",
    tabs: { home: 'Mwanzo', diagnosis: 'Skana', dashboard: 'Dashibodi', features: 'Vipengele' }
  },
  rw: {
    welcome: 'Murakaza neza kuri FarmDiag',
    description: 'Urubuga rwuzuye rw\'ubuhinzi. Suzuma indwara, teganya ibyago, kandi uhuze n\'inzobere.',
    askGenius: 'Suzuma Igihingwa',
    analyzing: 'Iri gusuzuma...',
    offline: "Nta internet ufite. Ibyo usuzumye birabikwa bishyirweho nyuma.",
    tabs: { home: 'Ahabanza', diagnosis: 'Suzuma', dashboard: 'Imibare', features: 'Ibiranga' }
  },
  fr: {
    welcome: 'Bienvenue sur FarmDiag',
    description: 'L\'écosystème complet d\'intelligence agricole. Analysez les maladies, prévoyez les risques et connectez-vous avec des experts.',
    askGenius: 'Analyser la culture',
    analyzing: 'Analyse en cours...',
    offline: "Vous êtes hors ligne. Les analyses seront enregistrées et synchronisées plus tard.",
    tabs: { home: 'Accueil', diagnosis: 'Scan', dashboard: 'Tableau', features: 'Fonctionnalités' }
  }
};

type TabType = 'home' | 'diagnosis' | 'dashboard' | 'features';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const { history, addToHistory, isOnline } = useHistory();

  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageChange = (file: File | null, dataUrl: string | null) => {
    setImageFile(file);
    setImageDataUrl(dataUrl);
    setResult(null);
    setError(null);
  };

  const analyzeCrop = async () => {
    if (!imageDataUrl && !description.trim()) {
      setError("Please provide an image or describe the problem.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let finalBase64 = imageDataUrl;
      // Compress image before sending if it's a file
      if (imageFile) {
        finalBase64 = await compressImage(imageFile);
      }

      if (!isOnline) {
        // Mock offline analysis result
        const offlineResult: AnalysisResult = {
          disease: "Pending Offline Sync",
          cause: "Will be analyzed when back online.",
          severity: 'Medium'
        };
        addToHistory({ image: finalBase64 || undefined, description, result: offlineResult });
        setResult(offlineResult);
        setLoading(false);
        return;
      }

      const parsedResult = await analyzeCropData(language, finalBase64, description);
      setResult(parsedResult);
      
      if (!parsedResult.error) {
        addToHistory({
          image: finalBase64 || undefined,
          description,
          result: parsedResult
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setImageDataUrl(item.image || null);
    setImageFile(null); // It's already compressed/base64
    setDescription(item.description);
    setResult(item.result);
    setActiveTab('diagnosis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTabIcon = (tab: TabType) => {
    switch(tab) {
      case 'home': return <HomeIcon size={16} />;
      case 'diagnosis': return <Search size={16} />;
      case 'dashboard': return <LayoutDashboard size={16} />;
      case 'features': return <Layers size={16} />;
    }
  };

  const tabs: TabType[] = ['home', 'diagnosis', 'dashboard', 'features'];
  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'sw', label: 'Swahili' },
    { code: 'rw', label: 'Kinyarwanda' },
    { code: 'fr', label: 'Français' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-brand-50/20 dark:bg-transparent">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-brand-950/90 backdrop-blur-xl border-b border-brand-100 dark:border-brand-900/50 z-50 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          {!logoError ? (
            <motion.img 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              src="/logo.png?v=3" 
              alt="Farm Diag Logo" 
              className="h-10 sm:h-12 w-auto mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:rounded-xl dark:p-1"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-lg shadow-brand-900/20">
              <Sprout size={24} />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-950 dark:text-white hidden sm:block">Farm Diag</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto hide-scrollbar">
          <nav className="flex items-center gap-1 bg-brand-50/50 dark:bg-brand-900/30 p-1 rounded-2xl border border-brand-100 dark:border-brand-800/50">
            {tabs.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap",
                  activeTab === tab 
                    ? "bg-white dark:bg-brand-600 text-brand-900 dark:text-white shadow-md shadow-brand-100/50 dark:shadow-brand-900/50 scale-[1.02]" 
                    : "text-brand-700/70 dark:text-brand-300/70 hover:text-brand-900 dark:hover:text-brand-100"
                )}
              >
                <span className="hidden lg:block">{getTabIcon(tab)}</span>
                {t.tabs[tab]}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-white dark:bg-[#0F2E22] text-brand-600 dark:text-[#10B981] border border-brand-200 dark:border-[#10B981]/20 shadow-sm hover:border-brand-400 dark:hover:border-[#10B981] hover:bg-brand-50 dark:hover:bg-[#10B981]/10 transition-all"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="p-2.5 rounded-xl bg-white dark:bg-[#0F2E22] text-brand-600 dark:text-[#10B981] border border-brand-200 dark:border-[#10B981]/20 shadow-sm hover:border-brand-400 dark:hover:border-[#10B981] hover:bg-brand-50 dark:hover:bg-[#10B981]/10 transition-all"
                aria-label="Toggle Language"
              >
                <Globe size={18} />
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-[#0A1F17] rounded-[16px] shadow-xl dark:shadow-[0_0_40px_rgba(16,185,129,0.1)] border border-brand-100 dark:border-[#10B981]/20 overflow-hidden z-50 flex flex-col py-2"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 text-sm font-bold transition-all flex items-center justify-between",
                          language === lang.code
                            ? "bg-brand-50 dark:bg-[#10B981]/15 text-brand-900 dark:text-[#10B981]"
                            : "text-brand-700 dark:text-[#D1FAE5] hover:bg-brand-50/50 dark:hover:bg-[#0F2E22]"
                        )}
                      >
                        {lang.label}
                        {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-[#10B981]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-[72px] left-0 right-0 z-40 bg-orange-500 text-white text-sm font-bold py-2 text-center flex items-center justify-center gap-2 shadow-md">
          <WifiOff size={16} /> {t.offline}
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 pt-28 pb-24 ${!isOnline ? 'mt-8' : ''}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Home language={language} onScanClick={() => setActiveTab('diagnosis')} />
            </motion.div>
          )}

          {activeTab === 'diagnosis' && (
            <motion.div 
              key="diagnosis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-[#0A1F17] rounded-[24px] p-6 sm:p-10 border border-[#10B981]/15 shadow-[0_0_40px_rgba(16,185,129,0.05)] mt-8 transition-colors">
                <div className="space-y-8">
                  <CameraUploader 
                    language={language}
                    image={imageDataUrl}
                    description={description}
                    onImageChange={handleImageChange}
                    onDescriptionChange={setDescription}
                  />

                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 p-4 rounded-2xl border border-red-100 dark:border-red-800"
                      >
                        <AlertCircle size={20} className="text-red-500 dark:text-red-400" />
                        <p className="text-sm font-sans font-bold">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={analyzeCrop}
                    disabled={loading}
                    className={cn(
                      "w-full flex items-center justify-center gap-3 text-xl font-bold h-16 bg-[#10B981] text-[#0A1F17] rounded-[1.5rem] hover:bg-[#34D399] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#10B981]/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                    )}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={24} className="animate-spin" />
                        <span>{t.analyzing}</span>
                      </>
                    ) : (
                      <>
                        <Search size={24} className="transition-transform group-hover:scale-110" />
                        <span>{t.askGenius}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ResultCard result={result} language={language} image={imageDataUrl || undefined} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <Dashboard history={history} language={language} />
              <HistoryList history={history} language={language} onSelect={loadHistoryItem} />
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div key="features" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <FeaturesView language={language} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="mt-auto py-8 text-center text-brand-900/60 dark:text-brand-100/40 text-sm font-bold font-sans border-t border-brand-100 dark:border-brand-900/50 bg-brand-50/50 dark:bg-brand-950/50 transition-colors">
        <p>&copy; 2026 FarmDiag. All rights reserved.</p>
      </footer>
    </div>
  );
}

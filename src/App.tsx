import React, { useState } from 'react';
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
  Layers
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
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const { history, addToHistory, isOnline } = useHistory();

  const t = TRANSLATIONS[language];

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

  return (
    <div className="min-h-screen flex flex-col bg-brand-50/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-brand-100 z-50 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {!logoError ? (
            <motion.img 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              src="/logo.png" 
              alt="Farm Diag Logo" 
              className="h-10 sm:h-12 w-auto mix-blend-multiply"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-lg shadow-brand-900/20">
              <Sprout size={24} />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-950 hidden sm:block">Farm Diag</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto hide-scrollbar">
          <nav className="flex items-center gap-1 bg-brand-50/50 p-1 rounded-2xl border border-brand-100">
            {tabs.map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap",
                  activeTab === tab ? "bg-white text-brand-900 shadow-md shadow-brand-100/50 scale-[1.02]" : "text-brand-700/70 hover:text-brand-900"
                )}
              >
                <span className="hidden lg:block">{getTabIcon(tab)}</span>
                {t.tabs[tab]}
              </button>
            ))}
          </nav>

          <div className="relative flex items-center gap-2 bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-brand-200 shadow-sm hover:border-brand-400 transition-colors shrink-0">
            <Globe size={16} className="text-brand-600 hidden sm:block" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs sm:text-sm font-bold font-sans text-brand-900 focus:outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="sw">SW</option>
              <option value="rw">RW</option>
              <option value="fr">FR</option>
            </select>
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
              <Home onScanClick={() => setActiveTab('diagnosis')} />
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
              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 border border-brand-100 shadow-2xl shadow-brand-900/5 mt-8">
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
                        className="flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-2xl border border-red-100"
                      >
                        <AlertCircle size={20} className="text-red-500" />
                        <p className="text-sm font-sans font-bold">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    onClick={analyzeCrop}
                    disabled={loading}
                    className={cn(
                      "w-full flex items-center justify-center gap-3 text-xl font-bold h-16 bg-brand-900 text-white rounded-[1.5rem] hover:bg-brand-950 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-900/20 disabled:opacity-50 disabled:cursor-not-allowed group"
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
    </div>
  );
}

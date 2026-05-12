import React, { useState } from 'react';
import { 
  Search, 
  AlertCircle, 
  RefreshCw,
  Sprout,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Language, AnalysisResult, analyzeCropData, compressImage } from './services/aiService';
import { useHistory, HistoryItem } from './hooks/useHistory';

import { CameraUploader } from './components/CameraUploader';
import { ResultCard } from './components/ResultCard';
import { HistoryList } from './components/HistoryList';
import { SeasonalAdvisory } from './components/SeasonalAdvisory';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TRANSLATIONS = {
  en: {
    welcome: 'Welcome to FarmDiag',
    description: 'Protect your harvest with AI-powered disease detection. Simply snap a photo or describe the symptoms to get instant, practical advice.',
    askGenius: 'Analyze Crop',
    analyzing: 'Analyzing...',
    tabs: { diagnosis: 'Diagnosis', history: 'History', advisory: 'Advisory' }
  },
  sw: {
    welcome: 'Karibu FarmDiag',
    description: 'Linda mavuno yako kwa utambuzi wa magonjwa unaoendeshwa na AI. Piga picha tu au ueleze dalili ili upate ushauri wa papo hapo.',
    askGenius: 'Chambua Zao',
    analyzing: 'Inachambua...',
    tabs: { diagnosis: 'Isuzumwa', history: 'Historia', advisory: 'Ushauri' }
  },
  rw: {
    welcome: 'Murakaza neza kuri FarmDiag',
    description: 'Rinda umusaruro wawe ukoresheje ikoranabuhanga rya AI rimenya indwara. Fata ifoto cyangwa usobanure ibimenyetso kugira ngo ubone inama z’ako kanya.',
    askGenius: 'Suzuma Igihingwa',
    analyzing: 'Iri gusuzuma...',
    tabs: { diagnosis: 'Isuzumwa', history: 'Amateka', advisory: 'Inama' }
  },
  fr: {
    welcome: 'Bienvenue sur FarmDiag',
    description: 'Protégez votre récolte grâce à la détection des maladies par IA. Prenez une photo ou décrivez les symptômes pour obtenir des conseils pratiques instantanés.',
    askGenius: 'Analyser la culture',
    analyzing: 'Analyse en cours...',
    tabs: { diagnosis: 'Diagnostic', history: 'Historique', advisory: 'Conseils' }
  }
};

type TabType = 'diagnosis' | 'history' | 'advisory';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<TabType>('diagnosis');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const { history, addToHistory } = useHistory();

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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-brand-100 z-50 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {!logoError ? (
            <motion.img 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              src="/logo.png" 
              alt="Farm Diag Logo" 
              className="h-12 w-auto mix-blend-multiply"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center text-white shadow-lg shadow-brand-900/20">
              <Sprout size={24} />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-950">Farm Diag</h1>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-1 bg-brand-50/50 p-1 rounded-2xl border border-brand-100">
            {(['diagnosis', 'history', 'advisory'] as TabType[]).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                  activeTab === tab ? "bg-white text-brand-900 shadow-md shadow-brand-100/50 scale-[1.02]" : "text-brand-700/70 hover:text-brand-900"
                )}
              >
                {t.tabs[tab]}
              </button>
            ))}
          </nav>

          <div className="relative flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-brand-200 shadow-sm hover:border-brand-400 transition-colors">
            <Globe size={16} className="text-brand-600" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-sm font-bold font-sans text-brand-900 focus:outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="sw">SW</option>
              <option value="rw">RW</option>
              <option value="fr">FR</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 pt-28 pb-24">
        {/* Mobile Tab Switcher */}
        <div className="md:hidden mb-10 flex justify-center">
          <div className="flex items-center gap-1 bg-brand-50/50 p-1.5 rounded-2xl border border-brand-100 w-full max-w-md">
            {(['diagnosis', 'history', 'advisory'] as TabType[]).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 text-center",
                  activeTab === tab ? "bg-white text-brand-900 shadow-md shadow-brand-100" : "text-brand-700/70 hover:text-brand-900"
                )}
              >
                {t.tabs[tab]}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'diagnosis' && (
            <motion.div 
              key="diagnosis"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight"
                >
                  {t.welcome}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg sm:text-xl text-brand-900/80 font-sans leading-relaxed"
                >
                  {t.description}
                </motion.p>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 border border-brand-100 shadow-2xl shadow-brand-900/5 transition-all hover:shadow-brand-900/10">
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
                    <ResultCard result={result} language={language} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <HistoryList 
                history={history} 
                language={language} 
                onSelect={loadHistoryItem} 
              />
            </motion.div>
          )}

          {activeTab === 'advisory' && (
            <motion.div 
              key="advisory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <SeasonalAdvisory language={language} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

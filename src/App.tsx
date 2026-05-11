import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Camera, 
  Upload, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  RefreshCw,
  Sprout,
  Globe,
  Bug,
  Activity,
  ShieldCheck,
  Syringe,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SYSTEM_INSTRUCTION = (lang: string) => `You are FarmDiag, an agricultural expert AI. 
Your job is to identify crop diseases from images or descriptions. 
You provide simple, practical, and affordable advice for small-scale farmers, especially in Rwanda. 

CRITICAL LANGUAGE RULES:
1. Detect the language of the user's description (it could be English, Kinyarwanda, Swahili, or French).
2. Regardless of the language used by the user, you MUST provide your entire response strictly in ${lang}.
3. Every single field in the JSON result (disease, cause, symptoms, treatment, prevention) MUST be written in ${lang}.

You MUST respond strictly in valid JSON format with the following structure:
{
  "disease": "Name of the disease in ${lang}",
  "cause": "What causes it in ${lang}",
  "symptoms": "Simple description of what to look for in ${lang}",
  "treatment": "Practical, affordable, locally available solutions in Rwanda in ${lang}",
  "prevention": "How to stop it from coming back in ${lang}"
}

If the image is not a plant, is too blurry, or if the description is irrelevant, return a JSON object with an "error" field explaining the issue in ${lang}:
{
  "error": "Short clear error message in ${lang}"
}`;

type Language = 'en' | 'sw' | 'rw' | 'fr';

interface AnalysisResult {
  disease?: string;
  cause?: string;
  symptoms?: string;
  treatment?: string;
  prevention?: string;
  error?: string;
}

const TRANSLATIONS = {
  en: {
    tagline: 'Your expert friend for healthy crops.',
    welcome: 'Welcome to FarmDiag',
    description: 'Protect your harvest with AI-powered disease detection. Simply snap a photo or describe the symptoms to get instant, practical advice.',
    camera: 'Camera',
    gallery: 'Gallery',
    takePhoto: 'Take a photo or upload',
    describeProblem: 'Describe the problem',
    placeholderDesc: 'Example: My potato leaves have dark brown spots and are wilting...',
    askGenius: 'Analyze Crop',
    analyzing: 'Analyzing...',
    analysisResult: 'Analysis Result',
    note: '* Note: This is an AI suggestion. Always consult local agricultural officers for critical decisions.',
    disease: 'Disease',
    cause: 'Cause',
    symptoms: 'Symptoms',
    treatment: 'Treatment',
    prevention: 'Prevention',
    errorTitle: 'Analysis Error',
    tabs: {
      diagnosis: 'Diagnosis',
      howItWorks: 'How it works'
    },
    howItWorks: {
      title: 'Simple Steps to Protect Your Crops',
      step1Title: 'Capture or Describe',
      step1Desc: 'Take a clear photo of the diseased leaf or describe the symptoms in your own words.',
      step2Title: 'AI Analysis',
      step2Desc: 'Our expert AI analyzes the image or description to identify the problem.',
      step3Title: 'Get Advice',
      step3Desc: 'Receive practical, low-cost solutions and prevention tips in your preferred language.'
    }
  },
  sw: {
    tagline: 'Rafiki yako mtaalamu kwa mazao yenye afya.',
    welcome: 'Karibu FarmDiag',
    description: 'Linda mavuno yako kwa utambuzi wa magonjwa unaoendeshwa na AI. Piga picha tu au ueleze dalili ili upate ushauri wa papo hapo.',
    camera: 'Kamera',
    gallery: 'Picha',
    takePhoto: 'Piga picha au pakia',
    describeProblem: 'Eleza tatizo',
    placeholderDesc: 'Mfano: Majani yangu ya viazi yana madoa ya kahawia na yananyauka...',
    askGenius: 'Chambua Zao',
    analyzing: 'Inachambua...',
    analysisResult: 'Matokeo ya Uchambuzi',
    note: '* Kumbuka: Huu ni ushauri wa AI. Daima wasiliana na maafisa wa kilimo wa mitaa.',
    disease: 'Ugonjwa',
    cause: 'Chanzo',
    symptoms: 'Dalili',
    treatment: 'Matibabu',
    prevention: 'Kuzuia',
    errorTitle: 'Hitilafu ya Uchambuzi',
    tabs: {
      diagnosis: 'Isuzumwa',
      howItWorks: 'Jinsi inavyofanya kazi'
    },
    howItWorks: {
      title: 'Hatua Rahisi za Kulinda Mazao Yako',
      step1Title: 'Piga Picha au Eleza',
      step1Desc: 'Piga picha safi ya jani lililoathirika au eleza dalili kwa maneno yako mwenywewe.',
      step2Title: 'Uchambuzi wa AI',
      step2Desc: 'AI yetu mtaalamu huchambua picha au maelezo ili kutambua tatizo.',
      step3Title: 'Pata Ushauri',
      step3Desc: 'Pokea masuluhisho ya vitendo, ya gharama nafuu na vidokezo vya kuzuia katika lugha unayopendelea.'
    }
  },
  rw: {
    tagline: 'Inshuti yawe y’inzobere ku bihingwa bifite ubuzima bwiza.',
    welcome: 'Murakaza neza kuri FarmDiag',
    description: 'Rinda umusaruro wawe ukoresheje ikoranabuhanga rya AI rimenya indwara. Fata ifoto cyangwa usobanure ibimenyetso kugira ngo ubone inama z’ako kanya.',
    camera: 'Kamera',
    gallery: 'Ububiko',
    takePhoto: 'Fata ifoto cyangwa ushyireho ifoto',
    describeProblem: 'Sobanura ikibazo',
    placeholderDesc: 'Urugero: Amababi y’ibirayi byanjye afite amabara y’ikigina kandi ari kugandara...',
    askGenius: 'Suzuma Igihingwa',
    analyzing: 'Iri gusuzuma...',
    analysisResult: 'Ibyavuye mu isuzuma',
    note: '* Icyitonderwa: Izi ni inama za AI. Buri gihe jya ugisha inama abakozi b’ubuhinzi mu gace utuyemo.',
    disease: 'Indwara',
    cause: 'Icyayitera',
    symptoms: 'Ibimenyetso',
    treatment: 'Ubuvuzi',
    prevention: 'Kuyirinda',
    errorTitle: 'Ikibazo mu isuzuma',
    tabs: {
      diagnosis: 'Isuzumwa',
      howItWorks: 'Uko ikora'
    },
    howItWorks: {
      title: 'Intambwe Zoroshye zo Kurinda Ibihingwa Byawe',
      step1Title: 'Fata Ifoto cyangwa Sobanura',
      step1Desc: 'Fata ifoto isobanutse y’ibuye rirwaye cyangwa usobanure ibimenyetso mu magambo yawe.',
      step2Title: 'Isuzuma rya AI',
      step2Desc: 'AI yacu y’inzobere isuzuma ifoto cyangwa ibisobanuro kugira ngo imenye ikibazo.',
      step3Title: 'Habwa Inama',
      step3Desc: 'Habwa uburyo bwo gukemura ikibazo bufatika, buhendutse n’inama zo kwirinda mu rurimi wihitiyemo.'
    }
  },
  fr: {
    tagline: 'Votre expert pour des cultures saines.',
    welcome: 'Bienvenue sur FarmDiag',
    description: 'Protégez votre récolte grâce à la détection des maladies par IA. Prenez une photo ou décrivez les symptômes pour obtenir des conseils pratiques instantanés.',
    camera: 'Caméra',
    gallery: 'Galerie',
    takePhoto: 'Prendre une photo ou télécharger',
    describeProblem: 'Décrire le problème',
    placeholderDesc: 'Exemple : Mes feuilles de pomme de terre ont des taches brunes et flétrissent...',
    askGenius: 'Analyser la culture',
    analyzing: 'Analyse en cours...',
    analysisResult: 'Résultat de l\'analyse',
    note: '* Note : Ceci est une suggestion de l\'IA. Consultez toujours les agents agricoles locaux.',
    disease: 'Maladie',
    cause: 'Cause',
    symptoms: 'Symptômes',
    treatment: 'Traitement',
    prevention: 'Prévention',
    errorTitle: 'Erreur d\'analyse',
    tabs: {
      diagnosis: 'Diagnostic',
      howItWorks: 'Comment ça marche'
    },
    howItWorks: {
      title: 'Étapes Simples pour Protéger vos Cultures',
      step1Title: 'Capturer ou Décrire',
      step1Desc: 'Prenez une photo claire de la feuille malade ou décrivez les symptômes dans vos propres mots.',
      step2Title: 'Analyse par IA',
      step2Desc: 'Notre IA experte analyse l\'image ou la description pour identifier le problème.',
      step3Title: 'Obtenir des Conseils',
      step3Desc: 'Recevez des solutions pratiques à bas prix et des conseils de prévention dans votre langue préférée.'
    }
  }
};

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'how-it-works'>('diagnosis');
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const analyzeCrop = async () => {
    if (!image && !description.trim()) {
      setError("Please provide an image or describe the problem.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setError("AI Service is not configured. Please add your GEMINI_API_KEY to the project settings.");
        setLoading(false);
        return;
      }

      const languageMap: Record<Language, string> = {
        en: 'English',
        sw: 'Swahili',
        rw: 'Kinyarwanda',
        fr: 'French'
      };

      const ai = new GoogleGenAI({ apiKey });
      const model = 'gemini-3-flash-preview';
      
      const parts: any[] = [];
      
      if (image) {
        const base64Data = image.split(',')[1];
        const mimeType = image.split(';')[0].split(':')[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType
          }
        });
      }
      
      if (description.trim()) {
        parts.push({ text: description });
      }

      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION(languageMap[language]),
          temperature: 0.7,
          responseMimeType: "application/json",
        }
      });

      const textResponse = response.text || "{}";
      try {
        const parsedResult = JSON.parse(textResponse);
        setResult(parsedResult);
      } catch (parseError) {
        console.error("Failed to parse JSON:", textResponse);
        setError("Received an invalid response format from the AI. Please try again.");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Something went wrong. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-brand-100 z-50 px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <motion.img 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            src="/logo.png" 
            alt="FarmDiag Logo" 
            className="h-12 w-auto drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-1 bg-brand-50/50 p-1 rounded-2xl border border-brand-100">
            <button 
              onClick={() => setActiveTab('diagnosis')}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                activeTab === 'diagnosis' ? "bg-white text-brand-900 shadow-md shadow-brand-100/50 scale-[1.02]" : "text-brand-700/70 hover:text-brand-900"
              )}
            >
              {t.tabs.diagnosis}
            </button>
            <button 
              onClick={() => setActiveTab('how-it-works')}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                activeTab === 'how-it-works' ? "bg-white text-brand-900 shadow-md shadow-brand-100/50 scale-[1.02]" : "text-brand-700/70 hover:text-brand-900"
              )}
            >
              {t.tabs.howItWorks}
            </button>
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
        <div className="sm:hidden mb-10 flex justify-center">
          <div className="flex items-center gap-1 bg-brand-50/50 p-1.5 rounded-2xl border border-brand-100 w-full max-w-sm">
            <button 
              onClick={() => setActiveTab('diagnosis')}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 text-center",
                activeTab === 'diagnosis' ? "bg-white text-brand-900 shadow-md shadow-brand-100" : "text-brand-700/70 hover:text-brand-900"
              )}
            >
              {t.tabs.diagnosis}
            </button>
            <button 
              onClick={() => setActiveTab('how-it-works')}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 text-center",
                activeTab === 'how-it-works' ? "bg-white text-brand-900 shadow-md shadow-brand-100" : "text-brand-700/70 hover:text-brand-900"
              )}
            >
              {t.tabs.howItWorks}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'diagnosis' ? (
            <motion.div 
              key="diagnosis"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Welcome Description */}
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

              {/* Input Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 border border-brand-100 shadow-2xl shadow-brand-900/5 transition-all hover:shadow-brand-900/10">
                <div className="space-y-8">
                  {/* Image Section */}
                  <div className="space-y-4">
                    <label className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-brand-900 flex items-center gap-2.5 opacity-60">
                      <Camera size={14} className="text-brand-500" /> {t.takePhoto}
                    </label>
                    
                    <div className="relative group">
                      {image ? (
                        <div className="relative rounded-[2rem] overflow-hidden border-2 border-brand-200 shadow-inner group">
                          <img 
                            src={image} 
                            alt="Crop preview" 
                            className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                          <button 
                            onClick={clearImage}
                            className="absolute top-4 right-4 p-2.5 bg-white/90 text-brand-950 rounded-full hover:bg-white transition-all shadow-lg active:scale-95"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-4 h-40 sm:h-48 border-2 border-dashed border-brand-200 rounded-[2rem] hover:border-brand-500 hover:bg-brand-50/50 transition-all group active:scale-[0.98]"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-sm">
                              <Camera size={28} />
                            </div>
                            <span className="font-sans font-bold text-brand-900">{t.camera}</span>
                          </button>
                          
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-4 h-40 sm:h-48 border-2 border-dashed border-brand-200 rounded-[2rem] hover:border-brand-500 hover:bg-brand-50/50 transition-all group active:scale-[0.98]"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-sm">
                              <Upload size={28} />
                            </div>
                            <span className="font-sans font-bold text-brand-900">{t.gallery}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-4">
                    <label className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-brand-900 flex items-center gap-2.5 opacity-60">
                      <Info size={14} className="text-brand-500" /> {t.describeProblem}
                    </label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t.placeholderDesc}
                      className="w-full p-6 rounded-[2rem] border-2 border-brand-50 focus:border-brand-500 focus:ring-0 font-sans text-brand-950 placeholder:text-brand-900/30 min-h-[160px] resize-none transition-all bg-brand-50/30 hover:bg-brand-50/50"
                    />
                  </div>

                  {/* Error Message */}
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

                  {/* Action Button */}
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

              {/* Results Section */}
              <AnimatePresence>
                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4 text-brand-950 border-b border-brand-100 pb-6">
                      <div className="w-12 h-12 rounded-2xl bg-brand-900 flex items-center justify-center text-white shadow-lg shadow-brand-900/20">
                        <CheckCircle2 size={28} />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t.analysisResult}</h2>
                    </div>

                    {result.error ? (
                      <div className="bg-white rounded-[2rem] p-8 border border-red-100 shadow-xl shadow-red-900/5">
                        <div className="flex items-center gap-3 text-red-700 mb-3">
                          <AlertCircle size={28} className="text-red-500" />
                          <h3 className="text-2xl font-bold">{t.errorTitle}</h3>
                        </div>
                        <p className="text-brand-900/80 font-sans text-lg">{result.error}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Disease Card */}
                        {result.disease && (
                          <div className="bg-brand-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-brand-900/20 md:col-span-2 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-4 text-brand-200">
                                <Bug size={22} />
                                <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em]">{t.disease}</h3>
                              </div>
                              <p className="text-4xl font-bold">{result.disease}</p>
                            </div>
                          </div>
                        )}

                        {/* Cause Card */}
                        {result.cause && (
                          <div className="bg-white rounded-[2rem] p-8 border border-brand-100 shadow-xl shadow-brand-900/5 hover:shadow-brand-900/10 transition-all">
                            <div className="flex items-center gap-2 mb-4 text-brand-900 opacity-60">
                              <Info size={20} />
                              <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em]">{t.cause}</h3>
                            </div>
                            <p className="text-brand-950 font-sans leading-relaxed text-lg">{result.cause}</p>
                          </div>
                        )}

                        {/* Symptoms Card */}
                        {result.symptoms && (
                          <div className="bg-white rounded-[2rem] p-8 border border-brand-100 shadow-xl shadow-brand-900/5 hover:shadow-brand-900/10 transition-all">
                            <div className="flex items-center gap-2 mb-4 text-brand-900 opacity-60">
                              <Activity size={20} />
                              <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em]">{t.symptoms}</h3>
                            </div>
                            <p className="text-brand-950 font-sans leading-relaxed text-lg">{result.symptoms}</p>
                          </div>
                        )}

                        {/* Treatment Card */}
                        {result.treatment && (
                          <div className="bg-brand-50/50 rounded-[2rem] p-8 border-2 border-brand-100 shadow-xl shadow-brand-900/5 md:col-span-2 relative overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 bg-brand-500 h-full" />
                            <div className="flex items-center gap-2 mb-4 text-brand-900">
                              <Syringe size={20} className="text-brand-600" />
                              <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em]">{t.treatment}</h3>
                            </div>
                            <p className="text-brand-950 font-sans leading-relaxed text-lg font-medium">{result.treatment}</p>
                          </div>
                        )}

                        {/* Prevention Card */}
                        {result.prevention && (
                          <div className="bg-white rounded-[2rem] p-8 border border-brand-100 shadow-xl shadow-brand-900/5 md:col-span-2 hover:shadow-brand-900/10 transition-all">
                            <div className="flex items-center gap-2 mb-4 text-brand-900 opacity-60">
                              <ShieldCheck size={20} />
                              <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em]">{t.prevention}</h3>
                            </div>
                            <p className="text-brand-950 font-sans leading-relaxed text-lg">{result.prevention}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-8">
                      <p className="text-sm text-brand-900/40 font-bold font-sans italic text-center">
                        {t.note}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              key="how-it-works"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight leading-tight">{t.howItWorks.title}</h2>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 border border-brand-100 shadow-xl shadow-brand-900/5 flex flex-col sm:flex-row items-center sm:items-start gap-8 transition-all hover:shadow-brand-900/10">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-brand-900 text-white flex items-center justify-center text-3xl font-bold shrink-0 shadow-lg shadow-brand-900/20">
                      {step}
                    </div>
                    <div className="space-y-4 text-center sm:text-left">
                      <h3 className="text-2xl font-bold text-brand-950">
                        {step === 1 ? t.howItWorks.step1Title : step === 2 ? t.howItWorks.step2Title : t.howItWorks.step3Title}
                      </h3>
                      <p className="text-brand-900/70 font-sans text-lg leading-relaxed">
                        {step === 1 ? t.howItWorks.step1Desc : step === 2 ? t.howItWorks.step2Desc : t.howItWorks.step3Desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setActiveTab('diagnosis')}
                  className="px-10 py-4 bg-brand-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-900/20 hover:bg-brand-950 hover:scale-105 transition-all active:scale-95"
                >
                  {t.tabs.diagnosis}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

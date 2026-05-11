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

CRITICAL: 
1. Detect the language of the user's description.
2. Even if the user writes in a different language, you MUST respond strictly in ${lang}.
3. All fields in the JSON response MUST be translated to ${lang}.

You MUST respond strictly in valid JSON format with the following structure:
{
  "disease": "Name of the disease in ${lang}",
  "cause": "What causes it in ${lang}",
  "symptoms": "Simple description in ${lang}",
  "treatment": "Practical, affordable, locally available solutions in Rwanda in ${lang}",
  "prevention": "How to stop it from coming back in ${lang}"
}

If the image is not a plant or is too blurry, return a JSON object with an "error" field explaining the issue in ${lang}:
{
  "error": "Short error message in ${lang}"
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
      if (!apiKey) throw new Error("API key is missing");

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
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-green-100 z-50 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-md shadow-green-100">
            <Sprout size={24} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">FarmDiag</h1>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-1 bg-green-50 p-1 rounded-xl border border-green-100">
            <button 
              onClick={() => setActiveTab('diagnosis')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                activeTab === 'diagnosis' ? "bg-white text-green-700 shadow-sm" : "text-green-600 hover:text-green-700"
              )}
            >
              {t.tabs.diagnosis}
            </button>
            <button 
              onClick={() => setActiveTab('how-it-works')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                activeTab === 'how-it-works' ? "bg-white text-green-700 shadow-sm" : "text-green-600 hover:text-green-700"
              )}
            >
              {t.tabs.howItWorks}
            </button>
          </nav>

          <div className="relative flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-green-200 shadow-sm">
            <Globe size={16} className="text-green-600" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-sm font-bold font-sans text-black focus:outline-none cursor-pointer"
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
        <div className="sm:hidden mb-6 flex justify-center">
          <div className="flex items-center gap-1 bg-green-50 p-1 rounded-xl border border-green-100 w-full max-w-sm">
            <button 
              onClick={() => setActiveTab('diagnosis')}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all text-center",
                activeTab === 'diagnosis' ? "bg-white text-green-700 shadow-sm" : "text-green-600 hover:text-green-700"
              )}
            >
              {t.tabs.diagnosis}
            </button>
            <button 
              onClick={() => setActiveTab('how-it-works')}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all text-center",
                activeTab === 'how-it-works' ? "bg-white text-green-700 shadow-sm" : "text-green-600 hover:text-green-700"
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
                <h2 className="text-3xl sm:text-4xl font-bold text-black leading-tight">{t.welcome}</h2>
                <p className="text-base sm:text-lg text-black font-sans leading-relaxed">
                  {t.description}
                </p>
              </div>

              {/* Input Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-100 shadow-xl shadow-green-50">
                <div className="space-y-6">
                  {/* Image Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-sans font-semibold uppercase tracking-wider text-black flex items-center gap-2">
                      <Camera size={16} className="text-green-600" /> {t.takePhoto}
                    </label>
                    
                    <div className="relative group">
                      {image ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-green-200">
                          <img 
                            src={image} 
                            alt="Crop preview" 
                            className="w-full h-64 object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            onClick={clearImage}
                            className="absolute top-3 right-3 p-2 bg-white/90 text-black rounded-full hover:bg-white transition-colors shadow-sm"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => cameraInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-3 h-32 sm:h-40 border-2 border-dashed border-green-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                              <Camera size={24} />
                            </div>
                            <span className="font-sans font-medium text-black">{t.camera}</span>
                          </button>
                          
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center gap-3 h-32 sm:h-40 border-2 border-dashed border-green-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                              <Upload size={24} />
                            </div>
                            <span className="font-sans font-medium text-black">{t.gallery}</span>
                          </button>
                        </div>
                      )}
                      
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        ref={cameraInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-sans font-semibold uppercase tracking-wider text-black flex items-center gap-2">
                      <Info size={16} className="text-green-600" /> {t.describeProblem}
                    </label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t.placeholderDesc}
                      className="w-full p-4 rounded-2xl border-2 border-green-100 focus:border-green-400 focus:ring-0 font-sans text-black placeholder:text-black/40 min-h-[120px] resize-none transition-colors bg-white"
                    />
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 text-black bg-green-50 p-3 rounded-xl border border-green-200"
                      >
                        <AlertCircle size={18} className="text-green-600" />
                        <p className="text-sm font-sans font-medium">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action Button */}
                  <button 
                    onClick={analyzeCrop}
                    disabled={loading}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 text-lg font-semibold h-14 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all shadow-md shadow-green-200",
                      loading && "opacity-80 cursor-not-allowed"
                    )}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        <span>{t.analyzing}</span>
                      </>
                    ) : (
                      <>
                        <Search size={20} />
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3 text-black border-b border-green-100 pb-4">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                        <CheckCircle2 size={24} />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold">{t.analysisResult}</h2>
                    </div>

                    {result.error ? (
                      <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
                        <div className="flex items-center gap-3 text-black mb-2">
                          <AlertCircle size={24} className="text-green-600" />
                          <h3 className="text-xl font-bold">{t.errorTitle}</h3>
                        </div>
                        <p className="text-black font-sans">{result.error}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Disease Card */}
                        {result.disease && (
                          <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm md:col-span-2 border-l-4 border-l-green-500">
                            <div className="flex items-center gap-2 mb-3 text-black">
                              <Bug size={20} className="text-green-600" />
                              <h3 className="text-sm font-sans font-bold uppercase tracking-wider">{t.disease}</h3>
                            </div>
                            <p className="text-2xl font-bold text-black">{result.disease}</p>
                          </div>
                        )}

                        {/* Cause Card */}
                        {result.cause && (
                          <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-black">
                              <Info size={20} className="text-green-600" />
                              <h3 className="text-sm font-sans font-bold uppercase tracking-wider">{t.cause}</h3>
                            </div>
                            <p className="text-black font-sans leading-relaxed">{result.cause}</p>
                          </div>
                        )}

                        {/* Symptoms Card */}
                        {result.symptoms && (
                          <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-black">
                              <Activity size={20} className="text-green-600" />
                              <h3 className="text-sm font-sans font-bold uppercase tracking-wider">{t.symptoms}</h3>
                            </div>
                            <p className="text-black font-sans leading-relaxed">{result.symptoms}</p>
                          </div>
                        )}

                        {/* Treatment Card */}
                        {result.treatment && (
                          <div className="bg-white rounded-2xl p-6 border-2 border-green-100 shadow-sm md:col-span-2">
                            <div className="flex items-center gap-2 mb-3 text-black">
                              <Syringe size={20} className="text-green-600" />
                              <h3 className="text-sm font-sans font-bold uppercase tracking-wider">{t.treatment}</h3>
                            </div>
                            <p className="text-black font-sans leading-relaxed">{result.treatment}</p>
                          </div>
                        )}

                        {/* Prevention Card */}
                        {result.prevention && (
                          <div className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm md:col-span-2">
                            <div className="flex items-center gap-2 mb-3 text-black">
                              <ShieldCheck size={20} className="text-green-600" />
                              <h3 className="text-sm font-sans font-bold uppercase tracking-wider">{t.prevention}</h3>
                            </div>
                            <p className="text-black font-sans leading-relaxed">{result.prevention}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-6">
                      <p className="text-sm text-black font-bold font-sans italic opacity-80 text-center">
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
              className="space-y-8"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-black leading-tight">{t.howItWorks.title}</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="bg-white rounded-3xl p-8 border border-green-100 shadow-lg shadow-green-50 flex items-start gap-6">
                    <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                      {step}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-black">
                        {step === 1 ? t.howItWorks.step1Title : step === 2 ? t.howItWorks.step2Title : t.howItWorks.step3Title}
                      </h3>
                      <p className="text-black/70 font-sans leading-relaxed">
                        {step === 1 ? t.howItWorks.step1Desc : step === 2 ? t.howItWorks.step2Desc : t.howItWorks.step3Desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setActiveTab('diagnosis')}
                  className="px-8 py-3 bg-green-600 text-white rounded-full font-bold shadow-md shadow-green-100 hover:bg-green-700 transition-all"
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

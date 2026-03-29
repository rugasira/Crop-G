/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Leaf, 
  Camera, 
  Upload, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  RefreshCw,
  ChevronRight,
  Info,
  Sprout,
  Home,
  ShoppingBag,
  User,
  HelpCircle,
  MapPin,
  Phone,
  Star,
  ArrowRight,
  ExternalLink,
  Map as MapIcon,
  Activity,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SYSTEM_INSTRUCTION = `You are Crop Genius, an agricultural expert AI. 
Your job is to identify crop diseases from images or descriptions. 
You provide simple, practical, and affordable advice for small-scale farmers, especially in Rwanda. 
Use simple English. 
Format your answer clearly with these exact sections:
- Disease: [Name of the disease]
- Cause: [What causes it]
- Symptoms: [Simple description of what to look for]
- Treatment: [Practical, affordable, locally available solutions in Rwanda]
- Prevention: [How to stop it from coming back]

Be encouraging and helpful. If the image is not a plant or is too blurry, politely ask for a better photo.`;

type Tab = 'diagnosis' | 'marketplace' | 'profile' | 'about';
type Language = 'en' | 'sw' | 'rw' | 'fr';
type Theme = 'light' | 'dark';

const TRANSLATIONS = {
  en: {
    home: 'Home',
    shop: 'Shop',
    profile: 'Profile',
    about: 'About',
    tagline: 'Your expert friend for healthy crops.',
    welcome: 'Welcome to Crop Genius',
    description: 'Protect your harvest with AI-powered disease detection. Simply snap a photo or describe the symptoms to get instant, practical advice tailored for Rwandan farmers.',
    camera: 'Camera',
    gallery: 'Gallery',
    takePhoto: 'Take a photo or upload',
    describeProblem: 'Describe the problem',
    placeholderDesc: 'Example: My potato leaves have dark brown spots and are wilting...',
    askGenius: 'Ask Crop Genius',
    analyzing: 'Analyzing...',
    marketplace: 'Marketplace',
    marketTagline: 'Find the best treatments for your crops',
    searchPlaceholder: 'Search pesticides, fertilizers, insecticides...',
    buyNow: 'Buy Now',
    needHelp: 'Need expert help?',
    helpDesk: 'Call our agricultural help desk for free advice on which products to use.',
    myProfile: 'My Profile',
    totalScans: 'Total Scans',
    healthScore: 'Health Score',
    recentActivity: 'Recent Activity',
    aboutTitle: 'About Crop Genius',
    whatIsIt: 'What is Crop Genius?',
    whatIsItDesc: 'Crop Genius is your digital agricultural expert. We use advanced AI to help small-scale farmers in Rwanda identify crop diseases instantly and provide practical, affordable solutions that work in your local context.',
    howItWorks: 'How it works',
    step1Title: 'Take a Photo',
    step1Desc: 'Snap a clear photo of the affected leaf or describe the symptoms in the app.',
    step2Title: 'AI Analysis',
    step2Desc: 'Our AI analyzes the image to identify the disease and its cause.',
    step3Title: 'Get Advice',
    step3Desc: 'Receive simple instructions for treatment and future prevention.',
    step4Title: 'Shop Solutions',
    step4Desc: 'Find and buy the recommended treatments directly from our marketplace.',
    mission: 'Our Mission',
    missionDesc: '"To empower every small-scale farmer in Rwanda with the knowledge and tools they need to ensure a healthy harvest and a food-secure future."',
    startNew: 'Start New Analysis',
    shopRecommended: 'Shop for Recommended Treatments',
    analysisResult: 'Analysis Result',
    note: '* Note: This is an AI suggestion. Always consult local agricultural officers for critical decisions.',
    mapTitle: 'Rwanda Disease Map',
    mapTagline: 'Real-time regional health monitoring',
    liveAlerts: 'Live Alerts'
  },
  sw: {
    home: 'Nyumbani',
    shop: 'Duka',
    profile: 'Wasifu',
    about: 'Kuhusu',
    tagline: 'Rafiki yako mtaalamu kwa mazao yenye afya.',
    welcome: 'Karibu Crop Genius',
    description: 'Linda mavuno yako kwa utambuzi wa magonjwa unaoendeshwa na AI. Piga picha tu au ueleze dalili ili upate ushauri wa papo hapo, wa vitendo uliolengwa kwa wakulima wa Rwanda.',
    camera: 'Kamera',
    gallery: 'Picha',
    takePhoto: 'Piga picha au pakia',
    describeProblem: 'Eleza tatizo',
    placeholderDesc: 'Mfano: Majani yangu ya viazi yana madoa ya kahawia na yananyauka...',
    askGenius: 'Uliza Crop Genius',
    analyzing: 'Inachambua...',
    marketplace: 'Soko',
    marketTagline: 'Pata matibabu bora kwa mazao yako',
    searchPlaceholder: 'Tafuta dawa za kuua wadudu, mbolea...',
    buyNow: 'Nunua Sasa',
    needHelp: 'Unahitaji msaada wa mtaalamu?',
    helpDesk: 'Piga simu kwa dawati letu la msaada wa kilimo kwa ushauri wa bure.',
    myProfile: 'Wasifu Wangu',
    totalScans: 'Jumla ya Skana',
    healthScore: 'Alama ya Afya',
    recentActivity: 'Shughuli za Hivi Karibuni',
    aboutTitle: 'Kuhusu Crop Genius',
    whatIsIt: 'Crop Genius ni nini?',
    whatIsItDesc: 'Crop Genius ni mtaalamu wako wa kilimo wa kidijitali. Tunatumia AI ya hali ya juu kusaidia wakulima wadogo nchini Rwanda kutambua magonjwa ya mazao papo hapo.',
    howItWorks: 'Jinsi inavyofanya kazi',
    step1Title: 'Piga Picha',
    step1Desc: 'Piga picha wazi ya jani lililoathirika au ueleze dalili kwenye programu.',
    step2Title: 'Uchambuzi wa AI',
    step2Desc: 'AI yetu inachambua picha ili kutambua ugonjwa na chanzo chake.',
    step3Title: 'Pata Ushauri',
    step3Desc: 'Pokea maelekezo rahisi ya matibabu na kuzuia katika siku zijazo.',
    step4Title: 'Nunua Suluhisho',
    step4Desc: 'Pata na ununue matibabu yaliyopendekezwa moja kwa moja kutoka soko letu.',
    mission: 'Ujumbe Wetu',
    missionDesc: '"Kuwezesha kila mkulima mdogo nchini Rwanda kwa maarifa na zana wanazohitaji."',
    startNew: 'Anza Uchambuzi Mpya',
    shopRecommended: 'Nunua Matibabu Yanayopendekezwa',
    analysisResult: 'Matokeo ya Uchambuzi',
    note: '* Kumbuka: Huu ni ushauri wa AI. Daima wasiliana na maafisa wa kilimo wa mitaa.',
    mapTitle: 'Ramani ya Magonjwa Rwanda',
    mapTagline: 'Ufuatiliaji wa afya ya kikanda kwa wakati halisi',
    liveAlerts: 'Tahadhari za Moja kwa Moja'
  },
  rw: {
    home: 'Ahabanza',
    shop: 'Isoko',
    profile: 'Umwirondoro',
    about: 'Ibyerekeye',
    tagline: 'Inshuti yawe y’inzobere ku bihingwa bifite ubuzima bwiza.',
    welcome: 'Murakaza neza kuri Crop Genius',
    description: 'Rinda umusaruro wawe ukoresheje ikoranabuhanga rya AI rimenya indwara. Fata ifoto cyangwa usobanure ibimenyetso kugira ngo ubone inama z’ako kanya zigenewe abahinzi b’Abanyarwanda.',
    camera: 'Kamera',
    gallery: 'Ububiko',
    takePhoto: 'Fata ifoto cyangwa ushyireho ifoto',
    describeProblem: 'Sobanura ikibazo',
    placeholderDesc: 'Urugero: Amababi y’ibirayi byanjye afite amabara y’ikigina kandi ari kugandara...',
    askGenius: 'Baza Crop Genius',
    analyzing: 'Iri gusuzuma...',
    marketplace: 'Isoko',
    marketTagline: 'Shaka imiti myiza y’ibihingwa byawe',
    searchPlaceholder: 'Shaka imiti yica udukoko, ifumbire...',
    buyNow: 'Gura ubu',
    needHelp: 'Ukeneye ubufasha bw’inzobere?',
    helpDesk: 'Hamagara ku biro byacu by’ubufasha mu buhinzi kugira ngo uhabwe inama ku buntu.',
    myProfile: 'Umwirondoro wanjye',
    totalScans: 'Ibisuzumwa byose',
    healthScore: 'Amanota y’ubuzima',
    recentActivity: 'Ibyakozwe vuba',
    aboutTitle: 'Ibyerekeye Crop Genius',
    whatIsIt: 'Crop Genius ni iki?',
    whatIsItDesc: 'Crop Genius ni inzobere yawe mu buhinzi mu buryo bw’ikoranabuhanga. Dukoresha AI igezweho kugira ngo dufashe abahinzi bato mu Rwanda kumenya indwara z’ibihingwa.',
    howItWorks: 'Uko ikora',
    step1Title: 'Fata Ifoto',
    step1Desc: 'Fata ifoto isobanutse y’ibabi ryarwaye cyangwa usobanure ibimenyetso muri porogaramu.',
    step2Title: 'Isuzumwa rya AI',
    step2Desc: 'AI yacu isuzuma ifoto kugira ngo imenye indwara n’icyayiteye.',
    step3Title: 'Habwa Inama',
    step3Desc: 'Habwa amabwiriza yoroheje yo kuvura no gukumira indwara mu gihe kizaza.',
    step4Title: 'Gura Imiti',
    step4Desc: 'Shaka kandi ugure imiti yanditswe binyuze ku isoko ryacu.',
    mission: 'Intego yacu',
    missionDesc: '"Guha buri muhinzi muto mu Rwanda ubumenyi n’ibikoresho bakeneye kugira ngo bagire umusaruro mwiza."',
    startNew: 'Tangira isuzuma rishya',
    shopRecommended: 'Gura imiti yanditswe',
    analysisResult: 'Ibyavuye mu isuzuma',
    note: '* Icyitonderwa: Izi ni inama za AI. Buri gihe jya ugisha inama abakozi b’ubuhinzi mu gace utuyemo.',
    mapTitle: 'Ikarita y’indwara mu Rwanda',
    mapTagline: 'Gukurikirana ubuzima bw’ibihingwa mu turere mu gihe nyacyo',
    liveAlerts: 'Impuruza z’ako kanya'
  },
  fr: {
    home: 'Accueil',
    shop: 'Boutique',
    profile: 'Profil',
    about: 'À propos',
    tagline: 'Votre expert pour des cultures saines.',
    welcome: 'Bienvenue sur Crop Genius',
    description: 'Protégez votre récolte grâce à la détection des maladies par IA. Prenez une photo ou décrivez les symptômes pour obtenir des conseils pratiques instantanés pour les agriculteurs rwandais.',
    camera: 'Caméra',
    gallery: 'Galerie',
    takePhoto: 'Prendre une photo ou télécharger',
    describeProblem: 'Décrire le problème',
    placeholderDesc: 'Exemple : Mes feuilles de pomme de terre ont des taches brunes et flétrissent...',
    askGenius: 'Demander à Crop Genius',
    analyzing: 'Analyse en cours...',
    marketplace: 'Marché',
    marketTagline: 'Trouvez les meilleurs traitements pour vos cultures',
    searchPlaceholder: 'Rechercher des pesticides, engrais...',
    buyNow: 'Acheter',
    needHelp: 'Besoin d\'aide d\'un expert ?',
    helpDesk: 'Appelez notre bureau d\'aide agricole pour des conseils gratuits.',
    myProfile: 'Mon Profil',
    totalScans: 'Total des analyses',
    healthScore: 'Score de santé',
    recentActivity: 'Activité récente',
    aboutTitle: 'À propos de Crop Genius',
    whatIsIt: 'Qu\'est-ce que Crop Genius ?',
    whatIsItDesc: 'Crop Genius est votre expert agricole numérique. Nous utilisons l\'IA pour aider les petits agriculteurs au Rwanda à identifier les maladies des cultures.',
    howItWorks: 'Comment ça marche',
    step1Title: 'Prendre une Photo',
    step1Desc: 'Prenez une photo claire de la feuille affectée ou décrivez les symptômes.',
    step2Title: 'Analyse par IA',
    step2Desc: 'Notre IA analyse l\'image pour identifier la maladie et sa cause.',
    step3Title: 'Obtenir des Conseils',
    step3Desc: 'Recevez des instructions simples pour le traitement et la prévention.',
    step4Title: 'Acheter des Solutions',
    step4Desc: 'Trouvez et achetez les traitements recommandés sur notre marché.',
    mission: 'Notre Mission',
    missionDesc: '"Donner à chaque petit agriculteur au Rwanda les connaissances et les outils nécessaires pour une récolte saine."',
    startNew: 'Nouvelle analyse',
    shopRecommended: 'Acheter les traitements',
    analysisResult: 'Résultat de l\'analyse',
    note: '* Note : Ceci est une suggestion de l\'IA. Consultez toujours les agents agricoles locaux.',
    mapTitle: 'Carte des maladies au Rwanda',
    mapTagline: 'Suivi sanitaire régional en temps réel',
    liveAlerts: 'Alertes en direct'
  }
};

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  rating: number;
  description: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Neem Oil Extract',
    category: 'Organic Pesticide',
    price: '8,500 RWF',
    image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=400&h=300&auto=format&fit=crop',
    rating: 4.8,
    description: 'Natural pesticide effective against aphids, mites, and whiteflies.'
  },
  {
    id: '2',
    name: 'Copper Fungicide',
    category: 'Fungicide',
    price: '12,000 RWF',
    image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?q=80&w=400&h=300&auto=format&fit=crop',
    rating: 4.8,
    description: 'Effective against blight and leaf rust. Locally sourced.'
  },
  {
    id: '3',
    name: 'NPK 17-17-17',
    category: 'Fertilizer',
    price: '15,000 RWF',
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?q=80&w=400&h=300&auto=format&fit=crop',
    rating: 4.9,
    description: 'Balanced fertilizer for healthy growth and better yields.'
  },
  {
    id: '4',
    name: 'Organic Compost',
    category: 'Fertilizer',
    price: '5,000 RWF',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=400&h=300&auto=format&fit=crop',
    rating: 4.7,
    description: 'Rich organic compost for soil enrichment and moisture retention.'
  },
  {
    id: '5',
    name: 'Deltamethrin 2.5EC',
    category: 'Insecticide',
    price: '9,500 RWF',
    image: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=400&h=300&auto=format&fit=crop',
    rating: 4.6,
    description: 'Broad-spectrum insecticide for controlling various pests.'
  },
  {
    id: '6',
    name: 'Urea Fertilizer',
    category: 'Fertilizer',
    price: '14,000 RWF',
    image: 'https://images.unsplash.com/photo-1592150621344-c90efc39c91c?q=80&w=400&h=300&auto=format&fit=crop',
    rating: 4.9,
    description: 'High-nitrogen fertilizer for rapid vegetative growth.'
  }
];

const RWANDA_REGIONS = [
  { name: 'Northern Province', disease: 'Potato Late Blight', status: 'High Risk', color: 'bg-red-100 text-red-700' },
  { name: 'Eastern Province', disease: 'Maize Lethal Necrosis', status: 'Moderate', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Western Province', disease: 'Coffee Leaf Rust', status: 'High Risk', color: 'bg-red-100 text-red-700' },
  { name: 'Southern Province', disease: 'Cassava Mosaic Virus', status: 'Stable', color: 'bg-green-100 text-green-700' },
  { name: 'Kigali City', disease: 'Tomato Wilt', status: 'Moderate', color: 'bg-yellow-100 text-yellow-700' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('diagnosis');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [searchTerm, setSearchTerm] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
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
      setError("Please provide a photo or a description of the problem.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3-flash-preview";

      const parts: any[] = [];
      if (description.trim()) {
        parts.push({ text: `Farmer input: ${description}` });
      }
      if (image) {
        const base64Data = image.split(',')[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg"
          }
        });
      }

      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      setResult(response.text || "I couldn't analyze this. Please try again with a clearer photo or description.");
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Something went wrong. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderDiagnosis = () => (
    <div className="space-y-8 pb-24 sm:pb-8">
      {/* Welcome Description */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-2xl mx-auto"
      >
        <h2 className="text-4xl font-bold text-black dark:text-white leading-tight">{t.welcome}</h2>
        <p className="text-lg text-black dark:text-white font-sans leading-relaxed">
          {t.description}
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-6 sm:p-8"
      >
        <div className="space-y-6">
          {/* Image Section */}
          <div className="space-y-3">
            <label className="text-sm font-sans font-semibold uppercase tracking-wider text-earth-500 dark:text-earth-400 flex items-center gap-2">
              <Camera size={16} /> {t.takePhoto}
            </label>
            
            <div className="relative group">
              {image ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-leaf-200">
                  <img 
                    src={image} 
                    alt="Crop preview" 
                    className="w-full h-64 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-3 h-40 border-2 border-dashed border-earth-300 dark:border-earth-700 rounded-2xl hover:border-leaf-400 hover:bg-leaf-50 dark:hover:bg-leaf-900 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-earth-100 dark:bg-earth-800 flex items-center justify-center text-earth-500 dark:text-earth-400 group-hover:bg-leaf-100 group-hover:text-leaf-600 transition-colors">
                      <Camera size={24} />
                    </div>
                    <span className="font-sans font-medium text-earth-600 dark:text-earth-300 group-hover:text-leaf-700">{t.camera}</span>
                  </button>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-3 h-40 border-2 border-dashed border-earth-300 dark:border-earth-700 rounded-2xl hover:border-leaf-400 hover:bg-leaf-50 dark:hover:bg-leaf-900 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-earth-100 dark:bg-earth-800 flex items-center justify-center text-earth-500 dark:text-earth-400 group-hover:bg-leaf-100 group-hover:text-leaf-600 transition-colors">
                      <Upload size={24} />
                    </div>
                    <span className="font-sans font-medium text-earth-600 dark:text-earth-300 group-hover:text-leaf-700">{t.gallery}</span>
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
            <label className="text-sm font-sans font-semibold uppercase tracking-wider text-earth-500 dark:text-earth-400 flex items-center gap-2">
              <Info size={16} /> {t.describeProblem}
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.placeholderDesc}
              className="w-full p-4 rounded-2xl border-2 border-earth-200 dark:border-earth-800 focus:border-leaf-400 focus:ring-0 font-sans text-black dark:text-white placeholder:text-earth-400 min-h-[120px] resize-none transition-colors bg-white dark:bg-earth-900"
            />
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100"
              >
                <AlertCircle size={18} />
                <p className="text-sm font-sans font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <button 
            onClick={analyzeCrop}
            disabled={loading}
            className={cn(
              "olive-button w-full flex items-center justify-center gap-2 text-lg font-semibold h-14",
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
      </motion.div>

      {/* Regional Map Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 sm:p-8 bg-leaf-50 border-2 border-leaf-100"
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Map Visual */}
          <div className="lg:w-1/2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-leaf-500 flex items-center justify-center text-white">
                <MapIcon size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black dark:text-white">{t.mapTitle}</h3>
                <p className="text-sm text-black dark:text-white font-bold font-sans">{t.mapTagline}</p>
              </div>
            </div>
            
            {/* Stylized Rwanda SVG Map */}
            <div className="relative aspect-square max-w-[300px] mx-auto bg-white/50 rounded-3xl p-4 border border-leaf-200">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                {/* Northern Province */}
                <path 
                  d="M30,10 L70,10 L80,30 L20,30 Z" 
                  className="fill-red-200 stroke-red-400 stroke-2 hover:fill-red-300 transition-colors cursor-help"
                />
                {/* Eastern Province */}
                <path 
                  d="M70,10 L90,40 L80,90 L60,90 L50,40 Z" 
                  className="fill-yellow-200 stroke-yellow-400 stroke-2 hover:fill-yellow-300 transition-colors cursor-help"
                />
                {/* Western Province */}
                <path 
                  d="M10,30 L30,30 L50,40 L40,90 L10,80 Z" 
                  className="fill-red-200 stroke-red-400 stroke-2 hover:fill-red-300 transition-colors cursor-help"
                />
                {/* Southern Province */}
                <path 
                  d="M40,90 L60,90 L50,40 L30,30 L40,90 Z" 
                  className="fill-green-200 stroke-green-400 stroke-2 hover:fill-green-300 transition-colors cursor-help"
                />
                {/* Kigali City (Center) */}
                <circle 
                  cx="50" cy="40" r="8" 
                  className="fill-yellow-400 stroke-yellow-600 stroke-2 hover:fill-yellow-500 transition-colors cursor-help"
                />
                
                {/* Labels */}
                <text x="50" y="22" textAnchor="middle" className="text-[5px] font-bold fill-red-800 font-sans">NORTH</text>
                <text x="75" y="55" textAnchor="middle" className="text-[5px] font-bold fill-yellow-800 font-sans">EAST</text>
                <text x="25" y="55" textAnchor="middle" className="text-[5px] font-bold fill-red-800 font-sans">WEST</text>
                <text x="50" y="75" textAnchor="middle" className="text-[5px] font-bold fill-green-800 font-sans">SOUTH</text>
                <text x="50" y="41" textAnchor="middle" className="text-[4px] font-bold fill-yellow-900 font-sans">KIGALI</text>
              </svg>
              
              {/* Tooltip-like legend */}
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg border border-leaf-200 text-[10px] font-sans font-bold flex items-center gap-1">
                <Activity size={10} className="text-red-500 animate-pulse" />
                {t.liveAlerts}
              </div>
            </div>
          </div>

          {/* Map Legend/List */}
          <div className="lg:w-1/2 grid grid-cols-1 gap-3">
            {RWANDA_REGIONS.map((region, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-earth-900 rounded-xl shadow-sm border border-leaf-100 dark:border-leaf-900 hover:border-leaf-300 transition-all">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", region.color.split(' ')[0])} />
                  <div>
                    <p className="text-[10px] font-sans font-bold text-earth-400 uppercase tracking-wider">{region.name}</p>
                    <p className="font-bold text-black dark:text-white text-sm">{region.disease}</p>
                  </div>
                </div>
                <span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold font-sans uppercase", region.color)}>
                  {region.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 sm:p-8 border-t-4 border-leaf-500"
          >
            <div className="flex items-center gap-2 mb-6 text-leaf-700">
              <div className="w-8 h-8 rounded-full bg-leaf-100 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <h2 className="text-2xl font-bold">{t.analysisResult}</h2>
            </div>
            
            <div className="markdown-body prose prose-stone max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
            
            <div className="mt-8 pt-6 border-t border-earth-100 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-earth-500 font-sans italic">
                  {t.note}
                </p>
                <button 
                  onClick={() => {
                    setResult(null);
                    setImage(null);
                    setDescription('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-leaf-600 font-sans font-semibold flex items-center gap-1 hover:text-leaf-700 transition-colors"
                >
                  {t.startNew} <ChevronRight size={16} />
                </button>
              </div>
              
              <button 
                onClick={() => setActiveTab('marketplace')}
                className="w-full py-4 bg-leaf-50 text-leaf-700 rounded-2xl border-2 border-leaf-200 font-sans font-bold flex items-center justify-center gap-2 hover:bg-leaf-100 transition-colors"
              >
                <ShoppingBag size={20} />
                {t.shopRecommended}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const filteredProducts = MOCK_PRODUCTS.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderMarketplace = () => (
    <div className="space-y-6 pb-24 sm:pb-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-black dark:text-white">{t.marketplace}</h2>
          <p className="text-sm text-black dark:text-white font-bold font-sans">{t.marketTagline}</p>
        </div>
        
        <div className="relative w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-600">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-leaf-100 dark:border-leaf-800 focus:border-leaf-500 focus:ring-4 focus:ring-leaf-50 dark:focus:ring-leaf-900 bg-white dark:bg-earth-900 font-sans text-base shadow-sm transition-all placeholder:text-earth-400"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600 p-1 hover:bg-earth-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card overflow-hidden flex flex-col"
            >
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-48 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-sans font-bold text-leaf-600 uppercase tracking-wider">{product.category}</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-sans font-bold">{product.rating}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-2">{product.name}</h3>
                <p className="text-sm text-black dark:text-white font-sans mb-4 flex-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-earth-100 dark:border-earth-800">
                  <span className="text-2xl font-bold text-leaf-700 dark:text-leaf-400">{product.price}</span>
                  <button className="olive-button py-2 px-4 text-sm font-bold flex items-center gap-2">
                    {t.buyNow} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-earth-50 dark:bg-earth-900 rounded-3xl border-2 border-dashed border-earth-200 dark:border-earth-800">
          <div className="w-16 h-16 bg-earth-100 dark:bg-earth-800 rounded-full flex items-center justify-center mx-auto mb-4 text-earth-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">No products found</h3>
          <p className="text-black dark:text-white font-bold font-sans">Try searching for something else or browse categories.</p>
          <button 
            onClick={() => setSearchTerm('')}
            className="mt-4 text-leaf-600 font-bold hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      <div className="card p-6 bg-leaf-50 dark:bg-leaf-950 border-2 border-leaf-100 dark:border-leaf-900">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-leaf-500 flex items-center justify-center text-white flex-shrink-0">
            <Phone size={20} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-leaf-900 dark:text-leaf-100 mb-1">{t.needHelp}</h4>
            <p className="text-sm text-leaf-700 dark:text-leaf-300 font-sans mb-3">{t.helpDesk}</p>
            <a href="tel:+250700000000" className="text-leaf-600 font-bold font-sans flex items-center gap-1">
              +250 700 000 000 <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 pb-24 sm:pb-8">
      <h2 className="text-3xl font-bold text-leaf-900 dark:text-leaf-50">{t.myProfile}</h2>
      
      <div className="card p-8 text-center">
        <div className="w-24 h-24 bg-earth-200 dark:bg-earth-800 rounded-full mx-auto mb-4 flex items-center justify-center text-earth-500">
          <User size={48} />
        </div>
        <h3 className="text-2xl font-bold text-black dark:text-white">Alexis Ahishakiye</h3>
        <p className="text-black dark:text-white font-bold font-sans mb-6">Small-scale Farmer • Musanze, Rwanda</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-earth-50 dark:bg-earth-900 rounded-2xl border border-earth-100 dark:border-earth-800">
            <p className="text-2xl font-bold text-leaf-600">12</p>
            <p className="text-xs font-sans font-bold text-earth-400 uppercase tracking-wider">{t.totalScans}</p>
          </div>
          <div className="p-4 bg-earth-50 dark:bg-earth-900 rounded-2xl border border-earth-100 dark:border-earth-800">
            <p className="text-2xl font-bold text-leaf-600">94%</p>
            <p className="text-xs font-sans font-bold text-earth-400 uppercase tracking-wider">{t.healthScore}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h4 className="text-lg font-bold text-black dark:text-white mb-4">{t.recentActivity}</h4>
        <div className="space-y-4">
          {[
            { date: 'Oct 12', item: 'Potato Blight Analysis', status: 'Completed' },
            { date: 'Oct 10', item: 'Purchased Copper Fungicide', status: 'Delivered' },
            { date: 'Oct 05', item: 'Tomato Wilt Check', status: 'Completed' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-earth-100 dark:border-earth-800 last:border-0">
              <div>
                <p className="font-bold text-black dark:text-white text-sm">{activity.item}</p>
                <p className="text-xs text-black dark:text-white font-bold font-sans">{activity.date}</p>
              </div>
              <span className="text-xs font-sans font-bold text-leaf-600">{activity.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-8 pb-24 sm:pb-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-leaf-900 dark:text-leaf-50 leading-tight">{t.aboutTitle}</h2>
        <div className="w-20 h-1.5 bg-leaf-500 mx-auto rounded-full" />
      </div>

      <div className="card p-8 space-y-6">
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <Sprout className="text-leaf-600" /> {t.whatIsIt}
          </h3>
          <p className="text-black dark:text-white font-bold font-sans leading-relaxed">
            {t.whatIsItDesc}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-black dark:text-white">{t.howItWorks}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: t.step1Title, desc: t.step1Desc, icon: Camera },
              { title: t.step2Title, desc: t.step2Desc, icon: Activity },
              { title: t.step3Title, desc: t.step3Desc, icon: Info },
              { title: t.step4Title, desc: t.step4Desc, icon: ShoppingBag },
            ].map((step, i) => (
              <div key={i} className="p-4 bg-earth-50 dark:bg-earth-900 rounded-2xl border border-earth-100 dark:border-earth-800 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-leaf-100 dark:bg-leaf-900 flex items-center justify-center text-leaf-600 flex-shrink-0">
                  <step.icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-black dark:text-white text-sm">{step.title}</h4>
                  <p className="text-xs text-black dark:text-white font-bold font-sans mt-1">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-earth-100 dark:border-earth-800">
          <h3 className="text-2xl font-bold text-black dark:text-white mb-3">{t.mission}</h3>
          <p className="text-black dark:text-white font-bold font-sans italic leading-relaxed">
            {t.missionDesc}
          </p>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { id: 'diagnosis', icon: Home, label: t.home },
    { id: 'marketplace', icon: ShoppingBag, label: t.shop },
    { id: 'profile', icon: User, label: t.profile },
    { id: 'about', icon: HelpCircle, label: t.about },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center bg-earth-100 transition-colors duration-300">
      {/* Desktop Navigation Header */}
      <header className="hidden sm:flex fixed top-0 left-0 right-0 bg-white/80 dark:bg-earth-950/80 backdrop-blur-md border-b border-earth-200 dark:border-earth-800 z-50 px-8 py-4 items-center justify-between">
        {/* Tabs on the Left */}
        <div className="flex items-center gap-8">
          {navItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "flex items-center gap-2 font-sans font-bold text-sm uppercase tracking-wider transition-all relative py-2 px-4 rounded-xl",
                activeTab === tab.id 
                  ? "text-leaf-500 dark:text-leaf-400 bg-leaf-100 dark:bg-leaf-800/50 shadow-sm" 
                  : "text-earth-500 dark:text-earth-400 hover:text-leaf-500 dark:hover:text-leaf-400 hover:bg-leaf-50 dark:hover:bg-leaf-900/30"
              )}
            >
              <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-leaf-500 dark:bg-leaf-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Logo, Language & Theme on the Right */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-earth-200 dark:border-earth-800 pr-6">
            {/* Language Selector */}
            <div className="relative flex items-center gap-2 bg-earth-50 dark:bg-earth-900 px-3 py-1.5 rounded-full border border-earth-200 dark:border-earth-800">
              <Globe size={16} className="text-leaf-600" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-bold font-sans text-earth-700 dark:text-earth-300 focus:outline-none cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="sw">SW</option>
                <option value="rw">RW</option>
                <option value="fr">FR</option>
              </select>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-earth-50 dark:bg-earth-900 text-earth-600 dark:text-earth-400 hover:bg-leaf-50 dark:hover:bg-leaf-900 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-leaf-500 flex items-center justify-center text-white shadow-lg">
              <Leaf size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-leaf-900 dark:text-leaf-50">Crop Genius</h1>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sm:hidden text-center mt-8 mb-6 px-4 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-leaf-600" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-bold font-sans text-earth-700 dark:text-earth-300 focus:outline-none"
            >
              <option value="en">EN</option>
              <option value="sw">SW</option>
              <option value="rw">RW</option>
              <option value="fr">FR</option>
            </select>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-earth-900 shadow-sm border border-earth-100 dark:border-earth-800"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-leaf-500 flex items-center justify-center text-white shadow-lg">
            <Leaf size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-leaf-900 dark:text-leaf-50">Crop Genius</h1>
        </div>
        <p className="text-sm text-black dark:text-white font-bold italic">
          {t.tagline}
        </p>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full px-4 sm:px-8 sm:mt-28 mb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'diagnosis' && (
            <motion.div key="diagnosis" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {renderDiagnosis()}
            </motion.div>
          )}
          {activeTab === 'marketplace' && (
            <motion.div key="marketplace" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {renderMarketplace()}
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {renderProfile()}
            </motion.div>
          )}
          {activeTab === 'about' && (
            <motion.div key="about" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {renderAbout()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-earth-950 border-t border-earth-200 dark:border-earth-800 px-6 py-3 flex items-center justify-around z-50 sm:hidden">
        {navItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all relative px-3 py-1 rounded-xl",
              activeTab === tab.id 
                ? "text-leaf-500 dark:text-leaf-400 scale-110 bg-leaf-100 dark:bg-leaf-800/50" 
                : "text-earth-500 dark:text-earth-400 hover:text-leaf-500 dark:hover:text-leaf-400"
            )}
          >
            <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-sans font-bold uppercase tracking-tighter">{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabMobile"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-leaf-500 dark:bg-leaf-400 rounded-full"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Desktop Footer */}
      <footer className="hidden sm:block mt-8 text-center text-earth-500 font-sans text-sm max-w-md pb-12">
        <p>© 2026 Crop Genius AI. Supporting Rwandan farmers for a food-secure future.</p>
        <div className="flex justify-center gap-4 mt-4">
          <Leaf size={16} className="text-leaf-400" />
          <Leaf size={16} className="text-leaf-500" />
          <Leaf size={16} className="text-leaf-600" />
        </div>
      </footer>
    </div>
  );
}

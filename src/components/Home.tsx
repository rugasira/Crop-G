import React, { useState, useEffect } from 'react';
import { Camera, Brain, Sprout, LayoutDashboard, Map as MapIcon, CloudSun, MessageCircle, Shield, Smartphone, Zap, Globe, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../services/aiService';

interface Props {
  language: Language;
  onScanClick: () => void;
}

const HOME_TRANSLATIONS = {
  en: {
    heroTag: "AI That Protects Your Crops Before They Fail",
    heroTitle1: "Detect diseases.",
    heroTitle2: "Prevent outbreaks.",
    heroDesc: "FarmDiag helps you identify crop diseases instantly, understand them clearly, and take the right action before your harvest is lost. Built for African farmers.",
    scanBtn: "Scan Your Crop",
    exploreBtn: "Explore Features",
    trustTitle: "Built for Farmers. Designed for Africa.",
    trustDesc: "FarmDiag is an AI-powered agricultural intelligence platform helping farmers detect crop diseases early, prevent losses, and improve harvest yields.",
    trustBadges: ['Works on mobile', 'Designed for low internet', 'Simple for all farmers', 'Built for African crops'],
    stepsTitle: "3 Simple Steps to Protect Your Farm",
    steps: [
      { title: "1. Capture Your Crop", desc: "Take a photo of a suspicious leaf or plant using your phone camera." },
      { title: "2. AI Analyzes Instantly", desc: "Our AI model detects diseases and evaluates severity in seconds." },
      { title: "3. Get Recommendations", desc: "Receive clear treatment steps, prevention tips, and farming advice." }
    ],
    showcaseTitle: "See FarmDiag in Action",
    showcaseDesc: "Explore how our web platform provides seamless diagnostic analysis, treatment strategies, and regional outbreak mapping.",
    showcaseSteps: [
      {
        title: "1. Scan & Upload",
        subtitle: "Camera & File Uploader",
        desc: "Upload crop leaf photos directly from your computer or capture them live. The AI is trained to instantly process cassava, maize, beans, banana, and coffee leaves.",
        image: "/mobile_scan.webp"
      },
      {
        title: "2. Instant AI Diagnosis",
        subtitle: "Diagnostic Insight & Treatment",
        desc: "Get an immediate diagnosis of crop diseases with clear confidence percentages, severity tags, organic treatment tips, and chemical guidance.",
        image: "/mobile_result.webp"
      },
      {
        title: "3. Outbreak & Alerts",
        subtitle: "Farmer Dashboard & Heatmaps",
        desc: "Monitor your crop health history, browse regional outbreak maps showing active hotspots, and receive real-time weather risk advisories to prevent future failures.",
        image: "/mobile_dashboard.webp"
      }
    ],
    featuresTitle: "Core Features",
    features: [
      { title: "AI Disease Detection", desc: "Identify crop diseases instantly with high-accuracy machine learning models." },
      { title: "Treatment Recommendations", desc: "Get practical solutions: organic methods, chemical treatments, and prevention guides." },
      { title: "Farmer Dashboard", desc: "Track your crop health history and monitor past disease cases." },
      { title: "Outbreak Intelligence", desc: "See disease spread in your region using farmer reports and GPS mapping.", badge: "Coming Soon" },
      { title: "Weather Risk Alerts", desc: "Predict disease risks based on rainfall, humidity, and temperature changes.", badge: "Coming Soon" },
      { title: "AI Farming Assistant", desc: "Ask anything about your crops and get instant expert farming advice.", badge: "Coming Soon" }
    ],
    whyTag: "Why FarmDiag?",
    whyTitle: "More Than a Scanner — \nA Farming Intelligence System",
    whyDesc1: "Most apps only tell you what disease your crop has. FarmDiag goes further:",
    whyChecks: ['Why it happened', 'How to fix it', 'How to prevent it', 'When risk will happen again'],
    whyDesc2: "We are building a complete AI farming ecosystem for Africa.",
    builtTitle: "Built for Real Farmers",
    builtChecks: [
      'Works on low-end phones',
      'Fast image upload',
      'Simple UI (no technical complexity)',
      'Offline-ready design (PWA support planned)',
      'Local crop focus (cassava, maize, beans, banana, coffee)'
    ],
    impactTag: "Impact Statement",
    impactTitle: "Helping Farmers Reduce Crop Losses with AI",
    impactDesc1: "Every year, farmers lose up to 40% of crops due to preventable diseases. FarmDiag is here to change that by giving farmers:",
    impactBadges: ['Early detection', 'Clear guidance', 'Faster decisions', 'Better harvests'],
    visionTag: "Vision",
    visionTitle: "From Detection → Intelligence → Prevention",
    visionDesc1: "FarmDiag is evolving into an AI-powered agricultural intelligence platform for African farming communities.",
    visionDesc2: "Not just detection — but prediction, prevention, and protection.",
    ctaTitle: "Start Protecting Your Crops Today",
    ctaDesc: "Don't wait until disease spreads. Upload a crop image and get instant AI diagnosis.",
    ctaBtn: "Scan Your Crop Now"
  },
  sw: {
    heroTag: "AI Inayolinda Mazao Yako Kabla Hayajaharibika",
    heroTitle1: "Gundua magonjwa.",
    heroTitle2: "Zuia milipuko.",
    heroDesc: "FarmDiag inakusaidia kutambua magonjwa ya mazao papo hapo, kuyaelewa vizuri, na kuchukua hatua sahihi kabla mavuno yako hayajapotea. Imejengwa kwa ajili ya wakulima wa Afrika.",
    scanBtn: "Piga Picha Zao Lako",
    exploreBtn: "Gundua Vipengele",
    trustTitle: "Imejengwa kwa Wakulima. Imeundwa kwa Afrika.",
    trustDesc: "FarmDiag ni jukwaa la akili la kilimo linaloendeshwa na AI kusaidia wakulima kugundua magonjwa ya mazao mapema, kuzuia hasara, na kuboresha mavuno.",
    trustBadges: ['Inafanya kazi kwenye simu', 'Imeundwa kwa intaneti ya chini', 'Rahisi kwa wakulima wote', 'Imejengwa kwa mazao ya Afrika'],
    stepsTitle: "Hatua 3 Rahisi Kulinda Shamba Lako",
    steps: [
      { title: "1. Piga Picha Zao Lako", desc: "Chukua picha ya jani au mmea unaotiliwa shaka kwa kutumia kamera ya simu yako." },
      { title: "2. AI Inachambua Papo Hapo", desc: "Mfumo wetu wa AI hugundua magonjwa na kutathmini ukali ndani ya sekunde." },
      { title: "3. Pata Mapendekezo", desc: "Pokea hatua wazi za matibabu, vidokezo vya kuzuia, na ushauri wa kilimo." }
    ],
    showcaseTitle: "Tazama FarmDiag Inavyofanya Kazi",
    showcaseDesc: "Gundua jinsi jukwaa letu la wavuti linavyotoa uchambuzi wa utambuzi, mikakati ya matibabu, na ramani ya milipuko ya kikanda.",
    showcaseSteps: [
      {
        title: "1. Skana & Pakia",
        subtitle: "Kamera & Upakiaji wa Faili",
        desc: "Pakia picha za majani ya mazao moja kwa moja kutoka kwa kompyuta yako au uzipige picha moja kwa moja. AI imefundishwa kushughulikia majani ya muhogo, mahindi, maharagwe, ndizi, na kahawa papo hapo.",
        image: "/mobile_scan.webp"
      },
      {
        title: "2. Utambuzi wa AI Papo Hapo",
        subtitle: "Ufahamu wa Utambuzi na Matibabu",
        desc: "Pata utambuzi wa haraka wa magonjwa ya mazao kwa asilimia wazi ya ujasiri, lebo za ukali, vidokezo vya matibabu ya asili, na mwongozo wa kemikali.",
        image: "/mobile_result.webp"
      },
      {
        title: "3. Milipuko & Tahadhari",
        subtitle: "Dashibodi ya Mkulima & Ramani ya Joto",
        desc: "Fuatilia historia ya afya ya mazao yako, vinjari ramani za milipuko ya kikanda zinazoonyesha maeneo yenye milipuko ya sasa, na upokee ushauri wa hatari ya hali ya hewa ili kuzuia hasara za baadaye.",
        image: "/mobile_dashboard.webp"
      }
    ],
    featuresTitle: "Vipengele Vikuu",
    features: [
      { title: "Utambuzi wa Magonjwa wa AI", desc: "Tambua magonjwa ya mazao papo hapo kwa mifumo sahihi ya kujifunza ya mashine." },
      { title: "Mapendekezo ya Matibabu", desc: "Pata masuluhisho: mbinu za asili, matibabu ya kemikali, na miongozo ya kuzuia." },
      { title: "Dashibodi ya Mkulima", desc: "Fuatilia historia ya afya ya mazao yako na matukio ya magonjwa yaliyopita." },
      { title: "Ujasusi wa Milipuko", desc: "Angalia kuenea kwa magonjwa katika eneo lako.", badge: "Inakuja Karibuni" },
      { title: "Tahadhari za Hatari za Hali ya Hewa", desc: "Tabiri hatari za magonjwa kulingana na mabadiliko ya hali ya hewa.", badge: "Inakuja Karibuni" },
      { title: "Msaidizi wa Kilimo wa AI", desc: "Uliza chochote kuhusu mazao yako na upate ushauri wa kitaalam.", badge: "Inakuja Karibuni" }
    ],
    whyTag: "Kwa nini FarmDiag?",
    whyTitle: "Zaidi ya Kichunguzi — \nMfumo wa Akili wa Kilimo",
    whyDesc1: "Programu nyingi zinakuambia tu ugonjwa wa zao lako. FarmDiag inaenda mbali zaidi:",
    whyChecks: ['Kwa nini ilitokea', 'Jinsi ya kuirekebisha', 'Jinsi ya kuizuia', 'Lini hatari itatokea tena'],
    whyDesc2: "Tunajenga mfumo kamili wa kilimo wa AI kwa Afrika.",
    builtTitle: "Imejengwa kwa Wakulima Halisi",
    builtChecks: [
      'Inafanya kazi kwenye simu za bei nafuu',
      'Kupakia picha haraka',
      'UI rahisi (hakuna ugumu)',
      'Inafanya kazi bila intaneti',
      'Mtazamo wa mazao ya ndani'
    ],
    impactTag: "Taarifa ya Athari",
    impactTitle: "Kusaidia Wakulima Kupunguza Hasara kwa AI",
    impactDesc1: "Kila mwaka, wakulima wanapoteza hadi 40% ya mazao. FarmDiag ipo hapa kubadilisha hilo:",
    impactBadges: ['Utambuzi wa mapema', 'Mwongozo wazi', 'Maamuzi ya haraka', 'Mavuno bora'],
    visionTag: "Maono",
    visionTitle: "Kutoka Utambuzi → Ujasusi → Kinga",
    visionDesc1: "FarmDiag inabadilika kuwa jukwaa la akili la kilimo linaloendeshwa na AI.",
    visionDesc2: "Siyo tu utambuzi — bali utabiri, kinga, na ulinzi.",
    ctaTitle: "Anza Kulinda Mazao Yako Leo",
    ctaDesc: "Usisubiri hadi ugonjwa usambae. Pakia picha ya zao upate uchunguzi wa AI papo hapo.",
    ctaBtn: "Piga Picha Zao Lako Sasa"
  },
  rw: {
    heroTag: "AI Ikorera Kurinda Imyaka Yayo Mbere Y'uko Yonaswa",
    heroTitle1: "Vumbura indwara.",
    heroTitle2: "Rinda ibyorezo.",
    heroDesc: "FarmDiag igufasha kumenya indwara z'imyaka ako kanya, ukumva neza uko ziteye, kandi ugafata ingamba zikwiye mbere y'uko umusaruro wawe wangirika. Yubakiwe abahinzi b'Abanyafurika.",
    scanBtn: "Suzuma Igihingwa Cyawe",
    exploreBtn: "Reba Ibiranga",
    trustTitle: "Yubakiwe Abahinzi. Yagenewe Afurika.",
    trustDesc: "FarmDiag ni urubuga rw'ubuhinzi rwifashisha AI rufasha abahinzi kuvumbura indwara kare, kwirinda igihombo no kongera umusaruro.",
    trustBadges: ['Ikora kuri telefone', 'Yagenewe internet nkeya', 'Yoroheye buri muhinzi', 'Yubakiwe imyaka ya Afurika'],
    stepsTitle: "Intambwe 3 Zoroshye zo Kurinda Umurima Wawe",
    steps: [
      { title: "1. Fotora Igihingwa Cyawe", desc: "Fata ifoto y'ikibabi cyangwa igihingwa ukeka ko kirwaye ukoresheje telefone yawe." },
      { title: "2. AI Isuzuma Ako Kanya", desc: "Ikoranabuhanga ryacu rivumbura indwara n'ubukana bwazo mu masegonda macye." },
      { title: "3. Bona Inama", desc: "Bona amabwiriza asobanutse y'uko wavura, uko wakwirinda n'inama z'ubuhinzi." }
    ],
    showcaseTitle: "Reba Uko FarmDiag Ikora",
    showcaseDesc: "Reba uko urubuga rwacu rutanga isuzuma ryizewe, uburyo bwo kuvura indwara, n'ikarita yerekana aho ibyorezo biri mu gace kanyu.",
    showcaseSteps: [
      {
        title: "1. Suzuma & Ohereza",
        subtitle: "Gufotora / Kohereza Ifoto",
        desc: "Ohereza amafoto y'ibibabi by'imyaka uturutse kuri mudasobwa yawe cyangwa ugifotore ako kanya. AI yatojwe gusuzuma ibibabi by'imyumbati, ibigori, ibishyimbo, ibitoki, n'ikawa.",
        image: "/mobile_scan.webp"
      },
      {
        title: "2. Isuzuma rya AI rya Ako Kanya",
        subtitle: "Ubuvuzi n'Inama z'indwara",
        desc: "Bona isuzuma ry'indwara z'imyaka ako kanya ririmo ijanisha ry'icyizere, ubukana bw'indwara, inama za gakondo n'imiti y'ikoranabuhanga.",
        image: "/mobile_result.webp"
      },
      {
        title: "3. Ibyorezo & Integuza",
        subtitle: "Imibare y'Umuhinzi n'Amakuru y'Ikirere",
        desc: "Kurikirana amateka y'imyaka yawe, reba ikarita y'ibyorezo byugarije agace utuyemo, kandi uhabwe integuza z'ikirere kugira ngo wirinde igihombo mbere y'uko kibaho.",
        image: "/mobile_dashboard.webp"
      }
    ],
    featuresTitle: "Ibiranga By'ingenzi",
    features: [
      { title: "AI Kuvumbura Indwara", desc: "Menya indwara z'imyaka ako kanya ukoresheje ikoranabuhanga ryizewe." },
      { title: "Inama z'Ubuvuzi", desc: "Bona ibisubizo: uburyo bwa gakondo, imiti, n'inama zo kwirinda." },
      { title: "Imibare y'Umuhinzi", desc: "Kurikirana amateka y'ubuzima bw'imyaka yawe n'indwara zabanje." },
      { title: "Amakuru y'Ibyorezo", desc: "Reba uko indwara ikwirakwira mu gace utuyemo.", badge: "Biri Hafi" },
      { title: "Integuza y'Ikirere", desc: "Teganya ibyago by'indwara bitewe n'ihindagurika ry'ikirere.", badge: "Biri Hafi" },
      { title: "AI Umufasha mu Buhinzi", desc: "Baza ikibazo cyose ku myaka yawe ubone inama z'inzobere ako kanya.", badge: "Biri Hafi" }
    ],
    whyTag: "Kuki FarmDiag?",
    whyTitle: "Birenze Gusuzuma — \nNi Urubuga rw'Ubuhinzi",
    whyDesc1: "Porogaramu nyinshi zikubwira gusa indwara igihingwa cyawe gifite. FarmDiag yo irenzaho:",
    whyChecks: ['Impamvu byabaye', 'Uko wabikemura', 'Uko wakwirinda', 'Igihe bizongera kubera'],
    whyDesc2: "Turimo kubaka urubuga rwuzuye rw'ubuhinzi rwa AI rwa Afurika.",
    builtTitle: "Yubakiwe Abahinzi Nyabo",
    builtChecks: [
      'Ikora kuri telefone ziciriritse',
      'Kwohereza ifoto vuba',
      'Yoroheye kuyikoresha',
      'Ikora na nta internet',
      'Yibanda ku myaka y\'iwacu'
    ],
    impactTag: "Uruhare rwacu",
    impactTitle: "Gufasha Abahinzi Kugabanya Igihombo Koresheje AI",
    impactDesc1: "Buri mwaka, abahinzi bahomba kugera kuri 40% y'umusaruro. FarmDiag ije kubihindura iha abahinzi:",
    impactBadges: ['Kuvumbura kare', 'Inama zisobanutse', 'Gufata ibyemezo vuba', 'Umusaruro mwiza'],
    visionTag: "Icyerekezo",
    visionTitle: "Kuva ku Gusuzuma → Kumenya → Kwirinda",
    visionDesc1: "FarmDiag irimo guhinduka urubuga rw'ubuhinzi rwifashisha AI ku baturage b'abahinzi b'Abanyafurika.",
    visionDesc2: "Siyo gusuzuma gusa — ahubwo n'iteganyagihe, kwirinda, no kurinda.",
    ctaTitle: "Tangira Kurinda Imyaka Yawe Uyu Munsi",
    ctaDesc: "Ntegereza kugeza indwara ikwirakwiriye. Ohereza ifoto y'igihingwa ubone igisubizo cya AI ako kanya.",
    ctaBtn: "Suzuma Igihingwa Cyawe None Aha"
  },
  fr: {
    heroTag: "L'IA qui protège vos cultures avant qu'elles n'échouent",
    heroTitle1: "Détecter les maladies.",
    heroTitle2: "Prévenir les épidémies.",
    heroDesc: "FarmDiag vous aide à identifier instantanément les maladies des cultures, à les comprendre clairement et à prendre les bonnes mesures avant de perdre votre récolte. Conçu pour les agriculteurs africains.",
    scanBtn: "Analyser votre culture",
    exploreBtn: "Explorer les fonctionnalités",
    trustTitle: "Conçu pour les agriculteurs. Pensé pour l'Afrique.",
    trustDesc: "FarmDiag est une plateforme d'intelligence agricole basée sur l'IA aidant les agriculteurs à détecter les maladies tôt, à prévenir les pertes et à améliorer les rendements.",
    trustBadges: ['Fonctionne sur mobile', 'Conçu pour faible connexion', 'Simple pour tous', 'Pour les cultures africaines'],
    stepsTitle: "3 Étapes Simples pour Protéger Votre Ferme",
    steps: [
      { title: "1. Capturez votre culture", desc: "Prenez une photo d'une feuille ou d'une plante suspecte avec votre téléphone." },
      { title: "2. L'IA analyse instantanément", desc: "Notre modèle d'IA détecte les maladies et évalue la gravité en quelques secondes." },
      { title: "3. Obtenez des recommandations", desc: "Recevez des étapes de traitement claires, des conseils de prévention et agricoles." }
    ],
    showcaseTitle: "Découvrez FarmDiag en Action",
    showcaseDesc: "Découvrez comment notre plateforme Web offre une analyse diagnostique fluide, des stratégies de traitement et une cartographie des épidémies régionales.",
    showcaseSteps: [
      {
        title: "1. Scanner & Télécharger",
        subtitle: "Caméra & Importateur",
        desc: "Téléchargez des photos de feuilles de cultures directement depuis votre ordinateur ou capturez-les en direct. L'IA est entraînée à traiter instantanément les feuilles de manioc, maïs, haricot, banane et café.",
        image: "/mobile_scan.webp"
      },
      {
        title: "2. Diagnostic IA Immédiat",
        subtitle: "Analyse Diagnostique & Traitement",
        desc: "Obtenez un diagnostic immédiat des maladies des cultures avec des pourcentages de confiance clairs, des indices de gravité, des conseils de traitement biologique et chimique.",
        image: "/mobile_result.webp"
      },
      {
        title: "3. Épidémies & Alertes",
        subtitle: "Tableau de Bord & Cartographie",
        desc: "Surveillez l'historique de santé de vos cultures, parcourez les cartes d'épidémies régionales montrant les zones à risque et recevez des alertes météo en temps réel pour prévenir les pertes.",
        image: "/mobile_dashboard.webp"
      }
    ],
    featuresTitle: "Fonctionnalités Principales",
    features: [
      { title: "Détection des maladies par IA", desc: "Identifiez les maladies instantanément avec des modèles d'apprentissage automatique." },
      { title: "Recommandations de traitement", desc: "Obtenez des solutions pratiques : méthodes biologiques, traitements chimiques." },
      { title: "Tableau de bord de l'agriculteur", desc: "Suivez l'historique de la santé de vos cultures et les cas de maladies passés." },
      { title: "Intelligence des épidémies", desc: "Suivez la propagation des maladies dans votre région.", badge: "À venir" },
      { title: "Alertes de risques météorologiques", desc: "Prévoyez les risques en fonction des changements climatiques.", badge: "À venir" },
      { title: "Assistant agricole IA", desc: "Posez des questions sur vos cultures et obtenez des conseils d'experts.", badge: "À venir" }
    ],
    whyTag: "Pourquoi FarmDiag ?",
    whyTitle: "Plus qu'un Scanner — \nUn Système d'Intelligence Agricole",
    whyDesc1: "La plupart des applications vous disent seulement la maladie. FarmDiag va plus loin :",
    whyChecks: ['Pourquoi c\'est arrivé', 'Comment le réparer', 'Comment le prévenir', 'Quand le risque reviendra'],
    whyDesc2: "Nous construisons un écosystème agricole IA complet pour l'Afrique.",
    builtTitle: "Construit pour les vrais agriculteurs",
    builtChecks: [
      'Fonctionne sur des téléphones bas de gamme',
      'Téléchargement rapide d\'images',
      'Interface simple (aucune complexité)',
      'Conception hors ligne (PWA)',
      'Focus sur les cultures locales'
    ],
    impactTag: "Déclaration d'Impact",
    impactTitle: "Aider les agriculteurs à réduire les pertes avec l'IA",
    impactDesc1: "Chaque année, les agriculteurs perdent jusqu'à 40 % des récoltes. FarmDiag est là pour changer cela :",
    impactBadges: ['Détection précoce', 'Conseils clairs', 'Décisions plus rapides', 'Meilleures récoltes'],
    visionTag: "Vision",
    visionTitle: "De la Détection → Intelligence → Prévention",
    visionDesc1: "FarmDiag évolue vers une plateforme d'intelligence agricole IA pour l'Afrique.",
    visionDesc2: "Pas seulement la détection — mais la prédiction, la prévention et la protection.",
    ctaTitle: "Commencez à Protéger Vos Cultures Aujourd'hui",
    ctaDesc: "N'attendez pas que la maladie se propage. Téléchargez une photo et obtenez un diagnostic IA.",
    ctaBtn: "Analysez Votre Culture Maintenant"
  }
};

export function Home({ language, onScanClick }: Props) {
  const t = HOME_TRANSLATIONS[language];
  const stepIcons = [Camera, Brain, Sprout];
  const featureIcons = [Brain, Sprout, LayoutDashboard, MapIcon, CloudSun, MessageCircle];
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [prevStepIndex, setPrevStepIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const direction = activeStepIndex > prevStepIndex ? 1 : -1;

  const handleStepClick = (index: number) => {
    setPrevStepIndex(activeStepIndex);
    setActiveStepIndex(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setPrevStepIndex(activeStepIndex);
      setActiveStepIndex((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeStepIndex, isAutoPlaying]);

  return (
    <div className="space-y-24 pb-16 transition-colors">
      
      {/* 🟢 HERO SECTION */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-brand-100/50 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 px-4 py-2 rounded-full font-bold text-sm mb-4 border border-brand-200/50 dark:border-brand-700/50 transition-colors"
        >
          <Sprout size={16} /> {t.heroTag}
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-brand-950 dark:text-white tracking-tight leading-tight transition-colors"
        >
          {t.heroTitle1} <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-green-500 dark:from-brand-400 dark:to-green-400">
            {t.heroTitle2}
          </span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl sm:text-2xl text-brand-900/70 dark:text-brand-100/70 font-sans leading-relaxed max-w-3xl mx-auto transition-colors"
        >
          {t.heroDesc}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <button 
            onClick={onScanClick}
            className="w-full sm:w-auto px-8 py-4 bg-brand-900 dark:bg-brand-500 text-white dark:text-brand-950 rounded-[1.5rem] font-bold text-lg hover:bg-brand-950 dark:hover:bg-brand-400 hover:scale-105 transition-all shadow-xl shadow-brand-900/20 dark:shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            <Camera size={20} />
            {t.scanBtn}
          </button>
          <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-brand-900/40 text-brand-900 dark:text-brand-100 border border-brand-200 dark:border-brand-700 rounded-[1.5rem] font-bold text-lg hover:bg-brand-50 dark:hover:bg-brand-800/80 hover:border-brand-300 dark:hover:border-brand-500 transition-all text-center">
            {t.exploreBtn}
          </a>
        </motion.div>
      </section>

      {/* 🚜 TRUST STATEMENT */}
      <section className="bg-brand-900 dark:bg-brand-950 rounded-[3rem] p-8 sm:p-16 text-white text-center relative overflow-hidden shadow-2xl shadow-brand-900/10 dark:shadow-brand-500/5 border border-transparent dark:border-brand-800/50 transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 dark:bg-brand-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/20 dark:bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <Shield size={48} className="mx-auto text-brand-300 dark:text-brand-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
          <h3 className="text-3xl sm:text-4xl font-bold">{t.trustTitle}</h3>
          <p className="text-lg text-brand-100/90 dark:text-brand-200/80 leading-relaxed">
            {t.trustDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 pt-4">
            {t.trustBadges.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 dark:bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5 dark:border-brand-800/50">
                <CheckCircle className="text-brand-300 dark:text-brand-400" size={16} />
                <span className="font-bold text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔍 HOW IT WORKS */}
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-950 dark:text-white transition-colors">{t.stepsTitle}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={i} className="bg-white dark:bg-brand-950 p-8 rounded-[2rem] border border-brand-100 dark:border-brand-800 shadow-xl shadow-brand-900/5 dark:shadow-black/40 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-brand-900/30 dark:hover:border-brand-700 transition-all">
                <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mb-6 border border-transparent dark:border-brand-800">
                  <Icon size={32} />
                </div>
                <h4 className="text-xl font-bold text-brand-950 dark:text-white mb-3 transition-colors">{step.title}</h4>
                <p className="text-brand-900/70 dark:text-brand-200/60 leading-relaxed transition-colors">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🖥️ APP IN ACTION SHOWCASE */}
      <section className="max-w-5xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-950 dark:text-white transition-colors">
            {t.showcaseTitle}
          </h3>
          <p className="text-lg text-brand-900/70 dark:text-brand-200/60 leading-relaxed transition-colors">
            {t.showcaseDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Interactive Steps List (Left Side - 2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {t.showcaseSteps.map((step: any, idx: number) => {
              const isActive = idx === activeStepIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleStepClick(idx)}
                  className={`w-full text-left p-6 rounded-[2rem] border transition-all relative overflow-hidden flex flex-col gap-2 ${
                    isActive
                      ? "bg-white dark:bg-[#0A1F17] border-brand-200 dark:border-[#10B981]/30 shadow-xl shadow-brand-900/5 dark:shadow-black/50"
                      : "bg-transparent border-transparent hover:bg-brand-50/50 dark:hover:bg-brand-900/10 cursor-pointer"
                  }`}
                >
                  {/* Dynamic Progress Line for Active Tab */}
                  {isActive && (
                    <motion.div
                      layoutId="showcaseActiveBorder"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-600 to-green-500 dark:from-[#10B981] dark:to-emerald-400 rounded-r"
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        isActive
                          ? "bg-brand-100 dark:bg-[#10B981]/15 text-brand-800 dark:text-[#10B981]"
                          : "bg-brand-50 dark:bg-brand-900/40 text-brand-700/80 dark:text-brand-300/80"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-brand-950 dark:text-white transition-colors">
                    {step.subtitle}
                  </h4>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="text-brand-900/70 dark:text-brand-200/60 leading-relaxed text-sm font-sans"
                      >
                        {step.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          {/* App Video Showcase (Right Side - 3 Cols) */}
          <div className="lg:col-span-3 flex justify-center items-center">
            <div className="relative w-full max-w-[340px] bg-white dark:bg-white rounded-[3rem] p-2 shadow-2xl transition-all duration-500 hover:scale-[1.02]">
              <video
                src="/video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-contain"
                style={{
                  clipPath: 'inset(0.3% 1.2% 10.5% 1.3% rounded 2.5rem)',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 🧪 CORE FEATURES */}
      <section id="features" className="bg-brand-50/50 dark:bg-brand-950/30 rounded-[3rem] p-8 sm:p-16 border border-brand-100 dark:border-brand-800/50 transition-colors">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-950 dark:text-white transition-colors">{t.featuresTitle}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.map((feat, i) => {
            const Icon = featureIcons[i];
            return (
              <div key={i} className="bg-white dark:bg-brand-900/40 p-8 rounded-[2rem] border border-brand-100 dark:border-brand-800 shadow-sm hover:shadow-xl hover:shadow-brand-900/5 dark:hover:shadow-brand-500/10 dark:hover:border-brand-600 transition-all relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-brand-500/0 dark:group-hover:from-brand-500/5 dark:group-hover:to-brand-400/5 transition-colors" />
                {feat.badge && (
                  <span className="absolute top-6 right-6 bg-brand-100 dark:bg-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-transparent dark:border-brand-700 z-10">
                    {feat.badge}
                  </span>
                )}
                <div className="relative z-10 w-12 h-12 bg-brand-900 dark:bg-brand-800 text-white dark:text-brand-400 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-brand-900/20 dark:shadow-none border border-transparent dark:border-brand-700 group-hover:scale-110 transition-transform">
                  <Icon size={24} />
                </div>
                <h4 className="relative z-10 text-xl font-bold text-brand-950 dark:text-brand-50 mb-3 transition-colors">{feat.title}</h4>
                <p className="relative z-10 text-brand-900/70 dark:text-brand-200/60 leading-relaxed transition-colors">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🌍 WHY FARMDIAG? & BUILT FOR REAL FARMERS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-bold text-sm border border-transparent dark:border-blue-800/50 transition-colors">
            <Globe size={16} /> {t.whyTag}
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-950 dark:text-white leading-tight transition-colors whitespace-pre-line">
            {t.whyTitle}
          </h3>
          <p className="text-lg text-brand-900/70 dark:text-brand-200/70 leading-relaxed transition-colors">
            {t.whyDesc1}
          </p>
          <ul className="space-y-3">
            {t.whyChecks.map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-brand-900 dark:text-brand-100 font-bold transition-colors">
                <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-transparent dark:border-brand-700">
                  <CheckCircle size={12} />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-lg font-bold text-brand-950 dark:text-brand-50 pt-4 transition-colors">
            {t.whyDesc2}
          </p>
        </div>

        <div className="bg-brand-900 dark:bg-brand-950 p-8 sm:p-12 rounded-[3rem] text-white shadow-2xl dark:shadow-brand-500/5 relative overflow-hidden border border-transparent dark:border-brand-800/50 transition-colors">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-800 dark:bg-brand-800/40 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-8">
            <h3 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Smartphone size={32} className="text-brand-300 dark:text-brand-400" /> {t.builtTitle}
            </h3>
            <ul className="space-y-6">
              {t.builtChecks.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-black/30 flex items-center justify-center shrink-0 border border-transparent dark:border-brand-700/50">
                    <CheckCircle size={16} className="text-brand-300 dark:text-brand-400" />
                  </div>
                  <span className="text-lg font-medium text-brand-50 dark:text-brand-100/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 🚀 IMPACT & VISION */}
      <section className="bg-white dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/50 rounded-[3rem] p-8 sm:p-16 shadow-xl shadow-brand-900/5 dark:shadow-black/20 text-center space-y-12 transition-colors">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full font-bold text-sm border border-transparent dark:border-orange-800/50 transition-colors">
            <Zap size={16} /> {t.impactTag}
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-950 dark:text-white transition-colors">{t.impactTitle}</h3>
          <p className="text-xl text-brand-900/70 dark:text-brand-200/70 leading-relaxed transition-colors">
            {t.impactDesc1.split('40%').map((part, i, arr) => 
              i === arr.length - 1 ? part : <span key={i}>{part}<strong className="text-brand-900 dark:text-brand-400">40%</strong></span>
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {t.impactBadges.map((item, i) => (
              <div key={i} className="bg-brand-50 dark:bg-brand-900/40 text-brand-900 dark:text-brand-200 px-6 py-3 rounded-2xl font-bold border border-transparent dark:border-brand-800/50 transition-colors">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-brand-100 dark:bg-brand-800/50 transition-colors" />

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-full font-bold text-sm border border-transparent dark:border-purple-800/50 transition-colors">
            <Target size={16} /> {t.visionTag}
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-brand-950 dark:text-white transition-colors">{t.visionTitle}</h3>
          <p className="text-lg text-brand-900/70 dark:text-brand-200/70 leading-relaxed transition-colors">
            {t.visionDesc1} <br/><br/>
            <strong className="text-brand-900 dark:text-brand-300">{t.visionDesc2}</strong>
          </p>
        </div>
      </section>

      {/* 📣 CALL TO ACTION */}
      <section className="bg-gradient-to-br from-brand-900 to-green-900 dark:from-brand-950 dark:to-emerald-950 rounded-[3rem] p-12 sm:p-20 text-center text-white shadow-2xl dark:shadow-brand-500/10 relative overflow-hidden border border-transparent dark:border-brand-800/50 transition-colors">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 dark:opacity-5 mix-blend-overlay" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight">{t.ctaTitle}</h2>
          <p className="text-xl text-brand-100/90 dark:text-brand-200/80">
            {t.ctaDesc}
          </p>
          <button 
            onClick={onScanClick}
            className="px-10 py-5 bg-white dark:bg-brand-500 text-brand-950 dark:text-brand-950 rounded-[2rem] font-bold text-xl hover:scale-105 hover:shadow-2xl dark:hover:shadow-brand-500/30 transition-all flex items-center justify-center gap-3 mx-auto mt-8 border border-transparent dark:border-brand-400"
          >
            <Camera size={24} className="text-brand-600 dark:text-brand-950" />
            {t.ctaBtn}
          </button>
        </div>
      </section>

    </div>
  );
}

// Simple check icon for the home page
function CheckCircle({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

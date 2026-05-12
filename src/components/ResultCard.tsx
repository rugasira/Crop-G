import { AnalysisResult, Language } from '../services/aiService';
import { Bug, Info, Activity, Syringe, ShieldCheck, AlertCircle, CheckCircle2, Lightbulb, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  result: AnalysisResult;
  language: Language;
}

const TRANSLATIONS = {
  en: {
    analysisResult: 'Analysis Result',
    errorTitle: 'Analysis Error',
    disease: 'Disease',
    cause: 'Cause',
    symptoms: 'Symptoms',
    treatment: 'Treatment',
    prevention: 'Prevention',
    confidence: 'Confidence',
    severity: 'Severity',
    reasoning: 'AI Reasoning',
    note: '* Note: This is an AI suggestion. Always consult local agricultural officers for critical decisions.',
    consultAgronomist: 'Consult Agronomist (Premium)',
    premiumDesc: 'Get connected with a certified local agronomist for personalized help.'
  },
  sw: {
    analysisResult: 'Matokeo ya Uchambuzi',
    errorTitle: 'Hitilafu ya Uchambuzi',
    disease: 'Ugonjwa',
    cause: 'Chanzo',
    symptoms: 'Dalili',
    treatment: 'Matibabu',
    prevention: 'Kuzuia',
    confidence: 'Uhakika',
    severity: 'Ukali',
    reasoning: 'Sababu ya AI',
    note: '* Kumbuka: Huu ni ushauri wa AI. Daima wasiliana na maafisa wa kilimo wa mitaa.',
    consultAgronomist: 'Wasiliana na Mtaalamu (Premium)',
    premiumDesc: 'Unganishwa na mtaalamu wa kilimo aliyeidhinishwa kwa msaada zaidi.'
  },
  rw: {
    analysisResult: 'Ibyavuye mu isuzuma',
    errorTitle: 'Ikibazo mu isuzuma',
    disease: 'Indwara',
    cause: 'Icyayitera',
    symptoms: 'Ibimenyetso',
    treatment: 'Ubuvuzi',
    prevention: 'Kuyirinda',
    confidence: 'Icyizere',
    severity: 'Uburemere',
    reasoning: 'Impamvu za AI',
    note: '* Icyitonderwa: Izi ni inama za AI. Buri gihe jya ugisha inama abakozi b’ubuhinzi.',
    consultAgronomist: 'Gisha Inama Inzobere (Premium)',
    premiumDesc: 'Huzwa n\'inzobere mu buhinzi yabyigiye iguhe inama zihariye.'
  },
  fr: {
    analysisResult: 'Résultat de l\'analyse',
    errorTitle: 'Erreur d\'analyse',
    disease: 'Maladie',
    cause: 'Cause',
    symptoms: 'Symptômes',
    treatment: 'Traitement',
    prevention: 'Prévention',
    confidence: 'Confiance',
    severity: 'Sévérité',
    reasoning: 'Raisonnement IA',
    note: '* Note : Ceci est une suggestion de l\'IA. Consultez toujours les agents agricoles locaux.',
    consultAgronomist: 'Consulter un Agronome (Premium)',
    premiumDesc: 'Soyez mis en contact avec un agronome certifié pour une aide personnalisée.'
  }
};

export function ResultCard({ result, language }: Props) {
  const t = TRANSLATIONS[language];

  const getSeverityColor = (severity?: string) => {
    if (!severity) return 'bg-brand-500';
    const s = severity.toLowerCase();
    if (s.includes('low') || s.includes('faible') || s.includes('chini')) return 'bg-green-500';
    if (s.includes('medium') || s.includes('moyen') || s.includes('kati')) return 'bg-yellow-500';
    if (s.includes('high') || s.includes('élevé') || s.includes('juu')) return 'bg-orange-500';
    if (s.includes('critical') || s.includes('critique') || s.includes('hatari')) return 'bg-red-600';
    return 'bg-brand-500';
  };

  if (result.error) {
    return (
      <div className="bg-white rounded-[2rem] p-8 border border-red-100 shadow-xl shadow-red-900/5">
        <div className="flex items-center gap-3 text-red-700 mb-3">
          <AlertCircle size={28} className="text-red-500" />
          <h3 className="text-2xl font-bold">{t.errorTitle}</h3>
        </div>
        <p className="text-brand-900/80 font-sans text-lg">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 text-brand-950 border-b border-brand-100 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-900 flex items-center justify-center text-white shadow-lg shadow-brand-900/20">
          <CheckCircle2 size={28} />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{t.analysisResult}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Header / Disease */}
        {result.disease && (
          <div className="bg-brand-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-brand-900/20 md:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-4 text-brand-200">
                  <Bug size={22} />
                  <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em]">{t.disease}</h3>
                </div>
                <p className="text-4xl sm:text-5xl font-bold">{result.disease}</p>
              </div>
              
              {/* Confidence & Severity Badges */}
              <div className="flex flex-col gap-3 shrink-0">
                {result.severity && (
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(result.severity)}`} />
                    <span className="font-bold text-sm tracking-wide">{result.severity}</span>
                  </div>
                )}
                {result.confidenceScore && (
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                    <Activity size={16} className="text-brand-300" />
                    <span className="font-bold text-sm">{result.confidenceScore}% {t.confidence}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reasoning Card */}
        {result.reasoning && (
          <div className="bg-brand-50 rounded-[2rem] p-8 border border-brand-100 shadow-xl shadow-brand-900/5 md:col-span-2 hover:shadow-brand-900/10 transition-all">
            <div className="flex items-center gap-2 mb-4 text-brand-700">
              <Lightbulb size={20} />
              <h3 className="text-xs font-sans font-bold uppercase tracking-[0.2em]">{t.reasoning}</h3>
            </div>
            <p className="text-brand-950 font-sans leading-relaxed text-lg italic">"{result.reasoning}"</p>
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
        
        {/* Monetization Placeholder */}
        <div className="bg-gradient-to-br from-brand-900 to-brand-950 rounded-[2rem] p-8 shadow-xl text-white md:col-span-2 flex flex-col sm:flex-row items-center gap-6 justify-between relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <PhoneCall size={24} className="text-brand-300" />
              {t.consultAgronomist}
            </h3>
            <p className="text-brand-100/80">{t.premiumDesc}</p>
          </div>
          <button className="px-6 py-3 bg-white text-brand-950 rounded-xl font-bold whitespace-nowrap hover:scale-105 transition-transform">
            Book Call
          </button>
        </div>
      </div>
      
      <div className="pt-8">
        <p className="text-sm text-brand-900/40 font-bold font-sans italic text-center">
          {t.note}
        </p>
      </div>
    </div>
  );
}

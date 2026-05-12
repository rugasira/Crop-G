import { Camera, Brain, Sprout, LayoutDashboard, Map as MapIcon, CloudSun, MessageCircle, Shield, Smartphone, Zap, Globe, Target } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onScanClick: () => void;
}

export function Home({ onScanClick }: Props) {
  return (
    <div className="space-y-24 pb-16">
      
      {/* 🟢 HERO SECTION */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-brand-100/50 text-brand-800 px-4 py-2 rounded-full font-bold text-sm mb-4"
        >
          <Sprout size={16} /> AI That Protects Your Crops Before They Fail
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-brand-950 tracking-tight leading-tight"
        >
          Detect diseases. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-green-500">
            Prevent outbreaks.
          </span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl sm:text-2xl text-brand-900/70 font-sans leading-relaxed max-w-3xl mx-auto"
        >
          FarmDiag helps you identify crop diseases instantly, understand them clearly, and take the right action before your harvest is lost. Built for African farmers.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <button 
            onClick={onScanClick}
            className="w-full sm:w-auto px-8 py-4 bg-brand-900 text-white rounded-[1.5rem] font-bold text-lg hover:bg-brand-950 hover:scale-105 transition-all shadow-xl shadow-brand-900/20 flex items-center justify-center gap-2"
          >
            <Camera size={20} />
            Scan Your Crop
          </button>
          <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-brand-900 border border-brand-200 rounded-[1.5rem] font-bold text-lg hover:bg-brand-50 hover:border-brand-300 transition-all text-center">
            Explore Features
          </a>
        </motion.div>
      </section>

      {/* 🚜 TRUST STATEMENT */}
      <section className="bg-brand-900 rounded-[3rem] p-8 sm:p-16 text-white text-center relative overflow-hidden shadow-2xl shadow-brand-900/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/20 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <Shield size={48} className="mx-auto text-brand-300" />
          <h3 className="text-3xl sm:text-4xl font-bold">Built for Farmers. Designed for Africa.</h3>
          <p className="text-lg text-brand-100/90 leading-relaxed">
            FarmDiag is an AI-powered agricultural intelligence platform helping farmers detect crop diseases early, prevent losses, and improve harvest yields.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 pt-4">
            {['Works on mobile', 'Designed for low internet', 'Simple for all farmers', 'Built for African crops'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                <CheckCircle className="text-brand-300" size={16} />
                <span className="font-bold text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔍 HOW IT WORKS */}
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-950">3 Simple Steps to Protect Your Farm</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Camera, title: "1. Capture Your Crop", desc: "Take a photo of a suspicious leaf or plant using your phone camera." },
            { icon: Brain, title: "2. AI Analyzes Instantly", desc: "Our AI model detects diseases and evaluates severity in seconds." },
            { icon: Sprout, title: "3. Get Recommendations", desc: "Receive clear treatment steps, prevention tips, and farming advice." }
          ].map((step, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-brand-100 shadow-xl shadow-brand-900/5 hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6">
                <step.icon size={32} />
              </div>
              <h4 className="text-xl font-bold text-brand-950 mb-3">{step.title}</h4>
              <p className="text-brand-900/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🧪 CORE FEATURES */}
      <section id="features" className="bg-brand-50/50 rounded-[3rem] p-8 sm:p-16 border border-brand-100">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-950">Core Features</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: "AI Disease Detection", desc: "Identify crop diseases instantly with high-accuracy machine learning models." },
            { icon: Sprout, title: "Treatment Recommendations", desc: "Get practical solutions: organic methods, chemical treatments, and prevention guides." },
            { icon: LayoutDashboard, title: "Farmer Dashboard", desc: "Track your crop health history and monitor past disease cases." },
            { icon: MapIcon, title: "Outbreak Intelligence", desc: "See disease spread in your region using farmer reports and GPS mapping.", badge: "Coming Soon" },
            { icon: CloudSun, title: "Weather Risk Alerts", desc: "Predict disease risks based on rainfall, humidity, and temperature changes.", badge: "Coming Soon" },
            { icon: MessageCircle, title: "AI Farming Assistant", desc: "Ask anything about your crops and get instant expert farming advice.", badge: "Coming Soon" }
          ].map((feat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-brand-100 shadow-sm hover:shadow-xl hover:shadow-brand-900/5 transition-all relative">
              {feat.badge && (
                <span className="absolute top-6 right-6 bg-brand-100 text-brand-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {feat.badge}
                </span>
              )}
              <div className="w-12 h-12 bg-brand-900 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-brand-900/20">
                <feat.icon size={24} />
              </div>
              <h4 className="text-xl font-bold text-brand-950 mb-3">{feat.title}</h4>
              <p className="text-brand-900/70 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🌍 WHY FARMDIAG? & BUILT FOR REAL FARMERS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-bold text-sm">
            <Globe size={16} /> Why FarmDiag?
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-950 leading-tight">
            More Than a Scanner — <br/>A Farming Intelligence System
          </h3>
          <p className="text-lg text-brand-900/70 leading-relaxed">
            Most apps only tell you what disease your crop has. FarmDiag goes further:
          </p>
          <ul className="space-y-3">
            {['Why it happened', 'How to fix it', 'How to prevent it', 'When risk will happen again'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-brand-900 font-bold">
                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <CheckCircle size={12} />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-lg font-bold text-brand-950 pt-4">
            We are building a complete AI farming ecosystem for Africa.
          </p>
        </div>

        <div className="bg-brand-900 p-8 sm:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-800 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-8">
            <h3 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Smartphone size={32} className="text-brand-300" /> Built for Real Farmers
            </h3>
            <ul className="space-y-6">
              {[
                'Works on low-end phones',
                'Fast image upload',
                'Simple UI (no technical complexity)',
                'Offline-ready design (PWA support planned)',
                'Local crop focus (cassava, maize, beans, banana, coffee)'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <CheckCircle size={16} className="text-brand-300" />
                  </div>
                  <span className="text-lg font-medium text-brand-50">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 🚀 IMPACT & VISION */}
      <section className="bg-white border border-brand-100 rounded-[3rem] p-8 sm:p-16 shadow-xl shadow-brand-900/5 text-center space-y-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full font-bold text-sm">
            <Zap size={16} /> Impact Statement
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold text-brand-950">Helping Farmers Reduce Crop Losses with AI</h3>
          <p className="text-xl text-brand-900/70 leading-relaxed">
            Every year, farmers lose up to <strong className="text-brand-900">40% of crops</strong> due to preventable diseases. FarmDiag is here to change that by giving farmers:
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {['Early detection', 'Clear guidance', 'Faster decisions', 'Better harvests'].map((item, i) => (
              <div key={i} className="bg-brand-50 text-brand-900 px-6 py-3 rounded-2xl font-bold">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-brand-100" />

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-full font-bold text-sm">
            <Target size={16} /> Vision
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-brand-950">From Detection → Intelligence → Prevention</h3>
          <p className="text-lg text-brand-900/70 leading-relaxed">
            FarmDiag is evolving into an AI-powered agricultural intelligence platform for African farming communities. <br/><br/>
            <strong>Not just detection — but prediction, prevention, and protection.</strong>
          </p>
        </div>
      </section>

      {/* 📣 CALL TO ACTION */}
      <section className="bg-gradient-to-br from-brand-900 to-green-900 rounded-[3rem] p-12 sm:p-20 text-center text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="text-4xl sm:text-5xl font-bold leading-tight">Start Protecting Your Crops Today</h2>
          <p className="text-xl text-brand-100/90">
            Don't wait until disease spreads. Upload a crop image and get instant AI diagnosis.
          </p>
          <button 
            onClick={onScanClick}
            className="px-10 py-5 bg-white text-brand-950 rounded-[2rem] font-bold text-xl hover:scale-105 hover:shadow-2xl transition-all flex items-center justify-center gap-3 mx-auto mt-8"
          >
            <Camera size={24} className="text-brand-600" />
            Scan Your Crop Now
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

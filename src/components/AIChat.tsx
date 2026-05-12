import { useState } from 'react';
import { Send, Bot, User, X } from 'lucide-react';
import { Language, AnalysisResult, chatWithAI } from '../services/aiService';

interface Props {
  language: Language;
  context: AnalysisResult;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const TRANSLATIONS = {
  en: { title: "Agronomist AI", placeholder: "Ask a follow-up question...", send: "Send", start: "Hello! I am your AI Agronomist. Ask me anything about this diagnosis." },
  sw: { title: "Mtaalamu wa AI", placeholder: "Uliza swali la ziada...", send: "Tuma", start: "Hujambo! Mimi ni Mtaalamu wako wa AI. Niulize chochote kuhusu uchunguzi huu." },
  rw: { title: "Inzobere AI", placeholder: "Baza ikindi kibazo...", send: "Ohereza", start: "Muraho! Ndi Inzobere yawe ya AI. Mbaza icyo ushaka cyose kuri ubu burwayi." },
  fr: { title: "Agronome IA", placeholder: "Posez une question...", send: "Envoyer", start: "Bonjour! Je suis votre Agronome IA. Posez-moi des questions sur ce diagnostic." }
};

export function AIChat({ language, context, onClose }: Props) {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: t.start }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Format history for Gemini API
      const history = messages.slice(1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const reply = await chatWithAI(language, context, userMsg, history);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I am having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[80vh] border border-brand-100 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-brand-900 p-6 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <Bot size={24} />
            </div>
            <h3 className="font-bold text-xl">{t.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-50/30">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-brand-200 text-brand-800'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`px-5 py-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white border border-brand-100 text-brand-950 rounded-tl-sm shadow-sm'}`}>
                <p className="font-sans leading-relaxed text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center text-brand-800">
                <Bot size={16} />
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white border border-brand-100 shadow-sm rounded-tl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-brand-50 shrink-0">
          <div className="flex items-center gap-2 bg-brand-50 rounded-[1.5rem] p-1 border border-brand-100 focus-within:border-brand-400 transition-colors">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent px-4 py-3 focus:outline-none font-sans text-brand-950 placeholder:text-brand-900/40"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-12 h-12 bg-brand-900 text-white rounded-full flex items-center justify-center hover:bg-brand-950 disabled:opacity-50 transition-all shrink-0"
            >
              <Send size={18} className="ml-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

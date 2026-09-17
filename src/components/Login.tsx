import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50/20 dark:bg-[#050B08] p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#10B981]/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#34D399]/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 dark:bg-[#0A1F17]/90 backdrop-blur-xl rounded-[32px] border border-brand-100 dark:border-[#10B981]/20 shadow-2xl p-8 relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-900 flex items-center justify-center text-white shadow-lg shadow-brand-900/20">
            <Sprout size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-brand-950 dark:text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-brand-700/70 dark:text-brand-300/70 mb-8 text-sm">
          {isLogin 
            ? 'Enter your credentials to access your farm data' 
            : 'Join FarmDiag to protect and monitor your crops'}
        </p>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex items-center gap-3 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 p-4 rounded-2xl border border-red-100 dark:border-red-800">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-brand-900 dark:text-brand-100 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-[#050B08] border border-brand-200 dark:border-brand-800 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 dark:text-white outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-brand-900 dark:text-brand-100 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white dark:bg-[#050B08] border border-brand-200 dark:border-brand-800 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 dark:text-white outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-4 bg-[#10B981] hover:bg-[#34D399] text-[#0A1F17] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-bold text-brand-700 dark:text-brand-300">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-[#10B981] hover:underline focus:outline-none"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

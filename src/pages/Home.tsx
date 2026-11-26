import React, { useState, useEffect } from 'react';
import PrismaHero from '@/components/ui/prisma-hero';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService, type User } from '@/services/authService';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(authService.getCurrentUser());
    };
    handleAuthChange();
    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <div className="w-full bg-[#030303] text-white selection:bg-white selection:text-black overflow-hidden font-sans">
      {/* 1. CINEMATIC START / LOADING / HERO SECTION */}
      <PrismaHero user={user} onLogout={handleLogout} />

      {/* 2. PUBLIC SCROLL EXPERIENCE — AVAILABLE TO ALL VISITORS BEFORE LOGIN */}
      <div className="relative z-10 space-y-24 md:space-y-36 py-12 md:py-24">

        {/* SECTION 01 — ABOUT PLACEPILOT AI */}
        <section id="about" className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-400"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>About PlacePilot AI</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white"
            >
              About PlacePilot AI
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 sm:p-12 rounded-3xl bg-neutral-950/80 border border-neutral-800/80 backdrop-blur-xl text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed text-left sm:text-center max-w-3xl mx-auto space-y-4 shadow-2xl"
            >
              <p>
                PlacePilot AI is an AI-assisted placement preparation platform designed to help college students prepare for placement opportunities in a more organized, focused, and goal-oriented way.
              </p>
              <p className="text-neutral-400">
                The platform is designed to bring important placement preparation activities into one structured environment.
              </p>
            </motion.div>
          </div>
        </section>

        {/* SECTION 02 — PUBLIC CALL TO ACTION */}
        <section className="px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="p-10 sm:p-14 md:p-16 rounded-[2.5rem] bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Ready to Start Your Placement Journey?
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm md:text-base leading-relaxed">
                Create your account, understand your preparation level, and begin building your personalized placement preparation plan.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              {user ? (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-7 py-3.5 rounded-full bg-white text-black font-bold text-sm sm:text-base hover:bg-neutral-200 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xl"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="px-7 py-3.5 rounded-full bg-white text-black font-bold text-sm sm:text-base hover:bg-neutral-200 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xl"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="px-7 py-3.5 rounded-full bg-neutral-900 text-white border border-neutral-700 font-semibold text-sm sm:text-base hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 3. FOOTER */}
        <footer className="border-t border-neutral-800/80 py-10 px-6 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-400">
          <div className="flex items-center">
            <span className="font-bold text-white tracking-tight">PlacePilot AI</span>
          </div>

          <div className="flex items-center space-x-6 text-neutral-400">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            {user ? (
              <button type="button" onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors cursor-pointer">Dashboard</button>
            ) : (
              <button type="button" onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">Sign In</button>
            )}
          </div>

          <p>© 2026 PlacePilot AI. All rights reserved.</p>
        </footer>

      </div>
    </div>
  );
};

export default Home;

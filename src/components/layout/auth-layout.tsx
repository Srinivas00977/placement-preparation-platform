import React from 'react';
import { motion } from 'framer-motion';
import { Spotlight } from '@/components/ui/spotlight';
import { SplineScene } from '@/components/ui/spline';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#030303] text-neutral-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Background Subtle Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Mouse Following Spotlight Effect */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" />

      {/* Main Centered Container (Max Width ~1200px) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl rounded-3xl border border-neutral-800/80 bg-neutral-950/80 p-4 sm:p-6 lg:p-8 backdrop-blur-2xl shadow-[0_0_80px_-15px_rgba(0,0,0,0.9)] overflow-hidden"
      >
        {/* Subtle Inner Highlight Border */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/5" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[540px]">
          {/* LEFT COLUMN: Existing Auth Form */}
          <div className="lg:col-span-6 flex flex-col justify-center w-full z-20">
            {children}
          </div>

          {/* RIGHT COLUMN: 3D Humanoid AI Robot Visual (Directly on background, no inner border/card) */}
          <div className="lg:col-span-6 w-full h-[320px] sm:h-[400px] lg:h-[520px] relative flex items-center justify-center pointer-events-none sm:pointer-events-auto">
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

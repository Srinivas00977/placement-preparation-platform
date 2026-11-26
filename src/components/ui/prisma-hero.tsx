import React, { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, LogIn, ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService, type User } from "@/services/authService";

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({
  text,
  className = "",
  style,
}: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={`${word}-${i}`}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
};

export interface PrismaHeroProps {
  user?: User | null;
  onLogout?: () => Promise<void> | void;
}

const formatUserName = (name?: string) => {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const PrismaHero: React.FC<PrismaHeroProps> = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = propUser !== undefined ? propUser : authService.getCurrentUser();

  const handleLogout = async () => {
    setDropdownOpen(false);
    if (onLogout) {
      await onLogout();
    } else {
      await authService.logout();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const scrollToSection = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="top" className="w-full p-3 sm:p-5 md:p-6 bg-[#030303]">
      <div className="relative h-[88vh] min-h-[580px] sm:min-h-[640px] w-full overflow-hidden rounded-2xl md:rounded-[2rem] border border-white/10 shadow-2xl">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        />

        {/* Noise overlay */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90" />

        {/* Top Navbar */}
        <nav className="absolute left-0 right-0 top-0 z-30 px-3 py-3 sm:px-6 sm:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 rounded-full bg-black/75 backdrop-blur-xl border border-white/10 px-4 py-2 sm:px-6 sm:py-2.5 shadow-2xl">
            {/* LEFT: PlacePilot AI */}
            <button
              type="button"
              onClick={() => scrollToSection('top')}
              className="flex items-center text-left cursor-pointer group"
            >
              <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-neutral-200 transition-colors">
                PlacePilot AI
              </span>
            </button>

            {/* NAVIGATION LINKS — Smooth scroll to public landing sections */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className="text-xs lg:text-sm font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                About
              </button>
            </div>

            {/* RIGHT: Sign In or User Profile */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white transition-colors cursor-pointer"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white uppercase">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[100px] sm:max-w-[140px] truncate">{formatUserName(currentUser.name)}</span>
                  <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/15 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 text-left">
                      <p className="text-xs font-bold text-white truncate">{formatUserName(currentUser.name)}</p>
                      <p className="text-[11px] font-mono text-neutral-400 truncate">{currentUser.email}</p>
                    </div>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 text-xs sm:text-sm font-medium text-white transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </nav>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 sm:px-8 sm:pb-12 md:px-12 md:pb-14 z-20">
          <div className="grid grid-cols-12 items-end gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-3">
              {/* Supporting Badge */}
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase"
              >
                <span>AI PLACEMENT PREPARATION PLANNER</span>
              </motion.div>

              {/* Title / Main Greeting */}
              <h1
                key={currentUser ? `user-${currentUser.name}` : 'guest'}
                className={`font-extrabold tracking-[-0.03em] ${
                  currentUser
                    ? "text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] xl:text-5xl leading-[1.1] max-w-2xl break-words"
                    : "text-[15vw] sm:text-[13vw] md:text-[11vw] lg:text-[9.5vw] leading-[0.95]"
                }`}
                style={{ color: "#E1E0CC" }}
              >
                <WordsPullUp
                  text={
                    currentUser
                      ? `Welcome back, ${formatUserName(currentUser.name)}`
                      : "PlacePilot AI"
                  }
                />
              </h1>
            </div>

            <div className="col-span-12 flex flex-col gap-5 pb-2 lg:col-span-4 lg:pb-4">
              <motion.p
                key={currentUser ? 'user-desc' : 'guest-desc'}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm sm:text-base md:text-lg text-neutral-200 font-medium leading-relaxed"
              >
                {currentUser
                  ? "Continue your placement preparation journey."
                  : "Your journey from preparation to placement starts here."}
              </motion.p>

              <motion.div
                key={currentUser ? 'user-btns' : 'guest-btns'}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 flex-wrap"
              >
                {currentUser ? (
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="group inline-flex items-center gap-2 rounded-full bg-[#E1E0CC] py-2.5 pl-6 pr-2.5 text-sm font-bold text-black transition-all hover:gap-3 sm:text-base hover:bg-white shadow-xl cursor-pointer"
                  >
                    Go to Dashboard
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110">
                      <ArrowRight className="h-4 w-4" style={{ color: "#E1E0CC" }} />
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="group inline-flex items-center gap-2 rounded-full bg-[#E1E0CC] py-2.5 pl-6 pr-2.5 text-sm font-bold text-black transition-all hover:gap-3 sm:text-base hover:bg-white shadow-xl cursor-pointer"
                    >
                      Get Started
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110">
                        <ArrowRight className="h-4 w-4" style={{ color: "#E1E0CC" }} />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-6 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrismaHero;

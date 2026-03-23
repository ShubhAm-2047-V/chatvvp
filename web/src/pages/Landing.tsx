import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Shield, ArrowRight, Github } from 'lucide-react';
import HeroScene from '../components/3d/HeroScene';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen text-[var(--on-surface)] overflow-hidden selection:bg-[var(--primary)] selection:text-[var(--on-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary-dim)] to-[var(--primary)] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <BookOpen className="text-[var(--on-primary)] w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tighter">CHAT<span className="text-[var(--primary)]">VVP</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--on-surface-variant)]">
          <a href="#features" className="hover:text-[var(--primary)] transition-colors">Features</a>
          <a href="#about" className="hover:text-[var(--primary)] transition-colors">Vision</a>
          <Link to="/login" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-bright)] bg-opacity-30 border border-[var(--outline-variant)] mb-6">
              <Sparkles className="w-4 h-4 text-[var(--secondary)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--secondary)]">The Digital Sanctuary</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-tight mb-6 tracking-tighter">
              Unlock Your <span className="text-gradient">Flow State</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--on-surface-variant)] leading-relaxed mb-10 max-w-lg">
              A premium, AI-powered study environment designed for complete immersion. Curate your knowledge, visualize your progress, and master your subjects with crystalline focus.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="btn-primary scale-110">
                Launch Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="btn-secondary">
                View Vision <Shield className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* 3D Component */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative"
          >
            <HeroScene />
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-20 px-6 bg-[var(--surface-container-low)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">Elevate Every Session</h2>
            <p className="text-[var(--on-surface-variant)]">Precision tools for the modern academic.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} className="bento-card col-span-1 md:col-span-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <Sparkles className="w-32 h-32 text-[var(--primary)]" />
              </div>
              <div className="relative z-10">
                <div className="chip chip-success mb-4">AI Integration</div>
                <h3 className="text-3xl font-bold mb-4">Neural Study Assistant</h3>
                <p className="text-[var(--on-surface-variant)] max-w-md">Our integrated AI models analyze your notes, generate focus summaries, and quiz you on key concepts in real-time. It's not just support—it's a cognitive partnership.</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bento-card relative overflow-hidden group">
              <div className="chip bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">Security</div>
              <h3 className="text-2xl font-bold mb-4">Safe Harbor</h3>
              <p className="text-[var(--on-surface-variant)]">End-to-end encrypted study vaults. Your intellectual assets are protected within our "Digital Sanctuary" philosophy.</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bento-card relative overflow-hidden group">
              <div className="chip bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">Immersive</div>
              <h3 className="text-2xl font-bold mb-4">Glass UI</h3>
              <p className="text-[var(--on-surface-variant)]">Minimal friction, maximum depth. Our interface is designed to disappear, leaving only you and your work.</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bento-card col-span-1 md:col-span-2 relative overflow-hidden group bg-gradient-to-br from-[var(--surface-container)] to-[var(--surface-container-high)]">
              <h3 className="text-3xl font-bold mb-4">Academic Velocity</h3>
              <p className="text-[var(--on-surface-variant)] mb-8">Reduce context switching by 40% with unified resource management.</p>
              <div className="flex gap-4">
                <div className="w-full h-2 bg-[var(--surface-bright)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[var(--primary-dim)] to-[var(--primary)] shadow-[0_0_15px_var(--glow-indigo)]"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--outline-variant)] bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <BookOpen className="text-[var(--primary)] w-6 h-6" />
            <span className="font-bold tracking-tighter">CHATVVP</span>
          </div>
          <div className="text-[var(--on-surface-variant)] text-sm">
            © 2026 ChatVVP. Built with <span className="text-[var(--primary)]">Precision</span>.
          </div>
          <div className="flex gap-6">
            <Github className="w-5 h-5 text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

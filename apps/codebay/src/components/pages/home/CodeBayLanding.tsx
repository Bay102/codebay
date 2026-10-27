'use client';

import { Orbitron } from 'next/font/google';
import { motion } from 'framer-motion';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const projects = [
  { name: 'TaskFlow', status: 'Live' },
  { name: 'DevCanvas', status: 'Live' },
  { name: 'ShipStream', status: 'Internal' },
  { name: 'InsightHub', status: 'Live' },
];

export default function CodeBayLanding() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Left circuit field */}
        <div className="absolute left-0 top-0 h-full w-[45%] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 500 1000" preserveAspectRatio="none">
            <g stroke="#c9a227" strokeWidth="1.2" fill="none" opacity="0.55">
              <path d="M10 60 L90 60 L90 140 L180 140 L180 220 L280 220 L280 300" />
              <path d="M10 140 L70 140 L70 220 L150 220 L150 300 L240 300" />
              <path d="M10 220 L110 220 L110 300 L200 300 L200 380" />
              <path d="M10 300 L50 300 L50 380 L130 380 L130 460" />
              <circle cx="90" cy="60" r="2.5" fill="#c9a227" />
              <circle cx="180" cy="140" r="2.5" fill="#c9a227" />
              <circle cx="280" cy="220" r="2.5" fill="#c9a227" />
              <circle cx="150" cy="220" r="2" fill="#c9a227" />
              <circle cx="200" cy="300" r="2" fill="#c9a227" />
            </g>
          </svg>
        </div>

        {/* Right wave field */}
        <div className="absolute right-0 top-0 h-full w-[55%] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 700 1000" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c9a227" stopOpacity="0" />
                <stop offset="40%" stopColor="#c9a227" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#c9a227" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path d="M0 280 Q180 220 360 280 T700 250" stroke="url(#waveGlow)" strokeWidth="2" fill="none" />
            <path d="M0 380 Q180 320 360 380 T700 350" stroke="url(#waveGlow)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path d="M0 480 Q180 420 360 480 T700 450" stroke="url(#waveGlow)" strokeWidth="1" fill="none" opacity="0.45" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(201,162,39,0.12),transparent_60%)]" />
        </div>

        {/* CB Circuit Monogram */}
        <div className="relative z-10 mb-10">
          <svg width="200" height="150" viewBox="0 0 200 150" className="drop-shadow-[0_0_18px_rgba(201,162,39,0.55)]">
            <g stroke="#c9a227" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* C */}
              <path d="M48 32 H78 V42 H58 V108 H78 V118 H48 Z" />
              <circle cx="63" cy="75" r="3.5" fill="#c9a227" />
              {/* B */}
              <path d="M108 32 H142 V58 H162 V72 H142 V118 H108 Z" />
              <path d="M142 42 H155 V52 H142" />
              <path d="M142 82 H155 V108 H142" />
              <circle cx="125" cy="75" r="3.5" fill="#c9a227" />
            </g>
          </svg>
        </div>

        <h1 className={`${orbitron.className} relative z-10 text-5xl sm:text-6xl md:text-7xl tracking-[0.12em] text-white font-medium mb-5`}>
          CodeBay
        </h1>
        <p className="relative z-10 text-xs sm:text-sm tracking-[0.35em] text-[#c9a227]/80 uppercase">
          Engineering still matters.
        </p>
      </section>

      {/* Software Showcase */}
      <section className="relative py-28 md:py-36 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className={`${orbitron.className} text-2xl md:text-3xl mb-3 text-center text-[#c9a227]/90 tracking-wide`}>
            Software I've Built
          </h2>
          <p className="text-center text-zinc-500 mb-16 max-w-lg mx-auto text-sm md:text-base">
            Tools and systems shaped by real engineering judgment.
          </p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {projects.map((project) => (
              <motion.div
                key={project.name}
                className="group"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border border-[#c9a227]/35 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm group-hover:border-[#c9a227] group-hover:shadow-[0_0_24px_rgba(201,162,39,0.25)] transition-all duration-300">
                  <span className="text-sm tracking-wide">{project.name}</span>
                  <span className="text-[10px] text-[#c9a227]/70 mt-1 uppercase tracking-wider">{project.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Engineers */}
      <section className="relative py-28 md:py-36 px-6 border-t border-[#c9a227]/10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className={`${orbitron.className} text-3xl md:text-5xl mb-4 text-[#c9a227] tracking-wide`}>
              Why Engineers
            </h2>
            <p className="text-base md:text-lg text-zinc-400">
              AI accelerates. Engineers elevate.
            </p>
          </div>
          <div className="space-y-6">
            {[
              {
                title: 'Human Judgment',
                body: 'AI identifies patterns. Engineers bring wisdom, ethics, and accountability where context is incomplete. The difference between a working system and a trustworthy one is still human.',
              },
              {
                title: 'Context & Empathy',
                body: 'AI operates on data. Engineers understand people, needs, and the human impact behind every decision. Software exists to serve humans — not the other way around.',
              },
              {
                title: 'Architects of Systems',
                body: 'AI generates code. Engineers design resilient, scalable, and secure systems that stand the test of time. The architecture, the trade-offs, and the long-term consequences remain human responsibilities.',
              },
            ].map((item) => (
              <div key={item.title} className="border border-[#c9a227]/20 rounded-lg p-6 md:p-8 bg-black/50">
                <h3 className={`${orbitron.className} text-lg md:text-xl text-[#c9a227] mb-3 tracking-wide`}>
                  {item.title}
                </h3>
                <p className="text-zinc-300 leading-relaxed text-sm md:text-base">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="relative py-28 md:py-32 px-6 text-center border-t border-[#c9a227]/10">
        <p className={`${orbitron.className} text-xl md:text-3xl text-zinc-300 tracking-wide`}>
          Built with intention.
        </p>
        <p className="mt-4 text-zinc-500 text-sm tracking-[0.25em] uppercase">CodeBay</p>
      </section>
    </div>
  );
}

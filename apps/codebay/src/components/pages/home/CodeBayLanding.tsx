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
        {/* Left circuit field — denser, more deliberate traces */}
        <div className="absolute left-0 top-0 h-full w-[42%] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 480 900" preserveAspectRatio="none">
            <g stroke="#c9a227" strokeWidth="1.1" fill="none" opacity="0.65">
              <path d="M8 50 L70 50 L70 110 L150 110 L150 180 L240 180 L240 250 L320 250" />
              <path d="M8 120 L55 120 L55 190 L130 190 L130 260 L210 260 L210 330" />
              <path d="M8 190 L95 190 L95 260 L175 260 L175 340 L255 340" />
              <path d="M8 260 L40 260 L40 330 L110 330 L110 400 L190 400" />
              <path d="M8 330 L65 330 L65 400 L145 400 L145 470" />
              {/* nodes */}
              <circle cx="70" cy="50" r="2.2" fill="#c9a227" />
              <circle cx="150" cy="110" r="2.2" fill="#c9a227" />
              <circle cx="240" cy="180" r="2.2" fill="#c9a227" />
              <circle cx="130" cy="190" r="1.8" fill="#c9a227" />
              <circle cx="175" cy="260" r="1.8" fill="#c9a227" />
              <circle cx="110" cy="330" r="1.6" fill="#c9a227" />
            </g>
          </svg>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
        </div>

        {/* Right wave field — layered, glowing */}
        <div className="absolute right-0 top-0 h-full w-[58%] pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 720 900" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c9a227" stopOpacity="0" />
                <stop offset="35%" stopColor="#c9a227" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#c9a227" stopOpacity="0.08" />
              </linearGradient>
              <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c9a227" stopOpacity="0" />
                <stop offset="45%" stopColor="#c9a227" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#c9a227" stopOpacity="0.04" />
              </linearGradient>
            </defs>
            <path d="M0 260 Q200 200 400 260 T720 230" stroke="url(#wave1)" strokeWidth="2.2" fill="none" />
            <path d="M0 360 Q200 300 400 360 T720 330" stroke="url(#wave1)" strokeWidth="1.6" fill="none" opacity="0.75" />
            <path d="M0 460 Q200 400 400 460 T720 430" stroke="url(#wave2)" strokeWidth="1.2" fill="none" />
            <path d="M0 560 Q200 500 400 560 T720 530" stroke="url(#wave2)" strokeWidth="0.8" fill="none" opacity="0.6" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_42%,rgba(201,162,39,0.16),transparent_55%)]" />
        </div>

        {/* CB Circuit Monogram — cleaner geometry */}
        <div className="relative z-10 mb-12">
          <svg width="210" height="155" viewBox="0 0 210 155" className="drop-shadow-[0_0_22px_rgba(201,162,39,0.5)]">
            <g stroke="#c9a227" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* C */}
              <path d="M50 34 H82 V44 H60 V111 H82 V121 H50 Z" />
              <circle cx="66" cy="77" r="3.2" fill="#c9a227" />
              {/* B */}
              <path d="M112 34 H148 V60 H168 V74 H148 V121 H112 Z" />
              <path d="M148 44 H161 V54 H148" />
              <path d="M148 84 H161 V111 H148" />
              <circle cx="130" cy="77" r="3.2" fill="#c9a227" />
            </g>
          </svg>
        </div>

        <h1 className={`${orbitron.className} relative z-10 text-5xl sm:text-6xl md:text-[5.25rem] tracking-[0.14em] text-white font-medium mb-6`}>
          CodeBay
        </h1>
        <p className="relative z-10 text-xs sm:text-sm tracking-[0.38em] text-[#c9a227]/85 uppercase font-medium">
          Engineering still matters.
        </p>
      </section>

      {/* Software Showcase */}
      <section className="relative py-28 md:py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className={`${orbitron.className} text-2xl md:text-3xl mb-4 text-center text-[#c9a227]/90 tracking-wide`}>
            Software I've Built
          </h2>
          <p className="text-center text-zinc-500 mb-20 max-w-md mx-auto text-sm md:text-base">
            Tools and systems shaped by real engineering judgment.
          </p>
          <div className="flex flex-wrap justify-center gap-14 md:gap-24">
            {projects.map((project) => (
              <motion.div
                key={project.name}
                className="group"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              >
                <div className="w-30 h-30 md:w-36 md:h-36 rounded-full border border-[#c9a227]/30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-md group-hover:border-[#c9a227] group-hover:shadow-[0_0_28px_rgba(201,162,39,0.28)] transition-all duration-300">
                  <span className="text-sm md:text-base tracking-wide">{project.name}</span>
                  <span className="text-[10px] text-[#c9a227]/75 mt-1.5 uppercase tracking-widest">{project.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Engineers */}
      <section className="relative py-28 md:py-40 px-6 border-t border-[#c9a227]/10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${orbitron.className} text-3xl md:text-5xl mb-5 text-[#c9a227] tracking-wide`}>
              Why Engineers
            </h2>
            <p className="text-base md:text-lg text-zinc-400">
              AI accelerates. Engineers elevate.
            </p>
          </div>
          <div className="space-y-7">
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
              <div key={item.title} className="border border-[#c9a227]/18 rounded-xl p-7 md:p-9 bg-black/55">
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
      <section className="relative py-28 md:py-36 px-6 text-center border-t border-[#c9a227]/10">
        <p className={`${orbitron.className} text-xl md:text-3xl text-zinc-300 tracking-wide`}>
          Built with intention.
        </p>
        <p className="mt-5 text-zinc-500 text-xs tracking-[0.3em] uppercase">CodeBay</p>
      </section>
    </div>
  );
}

'use client';

import { Orbitron } from 'next/font/google';
import { motion } from 'framer-motion';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const projects = [
  { name: 'TaskFlow', status: 'Live' },
  { name: 'DevCanvas', status: 'Live' },
  { name: 'ShipStream', status: 'Internal' },
  { name: 'InsightHub', status: 'Live' },
];

export default function ImmersiveLanding() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        {/* Left circuit traces */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-70">
          <svg className="w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="none">
            <g stroke="#d4af37" strokeWidth="1" fill="none" opacity="0.6">
              <path d="M20 40 L80 40 L80 120 L160 120 L160 200 L240 200" />
              <path d="M20 100 L60 100 L60 180 L140 180 L140 260" />
              <path d="M20 180 L100 180 L100 260 L180 260" />
              <circle cx="80" cy="40" r="2" fill="#d4af37" />
              <circle cx="160" cy="120" r="2" fill="#d4af37" />
              <circle cx="240" cy="200" r="2" fill="#d4af37" />
            </g>
          </svg>
        </div>

        {/* Right particle wave */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-yellow-500/5 to-transparent" />
          <svg className="w-full h-full opacity-60" viewBox="0 0 600 800" preserveAspectRatio="none">
            <path d="M0 300 Q150 250 300 300 T600 280" stroke="#d4af37" strokeWidth="1.5" fill="none" opacity="0.5" />
            <path d="M0 400 Q150 350 300 400 T600 380" stroke="#d4af37" strokeWidth="1" fill="none" opacity="0.3" />
          </svg>
        </div>

        {/* CB Circuit Logo */}
        <div className="relative z-10 mb-8">
          <svg width="180" height="140" viewBox="0 0 180 140" className="drop-shadow-[0_0_12px_rgba(212,175,55,0.6)]">
            <g stroke="#d4af37" strokeWidth="2.5" fill="none">
              <path d="M40 30 L70 30 L70 40 L50 40 L50 100 L70 100 L70 110 L40 110 Z" />
              <circle cx="55" cy="70" r="3" fill="#d4af37" />
              <path d="M100 30 L130 30 L130 55 L150 55 L150 70 L130 70 L130 110 L100 110 Z" />
              <path d="M130 40 L145 40 L145 50 L130 50" />
              <path d="M130 80 L145 80 L145 100 L130 100" />
              <circle cx="115" cy="70" r="3" fill="#d4af37" />
            </g>
          </svg>
        </div>

        <h1 className={`${orbitron.className} text-6xl md:text-7xl tracking-wider text-white mb-4`}>
          CodeBay
        </h1>
        <p className="text-sm md:text-base tracking-[0.3em] text-yellow-500/80 uppercase">
          Engineering still matters.
        </p>
      </section>

      {/* Project Pathway */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className={`${orbitron.className} text-3xl mb-4 text-center text-yellow-500/90`}>
            Software I've Built
          </h2>
          <p className="text-center text-zinc-500 mb-16 max-w-xl mx-auto">
            A living collection of tools and systems shaped by real engineering judgment.
          </p>
          <div className="relative flex flex-wrap justify-center gap-16 md:gap-24">
            {projects.map((project) => (
              <motion.div
                key={project.name}
                className="group relative"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-32 h-32 rounded-full border border-yellow-500/40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm group-hover:border-yellow-500 transition-all">
                  <span className="text-sm tracking-wide">{project.name}</span>
                  <span className="text-xs text-yellow-500/70 mt-1">{project.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Engineers */}
      <section className="relative py-32 px-6 border-t border-yellow-500/10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${orbitron.className} text-4xl md:text-5xl mb-4 text-yellow-500`}>
              Why Engineers
            </h2>
            <p className="text-lg text-zinc-400">
              AI accelerates. Engineers elevate.
            </p>
          </div>
          <div className="space-y-8">
            <div className="border border-yellow-500/20 rounded-lg p-8 bg-black/40">
              <h3 className={`${orbitron.className} text-xl text-yellow-500 mb-3`}>Human Judgment</h3>
              <p className="text-zinc-300 leading-relaxed">
                AI identifies patterns. Engineers bring wisdom, ethics, and accountability where context is incomplete. The difference between a working system and a trustworthy one is still human.
              </p>
            </div>
            <div className="border border-yellow-500/20 rounded-lg p-8 bg-black/40">
              <h3 className={`${orbitron.className} text-xl text-yellow-500 mb-3`}>Context & Empathy</h3>
              <p className="text-zinc-300 leading-relaxed">
                AI operates on data. Engineers understand people, needs, and the human impact behind every decision. Software exists to serve humans — not the other way around.
              </p>
            </div>
            <div className="border border-yellow-500/20 rounded-lg p-8 bg-black/40">
              <h3 className={`${orbitron.className} text-xl text-yellow-500 mb-3`}>Architects of Systems</h3>
              <p className="text-zinc-300 leading-relaxed">
                AI generates code. Engineers design resilient, scalable, and secure systems that stand the test of time. The architecture, the trade-offs, and the long-term consequences remain human responsibilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="relative py-32 px-6 text-center border-t border-yellow-500/10">
        <p className={`${orbitron.className} text-2xl md:text-3xl text-zinc-300`}>
          Built with intention.
        </p>
        <p className="mt-4 text-zinc-500">CodeBay</p>
      </section>
    </div>
  );
}

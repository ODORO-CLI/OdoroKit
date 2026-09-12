import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Twitter, Instagram, Linkedin } from 'lucide-react';
import Magnetic from './Magnetic';
import BrandMark from './BrandMark';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const COLONNES = [
  { title: 'Studio', links: ['Réalisations', 'Services', 'Méthode', 'Carrières'] },
  { title: 'Maison', links: ['Histoire', 'Équipe', 'Journal', 'Contact'] },
  { title: 'Réseaux', links: ['Twitter', 'Instagram', 'LinkedIn', 'Dribbble'] },
];

// L'orbe d'accent hérite de l'accent vivant de la scène — à ce point de la page,
// c'est l'orange de marque, puisque le champ a fini de se saturer.
const orb = 'radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--accent) 75%, #fff) 0%, var(--accent) 48%, var(--accent-ink) 100%)';

export default function Footer() {
  return (
    <footer className="relative z-10 w-full bg-[#0a0a12] text-white rounded-t-[2.5rem] md:rounded-t-[4rem] overflow-hidden">
      {/* Halos doux, en écho à l'accent vivant */}
      <div
        className="pointer-events-none absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-40"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 65%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-32 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-25"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 65%)' }}
      />

      {/* Bandeau défilant */}
      <div className="border-b border-white/10 py-6 overflow-hidden">
        <div className="marquee-track text-[clamp(28px,6vw,64px)] font-raleway font-medium tracking-tight text-white/90">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="flex items-center">
              {['Moins de bruit', 'Plus de gravité', 'Concevoir avec du poids', 'Construisons'].map((t, i) => (
                <span key={i} className="flex items-center">
                  <span className="px-8">
                    {t === 'Plus de gravité'
                      ? <>Plus de <span className="font-serif-italic">gravité</span></>
                      : t}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--accent)' }} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="relative px-6 md:px-12 pt-16 md:pt-24 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Bloc CTA */}
          <motion.div
            className="lg:col-span-5"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            custom={0}
          >
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-white/40 mb-5">
              [ Collaborons ]
            </p>
            <h2 className="font-raleway font-medium text-4xl md:text-6xl leading-[0.95] tracking-[-0.03em]">
              Une idée qui a<br />du <span className="font-serif-italic" style={{ color: 'var(--accent)' }}>poids&nbsp;?</span>
            </h2>

            <Magnetic strength={0.25} className="inline-block mt-9">
              <a
                href="mailto:bonjour@odoro.studio"
                className="group inline-flex items-center gap-4 pl-7 pr-2 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-colors duration-300 active:scale-[0.97]"
                style={{ transition: 'transform 0.16s var(--ease-out), background 0.3s, border-color 0.3s' }}
              >
                <span className="font-raleway font-medium text-base md:text-lg">bonjour@odoro.studio</span>
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform duration-300"
                  style={{ background: orb }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </a>
            </Magnetic>
          </motion.div>

          {/* Colonnes de liens */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {COLONNES.map((col, ci) => (
              <motion.div
                key={col.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp}
                custom={ci + 1}
              >
                <h3 className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/40 mb-5">
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="font-raleway text-[15px] text-white/75 hover:text-white inline-flex items-center gap-1 transition-colors duration-200 group"
                      >
                        <span className="link-underline">{link}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Barre basse */}
        <div className="mt-20 md:mt-28 pt-7 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 select-none" aria-label="odoro">
              <BrandMark className="w-[18px] h-[18px] shrink-0" style={{ color: 'var(--accent)' }} />
              <span className="font-raleway font-semibold text-base tracking-[-0.02em] text-white lowercase">odoro</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            <p className="font-mono text-[11px] text-white/40">
              © 2026 Studio ODORO — Tous droits réservés.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {[Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all duration-200 active:scale-95"
                style={{ transition: 'transform 0.16s var(--ease-out), border-color 0.2s, background 0.2s, color 0.2s' }}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

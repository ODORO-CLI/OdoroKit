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
    <footer className="o-relative o-z-10 o-w-full gv-fond-nuit o-text-white gv-coin-haut gv-md-coin-haut o-overflow-hidden">
      {/* Halos doux, en écho à l'accent vivant */}
      <div
        className="o-pointer-events-none o-absolute gv-haut-neg-32 gv-droite-neg-24 gv-w-28r gv-h-28r o-rounded-full o-blur-3xl o-opacity-40"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 65%)' }}
      />
      <div
        className="o-pointer-events-none o-absolute gv-bas-neg-40 gv-gauche-neg-32 gv-w-32r gv-h-32r o-rounded-full o-blur-3xl o-opacity-25"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 65%)' }}
      />

      {/* Bandeau défilant */}
      <div className="o-border-b gv-filet-blanc-10 o-py-6 o-overflow-hidden">
        <div className="marquee-track gv-fs-geant font-raleway o-font-medium o-tracking-tight gv-encre-blanc-90">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="o-flex o-items-center">
              {['Moins de bruit', 'Plus de gravité', 'Concevoir avec du poids', 'Construisons'].map((t, i) => (
                <span key={i} className="o-flex o-items-center">
                  <span className="o-px-8">
                    {t === 'Plus de gravité'
                      ? <>Plus de <span className="font-serif-italic">gravité</span></>
                      : t}
                  </span>
                  <span className="o-w-2.5 o-h-2.5 o-rounded-full" style={{ background: 'var(--accent)' }} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="o-relative o-px-6 md:o-px-12 o-pt-16 md:o-pt-24 o-pb-10">
        <div className="o-grid o-grid-cols-1 lg:o-grid-cols-12 o-gap-12 lg:o-gap-8">
          {/* Bloc CTA */}
          <motion.div
            className="lg:o-col-span-5"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            custom={0}
          >
            <p className="gv-font-mono gv-fs-11 gv-tr-25 o-uppercase gv-encre-blanc-40 o-mb-5">
              [ Collaborons ]
            </p>
            <h2 className="font-raleway o-font-medium o-text-4xl md:o-text-6xl gv-lh-095 gv-tr-neg-03">
              Une idée qui a<br />du <span className="font-serif-italic" style={{ color: 'var(--accent)' }}>poids&nbsp;?</span>
            </h2>

            <Magnetic strength={0.25} className="o-inline-block o-mt-9">
              <a
                href="mailto:bonjour@odoro.studio"
                className="group o-inline-flex o-items-center o-gap-4 o-pl-7 o-pr-2 o-py-2 o-rounded-full o-border-w-1 gv-filet-blanc-15 gv-fond-blanc-5 gv-survol-fond-blanc-10 gv-survol-filet-blanc-30 o-transition-colors gv-duree-300 gv-appui-97"
                style={{ transition: 'transform 0.16s var(--ease-out), background 0.3s, border-color 0.3s' }}
              >
                <span className="font-raleway o-font-medium o-text-base md:o-text-lg">bonjour@odoro.studio</span>
                <span
                  className="o-w-10 o-h-10 o-rounded-full o-flex o-items-center o-justify-center gv-parent-tourne o-transition-transform gv-duree-300"
                  style={{ background: orb }}
                >
                  <ArrowUpRight className="o-w-4 o-h-4" />
                </span>
              </a>
            </Magnetic>
          </motion.div>

          {/* Colonnes de liens */}
          <div className="lg:o-col-span-7 o-grid o-grid-cols-2 sm:o-grid-cols-3 o-gap-8">
            {COLONNES.map((col, ci) => (
              <motion.div
                key={col.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp}
                custom={ci + 1}
              >
                <h3 className="gv-font-mono gv-fs-10 gv-tr-25 o-uppercase gv-encre-blanc-40 o-mb-5">
                  {col.title}
                </h3>
                <ul className="o-space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="font-raleway gv-fs-15 gv-encre-blanc-75 hover:o-text-white o-inline-flex o-items-center o-gap-1 o-transition-colors gv-duree-200 group"
                      >
                        <span className="link-underline">{link}</span>
                        <ArrowUpRight className="o-w-3.5 o-h-3.5 o-opacity-0 gv-tx-neg-1 gv-parent-opaque gv-parent-entre o-transition-all gv-duree-200" />
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Barre basse */}
        <div className="o-mt-20 md:o-mt-28 o-pt-7 o-border-t gv-filet-blanc-10 o-flex o-flex-col sm:o-flex-row o-items-start sm:o-items-center o-justify-between o-gap-5">
          <div className="o-flex o-items-center o-gap-3">
            <span className="o-inline-flex o-items-center o-gap-2 o-select-none" aria-label="odoro">
              <BrandMark className="gv-w-18 gv-h-18 o-shrink-0" style={{ color: 'var(--accent)' }} />
              <span className="font-raleway o-font-semibold o-text-base gv-tr-neg-02 o-text-white o-lowercase">odoro</span>
            </span>
            <span className="o-w-1.5 o-h-1.5 o-rounded-full" style={{ background: 'var(--accent)' }} />
            <p className="gv-font-mono gv-fs-11 gv-encre-blanc-40">
              © 2026 Studio ODORO — Tous droits réservés.
            </p>
          </div>
          <div className="o-flex o-items-center o-gap-3">
            {[Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="o-w-10 o-h-10 o-rounded-full o-border-w-1 gv-filet-blanc-15 o-flex o-items-center o-justify-center gv-encre-blanc-70 hover:o-text-white gv-survol-filet-blanc-40 gv-survol-fond-blanc-5 o-transition-all gv-duree-200 gv-appui-95"
                style={{ transition: 'transform 0.16s var(--ease-out), border-color 0.2s, background 0.2s, color 0.2s' }}
              >
                <Icon className="o-w-4 o-h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

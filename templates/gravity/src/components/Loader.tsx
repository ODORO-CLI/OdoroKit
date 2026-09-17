import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import BrandMark from './BrandMark';

interface LoaderProps {
  /** Passe à true une fois que la scène Three.js a rendu sa première image. */
  ready: boolean;
  /** Appelé quand l'animation de sortie se termine — la main passe à l'expérience. */
  onDone: () => void;
}

const MOT = 'odoro'.split('');

// Chaque glyphe monte hors d'un masque de débordement, en cascade.
const word = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.12 } },
};
const glyph = {
  hidden: { y: '110%' },
  show: {
    y: '0%',
    transition: { type: 'spring', stiffness: 120, damping: 18, mass: 0.9 } as const,
  },
};
const meta = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    // `as const` : sans lui la courbe s elargit en `number[]`, qu aucun type de
    // `motion` n accepte. Footer.tsx le faisait deja ; celle-ci avait ete
    // oubliee. Aucun effet a l execution.
    transition: { duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/**
 * Le pré-générique de marque — le sigle ODORO puis le mot-symbole se démasquent
 * glyphe par glyphe au-dessus d'une barre filaire.
 *
 * La barre monte toute seule jusqu'à ~92 % et ne termine QUE lorsque la scène
 * WebGL se déclare prête : la sortie attend donc réellement le montage 3D, elle
 * ne joue pas une durée fixe déguisée en progression. Si l'asset cale, la barre
 * reste à 92 — ce qui est honnête.
 */
export default function Loader({ ready, onDone }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let value = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (readyRef.current && value >= 99.4) {
        value = 100;
      } else {
        const ceiling = readyRef.current ? 100 : 92;
        value += (ceiling - value) * (readyRef.current ? 6 : 1.7) * dt;
        if (value > ceiling) value = ceiling;
      }
      setProgress(value);

      if (value >= 99.9 && readyRef.current && !doneRef.current) {
        doneRef.current = true;
        window.setTimeout(() => setLeaving(true), 160);
        window.setTimeout(() => onDone(), 160 + 560);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const pct = Math.round(progress);

  return (
    <div className={`loader-root ${leaving ? 'is-leaving' : ''}`} aria-hidden={leaving}>
      <div className="loader-content">
        <motion.div
          className="loader-word"
          variants={word}
          initial="hidden"
          animate="show"
          aria-label="odoro"
        >
          {/* Le sigle mène la cascade, le mot-symbole suit — un seul objet, pas
              un logo suivi d'un titre. */}
          <span style={{ display: 'inline-block', overflow: 'hidden' }}>
            <motion.span className="ch" variants={glyph} style={{ display: 'inline-block' }}>
              <BrandMark
                className="loader-mark"
                style={{ color: 'var(--accent, #F97316)' }}
              />
            </motion.span>
          </span>
          {MOT.map((c, i) => (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden' }}>
              <motion.span className="ch" variants={glyph}>
                {c}
              </motion.span>
            </span>
          ))}
        </motion.div>

        <motion.div className="loader-bar" variants={meta} initial="hidden" animate="show">
          <div className="loader-bar-fill" style={{ width: `${progress}%` }} />
        </motion.div>

        <motion.div className="loader-meta" variants={meta} initial="hidden" animate="show">
          <span className="loader-status">
            {pct < 100 ? 'Calibrage du champ de gravité' : 'Mise en orbite'}
          </span>
          <span className="loader-pct">{String(pct).padStart(3, '0')}%</span>
        </motion.div>
      </div>
    </div>
  );
}

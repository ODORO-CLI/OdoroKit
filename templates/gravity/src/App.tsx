import React, { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  X as CloseIcon,
  Menu as MenuIcon,
  ArrowUpRight,
  ArrowDown,
  MousePointer2,
} from 'lucide-react';
import FestivityCanvas from './components/FestivityCanvas';
import Loader from './components/Loader';
import Footer from './components/Footer';
import Cursor from './components/Cursor';
import Magnetic from './components/Magnetic';
import BrandMark from './components/BrandMark';
import { SceneControl } from './types';

// Les trois temps chromatiques d'ODORO (la palette de base du masthead).
// UNE SEULE famille : la page part ambre clair et se SATURE en descendant,
// jusqu'à l'orange de marque exact — qui tombe pile quand les sphères forment
// le sigle. Voir getDynamicColors dans FestivityCanvas : les hex sont partagés.
const THEME_PRESETS = {
  ambre: {
    id: 'ambre',
    name: 'Ambre & Papier',
    description: 'Le champ au repos — sphères ambrées sur un dégradé de papier chaud.',
    cssGradient: 'radial-gradient(circle at center, #ffffff 0%, #fff6ec 35%, #ffe0c2 100%)',
    primaryColor: '#FDBA74',
    color: '#FDBA74',
  },
  cuivre: {
    id: 'cuivre',
    name: 'Cuivre & Papier',
    description: 'La chute — le champ se réchauffe en tombant.',
    cssGradient: 'radial-gradient(circle at center, #ffffff 0%, #fff2e4 38%, #ffd2a8 100%)',
    primaryColor: '#FB923C',
    color: '#FB923C',
  },
  marque: {
    id: 'marque',
    name: 'Orange ODORO',
    description: "L'orange de marque exact — la couleur sur laquelle la page résout.",
    cssGradient: 'radial-gradient(circle at center, #ffffff 0%, #ffece0 38%, #ffc79b 100%)',
    primaryColor: '#F97316',
    color: '#F97316',
  },
} as const;

type ThemeKey = keyof typeof THEME_PRESETS;

// Dégradés de fond accordés à la palette de sphères pilotée par le scroll.
const CUIVRE_BG = 'radial-gradient(circle at center, #ffffff 0%, #fff2e4 38%, #ffd2a8 100%)';
const MARQUE_BG = 'radial-gradient(circle at center, #ffffff 0%, #ffece0 38%, #ffc79b 100%)';

// L'accent d'interface (une encre lisible + une lueur vive) suit la palette
// vivante de la scène : l'interface se sature ambre → cuivre → orange ODORO en
// verrouillage avec le champ 3D. L'encre FONCE à mesure que la teinte sature,
// sinon le texte se délave sur le fond de plus en plus chaud.
function getAccent(stage: number, selectedColor: string) {
  if (stage === 2) return { vivid: '#F97316', ink: '#7C2D12' };
  if (stage === 1) return { vivid: '#FB923C', ink: '#9A3412' };
  const c = selectedColor.toLowerCase();
  if (c === '#f97316') return { vivid: '#F97316', ink: '#7C2D12' };
  if (c === '#fb923c') return { vivid: '#FB923C', ink: '#9A3412' };
  return { vivid: '#FDBA74', ink: '#B45309' };
}

// ---------------------------------------------------------------------------
// Reveal — l'entrée déclenchée au scroll, utilisée par le contenu des sections.
// ---------------------------------------------------------------------------
function Reveal({
  children,
  delay = 0,
  className = '',
  y = 42,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Eyebrow — le libellé d'index, précédé d'une pastille à l'accent vivant.
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow o-inline-flex o-items-center o-gap-2.5" style={{ color: 'var(--accent-ink)' }}>
      <span
        className="o-inline-block o-w-1.5 o-h-1.5 o-rounded-full"
        style={{ background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }}
      />
      {children}
    </span>
  );
}

export default function App() {
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('ambre');
  const [selectedColor, setSelectedColor] = useState('#FDBA74');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Poignée de main avec le loader
  const [sceneReady, setSceneReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);

  // Le fond suit la palette de sphères (0 = masthead, 1 = cuivre, 2 = orange ODORO)
  const [bgStage, setBgStage] = useState(0);

  // Refs de performance — aucun re-render React au pointeur ni au scroll
  const mousePosRef = useRef({ x: 99, y: 99, isDown: false });
  const controlRef = useRef<SceneControl>({ progress: 0, started: false });
  const railFillRef = useRef<HTMLDivElement>(null);

  // --- Scroll lissé par Lenis ---
  const lenisRef = useRef<Lenis | null>(null);
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // --- suivi du pointeur (pilote la répulsion des sphères, globalement) ---
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mousePosRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePosRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onDown = () => { mousePosRef.current.isDown = true; };
    const onUp = () => { mousePosRef.current.isDown = false; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // --- scroll → avancement physique + étape de fond + remplissage du rail (bridé en rAF) ---
  useEffect(() => {
    let raf = 0;
    let queued = false;
    const update = () => {
      queued = false;
      const vh = window.innerHeight || 1;
      const progress = window.scrollY / vh;
      controlRef.current.progress = progress;
      const stage = progress > 1.55 ? 2 : progress > 0.7 ? 1 : 0;
      setBgStage((s) => (s === stage ? s : stage));

      // Piloter le rail d'avancement en direct (aucun re-render React)
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight || 1;
      const pct = Math.min(1, Math.max(0, window.scrollY / max));
      if (railFillRef.current) railFillRef.current.style.height = `${pct * 100}%`;
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleReady = useCallback(() => setSceneReady(true), []);
  const handleLoaderDone = useCallback(() => {
    setRevealed(true);
    controlRef.current.started = true;
    setLoaderGone(true);
  }, []);
  const noop = useCallback(() => {}, []);

  const heroGradient = () => {
    const hex = selectedColor.toLowerCase();
    if (hex === '#f97316') return MARQUE_BG;
    if (hex === '#fb923c') return CUIVRE_BG;
    if (hex === '#fdba74') return 'radial-gradient(circle at center, #ffffff 0%, #fff6ec 35%, #ffe0c2 100%)';
    return THEME_PRESETS[activeTheme].cssGradient;
  };
  const background = bgStage === 2 ? MARQUE_BG : bgStage === 1 ? CUIVRE_BG : heroGradient();
  const accent = getAccent(bgStage, selectedColor);

  // Le dégradé de l'orbe du CTA — bâti sur l'accent vivant, donc il morphe avec la scène.
  const orb = `radial-gradient(circle at 50% 28%, color-mix(in srgb, var(--accent) 75%, #fff) 0%, var(--accent) 48%, var(--accent-ink) 100%)`;

  return (
    <div
      className="o-relative o-w-full"
      style={{
        ['--accent' as string]: accent.vivid,
        ['--accent-ink' as string]: accent.ink,
        transition: '--accent 1.1s var(--ease-in-out), --accent-ink 1.1s var(--ease-in-out)',
      }}
    >
      {/* Dégradé de fond fixe, derrière tout — il fond d’une palette à l’autre */}
      <div
        className="o-fixed o-inset-0 gv-z-neg-10"
        style={{ background, transition: 'background 1.2s cubic-bezier(0.65,0,0.35,1)' }}
      />

      {/* THREE.JS WEBGL — fixe, il couvre tout le parcours de scroll */}
      <FestivityCanvas
        key={selectedColor}
        onInteract={noop}
        onReady={handleReady}
        mousePosRef={mousePosRef}
        controlRef={controlRef}
        ballColor={selectedColor}
      />

      {/* Grain argentique + curseur maison — la couche tactile */}
      <div className="grain" aria-hidden />
      <Cursor />

      {/* LOADER */}
      {!loaderGone && <Loader ready={sceneReady} onDone={handleLoaderDone} />}

      {/* RAIL D'AVANCEMENT DU SCROLL */}
      {revealed && (
        <motion.div
          className="rail o-hidden md:o-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div ref={railFillRef} className="rail-fill" style={{ height: '0%' }} />
        </motion.div>
      )}

      {/* EN-TÊTE */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={revealed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="o-fixed o-top-0 o-inset-x-0 o-h-20 md:o-h-24 o-z-30 o-px-6 md:o-px-12 o-flex o-items-center o-justify-between o-pointer-events-none"
      >
        <Magnetic className="o-pointer-events-auto" strength={0.25}>
          <a href="#top" className="o-flex o-items-center o-gap-2.5 o-select-none" aria-label="odoro">
            <BrandMark
              className="gv-w-24 gv-h-24 gv-md-w-27 gv-md-h-27 o-shrink-0"
              style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 10px var(--accent))' }}
            />
            <span className="font-raleway o-font-semibold o-text-xl md:o-text-2xl gv-tr-neg-02 gv-encre o-lowercase">
              odoro
            </span>
          </a>
        </Magnetic>

        {/* Groupe de droite — liens de nav et CTA partagent une ligne en desktop */}
        <div className="o-flex o-items-center o-gap-2 md:o-gap-3 o-pointer-events-auto">
          <nav className="o-hidden md:o-flex o-items-center o-gap-1 font-raleway gv-fs-135 o-font-medium gv-encre glass o-rounded-full o-px-2 o-py-1.5">
            {['Réalisations', 'Services', 'Équipe', 'Histoire'].map((l) => (
              <a
                key={l}
                href="#"
                className="o-px-4 o-py-1.5 o-rounded-full gv-survol-fond-blanc-40 o-transition-colors gv-duree-300"
              >
                {l}
              </a>
            ))}
          </nav>

          {/* CTA — pilule complète en desktop, orbe compact en mobile */}
          <Magnetic strength={0.35}>
            <button className="group o-flex o-items-center gv-gap-14 o-pl-6 o-pr-1.5 o-py-1.5 o-rounded-full glass gv-survol-fond-blanc-30 o-transition-colors gv-duree-300 gv-appui-97"
              style={{ transition: 'transform 0.16s var(--ease-out), background 0.3s' }}>
              <span className="font-raleway o-font-medium gv-fs-14 gv-encre o-select-none gv-pb-1">
                Parlons-en
              </span>
              <span
                className="o-w-8 o-h-8 o-rounded-full o-flex o-items-center o-justify-center o-text-white gv-ombre-interne gv-parent-grossit o-transition-transform gv-duree-300"
                style={{ background: orb }}
              >
                <ArrowUpRight className="o-w-4 o-h-4 gv-trait-25 gv-parent-tourne o-transition-transform gv-duree-300" />
              </span>
            </button>
          </Magnetic>

          {/* Bascule du menu mobile */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Ouvrir le menu"
            className="md:o-hidden o-w-11 o-h-11 o-rounded-full glass gv-survol-fond-blanc-30 o-flex o-items-center o-justify-center gv-encre gv-appui-95"
            style={{ transition: 'transform 0.16s var(--ease-out), background 0.3s' }}
          >
            <MenuIcon className="o-w-5 o-h-5" />
          </button>
        </div>
      </motion.header>

      {/* ===================== SECTION 01 — HERO ===================== */}
      <section id="top" className="o-relative o-z-10 gv-min-h-ecran o-w-full o-flex o-items-end o-pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="o-w-full o-px-6 md:o-px-12 o-pb-12 md:o-pb-16"
        >
          <div className="o-flex o-flex-col md:o-flex-row md:o-items-end o-justify-between o-gap-8">
            <div className="o-flex o-flex-col o-gap-5 md:o-gap-6 o-items-start">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={revealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <Eyebrow>Studio numérique indépendant</Eyebrow>
              </motion.div>
              <h1 className="display gv-fs-30r sm:o-text-7xl gv-md-fs-112 gv-encre o-select-none">
                <span className="o-block o-overflow-hidden" style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
                  <motion.span
                    className="o-block"
                    initial={{ y: '110%' }}
                    animate={revealed ? { y: '0%' } : {}}
                    transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    Moins de bruit.
                  </motion.span>
                </span>
                <span className="o-block o-overflow-hidden" style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
                  <motion.span
                    className="o-block"
                    initial={{ y: '110%' }}
                    animate={revealed ? { y: '0%' } : {}}
                    transition={{ duration: 1, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  >
                    Plus de <span className="font-serif-italic" style={{ color: 'var(--accent-ink)' }}>gravité.</span>
                  </motion.span>
                </span>
              </h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="gv-md-w-280 o-pb-1 md:o-pb-3 o-shrink-0 o-text-left o-pointer-events-auto"
            >
              <p className="font-raleway gv-fs-15 gv-md-fs-16 gv-lh-145 gv-encre">
                Nous concevons des expériences numériques qui écartent la
                distraction et mettent l'attention en orbite.
              </p>
              <p className="gv-font-mono gv-fs-10 gv-tr-18 o-uppercase gv-encre-faible o-mt-6">
                © 2026 — Studio ODORO
              </p>
              <div className="o-hidden md:o-flex o-items-center o-gap-2 o-mt-5 gv-encre-douce">
                <ArrowDown className="o-w-3.5 o-h-3.5 o-animate-bounce" />
                <span className="gv-font-mono gv-fs-10 gv-tr-20 o-uppercase">Faites défiler pour entrer</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ===================== SECTION 02 — LA CHUTE ===================== */}
      <section className="o-relative o-z-10 gv-min-h-ecran o-w-full o-flex o-items-center o-pt-32 md:o-pt-40 o-pb-40 o-px-6 md:o-px-12 o-pointer-events-none">
        <div className="o-w-full o-grid o-grid-cols-1 lg:o-grid-cols-12 o-gap-10 lg:o-gap-16 o-items-start o-pointer-events-auto">
          <div className="lg:o-col-span-7">
            <Reveal>
              <Eyebrow>02 — Physique</Eyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="o-mt-7 display gv-fs-26r sm:o-text-6xl gv-md-fs-80 gv-encre">
                Quand la structure<br className="o-hidden sm:o-block" /> <span className="font-serif-italic" style={{ color: 'var(--accent-ink)' }}>lâche.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="o-mt-8 o-max-w-lg font-raleway gv-fs-16 gv-md-fs-19 gv-lh-155 gv-encre-douce">
                Continuez à faire défiler et le champ cède à la gravité. Chaque sphère
                obéit à une physique réellement simulée — masse, quantité de mouvement,
                restitution — dégringole et rebondit sur le sol jusqu'à ce que l'énergie
                finisse par se déposer.
              </p>
            </Reveal>
          </div>

          <div className="lg:o-col-span-5 lg:o-pt-3">
            <Reveal delay={0.25} className="o-relative o-flex o-flex-col o-gap-4">
              {[
                { n: '01', k: 'Solveur', v: 'Verlet', u: '· 4 sous-pas', d: 'Empilement stable à 60 fps' },
                { n: '02', k: 'Restitution', v: '0,65', u: 'rebond', d: "De l'énergie perdue à chaque contact" },
                { n: '03', k: 'Corps', v: 'Temps réel', u: 'sur GPU', d: 'Aucune animation pré-calculée' },
              ].map((s) => (
                <div
                  key={s.k}
                  className="group o-relative o-overflow-hidden o-flex o-items-center o-gap-5 md:o-gap-7 o-px-6 md:o-px-8 o-py-5 md:o-py-6 o-border-w-1 gv-filet-blanc-60 o-bg-gradient-to-br gv-degrade-de gv-degrade-vers o-backdrop-blur-2xl o-transition-transform gv-duree-500 gv-survol-monte"
                >
                  {/* balayage de lustre en diagonale au survol */}
                  <div className="o-pointer-events-none o-absolute o-inset-0 gv-tx-neg-140 o-skew-x-12 o-bg-gradient-to-r o-from-transparent gv-degrade-par o-to-transparent o-transition-transform gv-duree-1100 gv-ease-out gv-parent-traverse" />

                  {/* numéro d'index surdimensionné — rempli en dégradé, accroché à l'accent vivant */}
                  <span
                    className="font-raleway o-font-light gv-fs-44 gv-md-fs-54 gv-lh-1 o-tracking-tight gv-fond-sur-texte o-text-transparent o-select-none o-shrink-0"
                    style={{ backgroundImage: 'linear-gradient(140deg, var(--accent) 0%, var(--accent-ink) 100%)' }}
                  >
                    {s.n}
                  </span>

                  <span className="o-w-px o-self-stretch o-my-1.5 gv-fond-encre-10 o-shrink-0" />

                  <div className="o-flex-1 o-min-w-0">
                    <div className="o-flex o-items-center o-gap-2">
                      <span className="gv-font-mono gv-fs-10 gv-tr-22 o-uppercase gv-encre-faible">{s.k}</span>
                      <span className="o-ml-auto o-flex o-items-center o-gap-1.5">
                        <span className="o-relative o-flex o-h-1.5 o-w-1.5">
                          <span className="o-absolute o-inline-flex o-h-full o-w-full o-rounded-full o-opacity-60 o-animate-ping" style={{ background: 'var(--accent)' }} />
                          <span className="o-relative o-inline-flex o-h-1.5 o-w-1.5 o-rounded-full" style={{ background: 'var(--accent)' }} />
                        </span>
                        <span className="gv-font-mono gv-fs-9 gv-tr-20 o-uppercase gv-encre-faible">direct</span>
                      </span>
                    </div>
                    <div className="o-mt-1.5 font-raleway o-font-semibold gv-fs-21 gv-md-fs-23 o-leading-tight gv-encre">
                      {s.v} <span className="o-font-normal gv-fs-15 gv-encre-faible">{s.u}</span>
                    </div>
                    <p className="o-mt-0.5 font-raleway gv-fs-13 gv-encre-faible">{s.d}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 03 — LA FORME (le sigle) ===================== */}
      <section className="o-relative o-z-10 gv-min-h-ecran o-w-full o-flex o-flex-col o-justify-between o-py-36 md:o-py-44 o-px-6 md:o-px-12 o-pointer-events-none">
        <div className="o-pointer-events-auto">
          <Reveal>
            <Eyebrow>03 — Forme</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="o-mt-7 o-max-w-2xl display gv-fs-26r sm:o-text-6xl gv-md-fs-80 gv-encre">
              Le chaos, puis la <span className="font-serif-italic" style={{ color: 'var(--accent-ink)' }}>forme.</span>
            </h2>
          </Reveal>
        </div>

        <div className="o-self-end o-max-w-sm o-text-left md:o-text-right o-pointer-events-auto">
          <Reveal delay={0.15}>
            <p className="font-raleway gv-fs-16 gv-md-fs-19 gv-lh-155 gv-encre-douce">
              Sortie de la chute libre, le champ se réassemble — chaque sphère
              trouve sa place dans le sigle ODORO. Promenez le curseur au travers,
              et regardez l'ordre onduler, se disperser, puis se reprendre.
            </p>
          </Reveal>
          <Reveal delay={0.28}>
            <div className="o-mt-7 o-inline-flex o-items-center o-gap-2 o-px-4 o-py-2.5 o-rounded-full glass gv-encre-douce">
              <MousePointer2 className="o-w-3.5 o-h-3.5" />
              <span className="gv-font-mono gv-fs-10 gv-tr-20 o-uppercase">Balayez au travers</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SECTION 04 — LIBÉRATION (envol dans l'objectif) ============ */}
      <section className="o-relative o-z-10 gv-min-h-ecran o-w-full o-flex o-flex-col o-items-center o-justify-center o-text-center o-py-36 md:o-py-44 o-px-6 md:o-px-12 o-pointer-events-none">
        <div className="o-pointer-events-auto o-max-w-3xl">
          <Reveal>
            <Eyebrow>04 — Libération</Eyebrow>
          </Reveal>
          <Reveal delay={0.12}>
            <h2 className="o-mt-8 display gv-fs-28r sm:o-text-7xl gv-md-fs-96 gv-encre">
              Et puis,<br /> <span className="font-serif-italic" style={{ color: 'var(--accent-ink)' }}>l'apesanteur.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="o-mt-8 o-mx-auto o-max-w-md font-raleway gv-fs-16 gv-md-fs-19 gv-lh-155 gv-encre-douce">
              Le champ tout entier décolle de l'écran et vous dépasse — chaque sphère
              accélère dans l'objectif jusqu'à ce qu'il ne reste que la lumière.
              Moins de bruit.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <Footer />

      {/* ===================== MENU DE NAVIGATION MOBILE ===================== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="o-fixed o-inset-0 o-z-50 md:o-hidden"
          >
            <div className="o-absolute o-inset-0 gv-fond-blanc-85 o-backdrop-blur-2xl" onClick={() => setIsMenuOpen(false)} />
            <div className="o-relative o-flex o-flex-col o-h-full o-px-6 o-pt-6 o-pb-10">
              <div className="o-flex o-items-center o-justify-between">
                <span className="o-inline-flex o-items-center o-gap-2.5 o-select-none" aria-label="odoro">
                  <BrandMark className="gv-w-22 gv-h-22 o-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span className="font-raleway o-font-semibold o-text-xl gv-tr-neg-02 gv-encre o-lowercase">odoro</span>
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Fermer le menu"
                  className="o-w-11 o-h-11 o-rounded-full glass o-flex o-items-center o-justify-center gv-encre gv-appui-95"
                  style={{ transition: 'transform 0.16s var(--ease-out), background 0.3s' }}
                >
                  <CloseIcon className="o-w-5 o-h-5" />
                </button>
              </div>

              <nav className="o-mt-auto o-mb-auto o-flex o-flex-col o-gap-1">
                {['Réalisations', 'Services', 'Équipe', 'Histoire', 'Contact'].map((l, i) => (
                  <motion.a
                    key={l}
                    href="#"
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="display gv-fs-325r gv-lh-105 gv-encre o-flex o-items-center o-gap-3"
                  >
                    <span className="gv-font-mono gv-fs-12 o-font-normal gv-tr-10" style={{ color: 'var(--accent-ink)' }}>
                      0{i + 1}
                    </span>
                    <span>{l}</span>
                  </motion.a>
                ))}
              </nav>

              <a
                href="mailto:bonjour@odoro.studio"
                onClick={() => setIsMenuOpen(false)}
                className="group o-flex o-items-center o-justify-between o-gap-4 o-pl-7 o-pr-2 o-py-2 o-rounded-full glass gv-appui-97"
                style={{ transition: 'transform 0.16s var(--ease-out), background 0.3s' }}
              >
                <span className="font-raleway o-font-medium gv-fs-15 gv-encre">bonjour@odoro.studio</span>
                <span
                  className="o-w-10 o-h-10 o-rounded-full o-flex o-items-center o-justify-center o-text-white gv-parent-tourne o-transition-transform gv-duree-300"
                  style={{ background: orb }}
                >
                  <ArrowUpRight className="o-w-4 o-h-4" />
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
    <span className="eyebrow inline-flex items-center gap-2.5" style={{ color: 'var(--accent-ink)' }}>
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
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
      className="relative w-full"
      style={{
        ['--accent' as string]: accent.vivid,
        ['--accent-ink' as string]: accent.ink,
        transition: '--accent 1.1s var(--ease-in-out), --accent-ink 1.1s var(--ease-in-out)',
      }}
    >
      {/* Dégradé de fond fixe, derrière tout — il fond d’une palette à l’autre */}
      <div
        className="fixed inset-0 -z-10"
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
          className="rail hidden md:block"
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
        className="fixed top-0 inset-x-0 h-20 md:h-24 z-30 px-6 md:px-12 flex items-center justify-between pointer-events-none"
      >
        <Magnetic className="pointer-events-auto" strength={0.25}>
          <a href="#top" className="flex items-center gap-2.5 select-none" aria-label="odoro">
            <BrandMark
              className="w-[24px] h-[24px] md:w-[27px] md:h-[27px] shrink-0"
              style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 10px var(--accent))' }}
            />
            <span className="font-raleway font-semibold text-xl md:text-2xl tracking-[-0.02em] text-[var(--ink)] lowercase">
              odoro
            </span>
          </a>
        </Magnetic>

        {/* Groupe de droite — liens de nav et CTA partagent une ligne en desktop */}
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
          <nav className="hidden md:flex items-center gap-1 font-raleway text-[13.5px] font-medium text-[var(--ink)] glass rounded-full px-2 py-1.5">
            {['Réalisations', 'Services', 'Équipe', 'Histoire'].map((l) => (
              <a
                key={l}
                href="#"
                className="px-4 py-1.5 rounded-full hover:bg-white/40 transition-colors duration-300"
              >
                {l}
              </a>
            ))}
          </nav>

          {/* CTA — pilule complète en desktop, orbe compact en mobile */}
          <Magnetic strength={0.35}>
            <button className="group flex items-center gap-[14px] pl-6 pr-1.5 py-1.5 rounded-full glass hover:bg-white/30 transition-colors duration-300 active:scale-[0.97]"
              style={{ transition: 'transform 0.16s var(--ease-out), background 0.3s' }}>
              <span className="font-raleway font-medium text-[14px] text-[var(--ink)] select-none pb-[1px]">
                Parlons-en
              </span>
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)] group-hover:scale-105 transition-transform duration-300"
                style={{ background: orb }}
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5] group-hover:rotate-45 transition-transform duration-300" />
              </span>
            </button>
          </Magnetic>

          {/* Bascule du menu mobile */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Ouvrir le menu"
            className="md:hidden w-11 h-11 rounded-full glass hover:bg-white/30 flex items-center justify-center text-[var(--ink)] active:scale-95"
            style={{ transition: 'transform 0.16s var(--ease-out), background 0.3s' }}
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>
      </motion.header>

      {/* ===================== SECTION 01 — HERO ===================== */}
      <section id="top" className="relative z-10 min-h-[100svh] w-full flex items-end pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="w-full px-6 md:px-12 pb-12 md:pb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex flex-col gap-5 md:gap-6 items-start">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={revealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <Eyebrow>Studio numérique indépendant</Eyebrow>
              </motion.div>
              <h1 className="display text-[3rem] sm:text-7xl md:text-[112px] text-[var(--ink)] select-none">
                <span className="block overflow-hidden" style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
                  <motion.span
                    className="block"
                    initial={{ y: '110%' }}
                    animate={revealed ? { y: '0%' } : {}}
                    transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  >
                    Moins de bruit.
                  </motion.span>
                </span>
                <span className="block overflow-hidden" style={{ paddingBottom: '0.12em', marginBottom: '-0.12em' }}>
                  <motion.span
                    className="block"
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
              className="md:w-[280px] pb-1 md:pb-3 flex-shrink-0 text-left pointer-events-auto"
            >
              <p className="font-raleway text-[15px] md:text-[16px] leading-[1.45] text-[var(--ink)]">
                Nous concevons des expériences numériques qui écartent la
                distraction et mettent l'attention en orbite.
              </p>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-faint)] mt-6">
                © 2026 — Studio ODORO
              </p>
              <div className="hidden md:flex items-center gap-2 mt-5 text-[var(--ink-soft)]">
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Faites défiler pour entrer</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ===================== SECTION 02 — LA CHUTE ===================== */}
      <section className="relative z-10 min-h-[100svh] w-full flex items-center pt-32 md:pt-40 pb-40 px-6 md:px-12 pointer-events-none">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pointer-events-auto">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow>02 — Physique</Eyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-7 display text-[2.6rem] sm:text-6xl md:text-[80px] text-[var(--ink)]">
                Quand la structure<br className="hidden sm:block" /> <span className="font-serif-italic" style={{ color: 'var(--accent-ink)' }}>lâche.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-lg font-raleway text-[16px] md:text-[19px] leading-[1.55] text-[var(--ink-soft)]">
                Continuez à faire défiler et le champ cède à la gravité. Chaque sphère
                obéit à une physique réellement simulée — masse, quantité de mouvement,
                restitution — dégringole et rebondit sur le sol jusqu'à ce que l'énergie
                finisse par se déposer.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:pt-3">
            <Reveal delay={0.25} className="relative flex flex-col gap-4">
              {[
                { n: '01', k: 'Solveur', v: 'Verlet', u: '· 4 sous-pas', d: 'Empilement stable à 60 fps' },
                { n: '02', k: 'Restitution', v: '0,65', u: 'rebond', d: "De l'énergie perdue à chaque contact" },
                { n: '03', k: 'Corps', v: 'Temps réel', u: 'sur GPU', d: 'Aucune animation pré-calculée' },
              ].map((s) => (
                <div
                  key={s.k}
                  className="group relative overflow-hidden flex items-center gap-5 md:gap-7 px-6 md:px-8 py-5 md:py-6 border border-white/60 bg-gradient-to-br from-white/75 to-white/25 backdrop-blur-2xl transition-transform duration-500 hover:-translate-y-1"
                >
                  {/* balayage de lustre en diagonale au survol */}
                  <div className="pointer-events-none absolute inset-0 -translate-x-[140%] skew-x-12 bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-[140%]" />

                  {/* numéro d'index surdimensionné — rempli en dégradé, accroché à l'accent vivant */}
                  <span
                    className="font-raleway font-light text-[44px] md:text-[54px] leading-none tracking-tight bg-clip-text text-transparent select-none shrink-0"
                    style={{ backgroundImage: 'linear-gradient(140deg, var(--accent) 0%, var(--accent-ink) 100%)' }}
                  >
                    {s.n}
                  </span>

                  <span className="w-px self-stretch my-1.5 bg-[var(--ink)]/10 shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--ink-faint)]">{s.k}</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping" style={{ background: 'var(--accent)' }} />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                        </span>
                        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--ink-faint)]">direct</span>
                      </span>
                    </div>
                    <div className="mt-1.5 font-raleway font-semibold text-[21px] md:text-[23px] leading-tight text-[var(--ink)]">
                      {s.v} <span className="font-normal text-[15px] text-[var(--ink-faint)]">{s.u}</span>
                    </div>
                    <p className="mt-0.5 font-raleway text-[13px] text-[var(--ink-faint)]">{s.d}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 03 — LA FORME (le sigle) ===================== */}
      <section className="relative z-10 min-h-[100svh] w-full flex flex-col justify-between py-36 md:py-44 px-6 md:px-12 pointer-events-none">
        <div className="pointer-events-auto">
          <Reveal>
            <Eyebrow>03 — Forme</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-7 max-w-2xl display text-[2.6rem] sm:text-6xl md:text-[80px] text-[var(--ink)]">
              Le chaos, puis la <span className="font-serif-italic" style={{ color: 'var(--accent-ink)' }}>forme.</span>
            </h2>
          </Reveal>
        </div>

        <div className="self-end max-w-sm text-left md:text-right pointer-events-auto">
          <Reveal delay={0.15}>
            <p className="font-raleway text-[16px] md:text-[19px] leading-[1.55] text-[var(--ink-soft)]">
              Sortie de la chute libre, le champ se réassemble — chaque sphère
              trouve sa place dans le sigle ODORO. Promenez le curseur au travers,
              et regardez l'ordre onduler, se disperser, puis se reprendre.
            </p>
          </Reveal>
          <Reveal delay={0.28}>
            <div className="mt-7 inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass text-[var(--ink-soft)]">
              <MousePointer2 className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Balayez au travers</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SECTION 04 — LIBÉRATION (envol dans l'objectif) ============ */}
      <section className="relative z-10 min-h-[100svh] w-full flex flex-col items-center justify-center text-center py-36 md:py-44 px-6 md:px-12 pointer-events-none">
        <div className="pointer-events-auto max-w-3xl">
          <Reveal>
            <Eyebrow>04 — Libération</Eyebrow>
          </Reveal>
          <Reveal delay={0.12}>
            <h2 className="mt-8 display text-[2.8rem] sm:text-7xl md:text-[96px] text-[var(--ink)]">
              Et puis,<br /> <span className="font-serif-italic" style={{ color: 'var(--accent-ink)' }}>l'apesanteur.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-8 mx-auto max-w-md font-raleway text-[16px] md:text-[19px] leading-[1.55] text-[var(--ink-soft)]">
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
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 bg-white/85 backdrop-blur-2xl" onClick={() => setIsMenuOpen(false)} />
            <div className="relative flex flex-col h-full px-6 pt-6 pb-10">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2.5 select-none" aria-label="odoro">
                  <BrandMark className="w-[22px] h-[22px] shrink-0" style={{ color: 'var(--accent)' }} />
                  <span className="font-raleway font-semibold text-xl tracking-[-0.02em] text-[var(--ink)] lowercase">odoro</span>
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Fermer le menu"
                  className="w-11 h-11 rounded-full glass flex items-center justify-center text-[var(--ink)] active:scale-95"
                  style={{ transition: 'transform 0.16s var(--ease-out), background 0.3s' }}
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <nav className="mt-auto mb-auto flex flex-col gap-1">
                {['Réalisations', 'Services', 'Équipe', 'Histoire', 'Contact'].map((l, i) => (
                  <motion.a
                    key={l}
                    href="#"
                    onClick={() => setIsMenuOpen(false)}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="display text-[3.25rem] leading-[1.05] text-[var(--ink)] flex items-center gap-3"
                  >
                    <span className="font-mono text-[12px] font-normal tracking-[0.1em]" style={{ color: 'var(--accent-ink)' }}>
                      0{i + 1}
                    </span>
                    <span>{l}</span>
                  </motion.a>
                ))}
              </nav>

              <a
                href="mailto:bonjour@odoro.studio"
                onClick={() => setIsMenuOpen(false)}
                className="group flex items-center justify-between gap-4 pl-7 pr-2 py-2 rounded-full glass active:scale-[0.97]"
                style={{ transition: 'transform 0.16s var(--ease-out), background 0.3s' }}
              >
                <span className="font-raleway font-medium text-[15px] text-[var(--ink)]">bonjour@odoro.studio</span>
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white group-hover:rotate-45 transition-transform duration-300"
                  style={{ background: orb }}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

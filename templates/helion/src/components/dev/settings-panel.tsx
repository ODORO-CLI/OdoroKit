import { useState } from "react";

import {
  exportConfig,
  useSceneConfig,
  type Bloom,
  type BloomScene,
  type LogoConfig,
  type VortexConfig,
  type VortexShape,
} from "@/lib/scene/scene-config";
import { type PaletteKey } from "@/lib/scene/palette";
import { useIsMobile } from "@/hooks/use-is-mobile";

/**
 * Dev settings panel — one tab per scene, each with its geometry / shape,
 * 3D-scene colours and bloom, plus a shared Apply / Export / Reset footer. Live
 * where it can be (logo, vortex sizes/glow/shape, bloom, logo colours); the
 * vortex palette, particle density and baked shape apply on "Apply vortex" (it
 * remounts the scene). A floating tool, not part of the product.
 */

/* ------------------------------------------------------------------- specs */

interface Spec<K> {
  key: K;
  label: string;
  min: number;
  max: number;
  step: number;
}

type VortexSpec = Spec<keyof VortexConfig>;
type ShapeSpec = Spec<keyof VortexShape>;
type LogoSpec = Spec<keyof LogoConfig>;

const HERO_SHAPE: ShapeSpec[] = [
  { key: "galaxyScale", label: "Scale", min: 0.3, max: 2.5, step: 0.05 },
  { key: "galaxyEllipse", label: "Flatten", min: 0.2, max: 2, step: 0.05 },
  { key: "galaxyPitch", label: "Arm sweep", min: 0.2, max: 3, step: 0.05 },
  { key: "galaxyDrift", label: "Drift", min: 0.2, max: 2.5, step: 0.05 },
];
const SERVICES_SHAPE: ShapeSpec[] = [
  { key: "burstScale", label: "Scale", min: 0.3, max: 2.5, step: 0.05 },
  { key: "burstSpread", label: "Length (Apply)", min: 0.3, max: 2, step: 0.05 },
  { key: "burstCurl", label: "Curl (Apply)", min: 0, max: 3, step: 0.05 },
  { key: "burstBend", label: "Bend (Apply)", min: 0, max: 3, step: 0.05 },
];
const TIMELINE_SHAPE: ShapeSpec[] = [
  { key: "maelInner", label: "Inner R (Apply)", min: 0.4, max: 1.8, step: 0.05 },
  { key: "maelOuter", label: "Outer R (Apply)", min: 0.5, max: 2, step: 0.05 },
  {
    key: "maelTightness",
    label: "Winding (Apply)",
    min: 0.4,
    max: 2,
    step: 0.05,
  },
  { key: "maelFunnel", label: "Funnel (Apply)", min: 0, max: 3, step: 0.05 },
  { key: "maelSpin", label: "Spin", min: 0, max: 3, step: 0.05 },
];

const HERO_GEO: VortexSpec[] = [
  { key: "galaxySize", label: "Galaxy size", min: 0.2, max: 3, step: 0.05 },
  { key: "galaxyGlow", label: "Galaxy glow", min: 0, max: 3, step: 0.05 },
  { key: "density", label: "Density (Apply)", min: 0.2, max: 2, step: 0.05 },
];
const SERVICES_GEO: VortexSpec[] = [
  { key: "burstSize", label: "Burst size", min: 0.2, max: 3, step: 0.05 },
  { key: "burstGlow", label: "Burst glow", min: 0, max: 3, step: 0.05 },
];
const TIMELINE_GEO: VortexSpec[] = [
  { key: "maelSize", label: "Maelstrom size", min: 0.2, max: 3, step: 0.05 },
  { key: "maelGlow", label: "Maelstrom glow", min: 0, max: 3, step: 0.05 },
];
const LOGO_GEO: LogoSpec[] = [
  { key: "count", label: "Count", min: 500, max: 20000, step: 200 },
  { key: "markSize", label: "Mark size", min: 3, max: 16, step: 0.1 },
  { key: "thickness", label: "Thickness", min: 0, max: 6, step: 0.05 },
  { key: "spreadMin", label: "Scatter radius", min: 0, max: 20, step: 0.5 },
  { key: "spreadSpan", label: "Scatter span", min: 0, max: 20, step: 0.5 },
  { key: "pointSize", label: "Point size", min: 0.2, max: 3, step: 0.05 },
  { key: "mouseStrength", label: "Cursor turn", min: 0, max: 2, step: 0.02 },
  { key: "tilt", label: "Tilt", min: -1, max: 1, step: 0.02 },
];

const LOGO_BG: LogoSpec[] = [
  { key: "bgSpeed", label: "BG speed", min: 0, max: 3, step: 0.05 },
  { key: "bgSize", label: "BG size", min: 0.2, max: 4, step: 0.05 },
  { key: "bgBright", label: "BG brightness", min: 0, max: 4, step: 0.05 },
];

const BLOOM_FIELDS: Spec<keyof Bloom>[] = [
  { key: "strength", label: "Strength", min: 0, max: 2, step: 0.02 },
  { key: "radius", label: "Radius", min: 0, max: 1.5, step: 0.02 },
  { key: "threshold", label: "Threshold", min: 0, max: 1, step: 0.02 },
];

const PALETTE_BY_SCENE: Record<BloomScene, PaletteKey[]> = {
  hero: ["accent500", "accent400", "accent300", "accent200", "foreground"],
  services: ["accent700", "accent600"],
  timeline: ["accent900", "accent800", "signalGlow", "signalRing"],
  logo: [],
};

const TABS: { id: BloomScene; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "services", label: "Services" },
  { id: "timeline", label: "Timeline" },
  { id: "logo", label: "Logo" },
];

/* --------------------------------------------------------------- primitives */

const rowLabel =
  "o-flex o-items-center o-justify-between o-gap-2 hl-text-11px hl-text-white-70";
const swatch =
  "o-size-6 o-shrink-0 o-cursor-pointer hl-rounded o-border-w-1 hl-border-white-20 o-bg-transparent o-p-0";

const Range = <K extends string>({
  spec,
  value,
  onChange,
}: {
  spec: Spec<K>;
  value: number;
  onChange: (v: number) => void;
}) => (
  <label className="o-flex o-flex-col o-gap-1">
    <span className={rowLabel}>
      <span>{spec.label}</span>
      <span className="o-tabular-nums hl-text-white-50">
        {value.toFixed(spec.step < 1 ? 2 : 0)}
      </span>
    </span>
    <input
      type="range"
      min={spec.min}
      max={spec.max}
      step={spec.step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="o-w-full hl-accent-6d8bff"
    />
  </label>
);

const ColorRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className={rowLabel}>
    <span>{label}</span>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={swatch}
      aria-label={label}
    />
  </div>
);

const Group = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="o-flex o-flex-col o-gap-2">
    <span className="hl-text-10px o-font-semibold hl-tracking-0-15em hl-text-white-45 o-uppercase">
      {title}
    </span>
    {children}
  </div>
);

/* -------------------------------------------------------------------- panel */

export const SettingsPanel = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<BloomScene>("hero");
  const [copied, setCopied] = useState(false);

  const logo = useSceneConfig((s) => s.logo);
  const vortex = useSceneConfig((s) => s.vortex);
  const shape = useSceneConfig((s) => s.shape);
  const bloom = useSceneConfig((s) => s.bloom);
  const palette = useSceneConfig((s) => s.palette);
  const setLogo = useSceneConfig((s) => s.setLogo);
  const setVortex = useSceneConfig((s) => s.setVortex);
  const setShape = useSceneConfig((s) => s.setShape);
  const setBloom = useSceneConfig((s) => s.setBloom);
  const setPaletteColor = useSceneConfig((s) => s.setPaletteColor);
  const applyPalette = useSceneConfig((s) => s.applyPalette);
  const reset = useSceneConfig((s) => s.reset);
  const isMobile = useIsMobile();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportConfig());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  /* A scene-tuning tool, never part of the shipped product. Off in production
   * builds entirely (the `⚙` and the 300px panel would otherwise sit over live
   * content), and off on phones in every build — the panel is wider than the tuning
   * is worth on a 390px screen. Hooks above run unconditionally; only the output is
   * gated. */
  if (process.env.NODE_ENV === "production" || isMobile) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open scene settings"
        className="o-fixed o-right-4 o-bottom-4 hl-z-200 o-flex o-size-11 o-items-center o-justify-center o-rounded-full o-border-w-1 hl-border-white-20 hl-bg-black-80 o-text-lg hl-text-white-90 o-backdrop-blur-md hover:o-text-white"
      >
        ⚙
      </button>
    );
  }

  const bloomControls = (scene: BloomScene) => (
    <Group title="Bloom">
      {BLOOM_FIELDS.map((f) => (
        <Range
          key={f.key}
          spec={f}
          value={bloom[scene][f.key]}
          onChange={(v) => setBloom(scene, f.key, v)}
        />
      ))}
    </Group>
  );

  const vortexGeo = (specs: VortexSpec[]) => (
    <Group title="Geometry">
      {specs.map((s) => (
        <Range
          key={s.key}
          spec={s}
          value={vortex[s.key]}
          onChange={(v) => setVortex(s.key, v)}
        />
      ))}
    </Group>
  );

  const vortexShape = (specs: ShapeSpec[]) => (
    <Group title="Shape">
      {specs.map((s) => (
        <Range
          key={s.key}
          spec={s}
          value={shape[s.key]}
          onChange={(v) => setShape(s.key, v)}
        />
      ))}
    </Group>
  );

  const sceneColours = (scene: BloomScene) => (
    <Group title="Colours (Apply)">
      {PALETTE_BY_SCENE[scene].map((k) => (
        <ColorRow
          key={k}
          label={k}
          value={palette[k]}
          onChange={(v) => setPaletteColor(k, v)}
        />
      ))}
    </Group>
  );

  return (
    <div className="o-fixed o-top-4 o-right-4 o-bottom-4 hl-z-200 o-flex hl-w-300px o-flex-col o-overflow-hidden o-rounded-2xl o-border-w-1 hl-border-white-15 hl-bg-black-85 o-text-white o-backdrop-blur-md">
      <div className="o-flex o-items-center o-justify-between o-border-b hl-border-white-10 o-px-3 o-py-2">
        <span className="o-text-xs o-font-semibold o-tracking-wide o-uppercase">
          Scene settings
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close settings"
          className="hl-text-white-60 hover:o-text-white"
        >
          ✕
        </button>
      </div>

      {/* Scene tabs */}
      <div className="o-flex o-gap-1 o-border-b hl-border-white-10 o-px-2 o-py-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`o-flex-1 o-rounded-md o-px-2 o-py-1 hl-text-11px o-font-medium ${
              tab === t.id
                ? "hl-bg-3a5cff-30 o-text-white"
                : "hl-text-white-60 hover:o-text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="o-flex o-flex-col o-gap-4 o-overflow-y-auto o-px-3 o-py-3">
        {tab === "hero" && (
          <>
            {vortexShape(HERO_SHAPE)}
            {vortexGeo(HERO_GEO)}
            {sceneColours("hero")}
            {bloomControls("hero")}
          </>
        )}

        {tab === "services" && (
          <>
            {vortexShape(SERVICES_SHAPE)}
            {vortexGeo(SERVICES_GEO)}
            {sceneColours("services")}
            {bloomControls("services")}
          </>
        )}

        {tab === "timeline" && (
          <>
            {vortexShape(TIMELINE_SHAPE)}
            {vortexGeo(TIMELINE_GEO)}
            {sceneColours("timeline")}
            {bloomControls("timeline")}
          </>
        )}

        {tab === "logo" && (
          <>
            <Group title="Geometry">
              {LOGO_GEO.map((s) => (
                <Range
                  key={s.key}
                  spec={s}
                  value={logo[s.key] as number}
                  onChange={(v) => setLogo(s.key, v)}
                />
              ))}
            </Group>
            <Group title="Background motes">
              {LOGO_BG.map((s) => (
                <Range
                  key={s.key}
                  spec={s}
                  value={logo[s.key] as number}
                  onChange={(v) => setLogo(s.key, v)}
                />
              ))}
            </Group>
            <Group title="Colours">
              <Range
                spec={{
                  key: "brightness",
                  label: "Brightness",
                  min: 0.1,
                  max: 3,
                  step: 0.05,
                }}
                value={logo.brightness}
                onChange={(v) => setLogo("brightness", v)}
              />
              <ColorRow
                label="Colour A"
                value={logo.colorA}
                onChange={(v) => setLogo("colorA", v)}
              />
              <ColorRow
                label="Colour B"
                value={logo.colorB}
                onChange={(v) => setLogo("colorB", v)}
              />
            </Group>
            {bloomControls("logo")}
          </>
        )}
      </div>

      <div className="o-flex o-flex-col o-gap-2 o-border-t hl-border-white-10 o-px-3 o-py-2">
        {tab !== "logo" && (
          <button
            type="button"
            onClick={applyPalette}
            className="o-rounded-md o-border-w-1 hl-border-white-20 hl-bg-white-5 o-px-3 o-py-1.5 hl-text-11px hl-text-white-90 hl-hover-bg-white-10"
          >
            Apply vortex (palette + density)
          </button>
        )}
        <div className="o-flex o-gap-2">
          <button
            type="button"
            onClick={copy}
            className="o-flex-1 o-rounded-md o-border-w-1 hl-border-6d8bff-50 hl-bg-3a5cff-20 o-px-3 o-py-1.5 o-text-xs o-font-semibold o-text-white hl-hover-bg-3a5cff-30"
          >
            {copied ? "Copied ✓" : "Export config"}
          </button>
          <button
            type="button"
            onClick={reset}
            className="o-rounded-md o-border-w-1 hl-border-white-20 o-px-3 o-py-1.5 o-text-xs hl-text-white-80 hl-hover-bg-white-10"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

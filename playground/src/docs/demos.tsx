/**
 * Les demonstrations vivantes, une par entree de registre.
 *
 * ## La seule chose qui ne peut pas venir du catalogue
 *
 * Le titre, la description, les proprietes, le cout : tout cela est dans le
 * `meta.json`, et la page d'entree le lit. Ce qui ne peut pas s'en deduire,
 * c'est le composant lui-meme — il faut l'importer, et lui donner un contexte
 * ou il ait un sens : un fond veut un cadre plein, un effet de texte veut une
 * phrase, un carrousel veut des diapositives.
 *
 * D'ou cette table, une ligne par entree. Une entree sans ligne reste
 * documentee — sa fiche vient du registre — mais sans apercu, et la page le
 * dit.
 *
 * @module
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { Aurora } from '@/odoro/background/Aurora.jsx'
import { Bubbles } from '@/odoro/background/Bubbles.jsx'
import { Caustics } from '@/odoro/background/Caustics.jsx'
import { Cells } from '@/odoro/background/Cells.jsx'
import { Contour } from '@/odoro/background/Contour.jsx'
import { Halftone } from '@/odoro/background/Halftone.jsx'
import { Hex } from '@/odoro/background/Hex.jsx'
import { Mosaic } from '@/odoro/background/Mosaic.jsx'
import { Plasma } from '@/odoro/background/Plasma.jsx'
import { Rain } from '@/odoro/background/Rain.jsx'
import { RippleGrid } from '@/odoro/background/RippleGrid.jsx'
import { Silk } from '@/odoro/background/Silk.jsx'
import { Spectrum } from '@/odoro/background/Spectrum.jsx'
import { Stars } from '@/odoro/background/Stars.jsx'
import { Threads } from '@/odoro/background/Threads.jsx'
import { Tunnel } from '@/odoro/background/Tunnel.jsx'
import { Vortex } from '@/odoro/background/Vortex.jsx'
import { Beams } from '@/odoro/background/Beams.jsx'
import { DotMatrix } from '@/odoro/background/DotMatrix.jsx'
import { GlobeMesh } from '@/odoro/background/GlobeMesh.jsx'
import { OrbitalSphere } from '@/odoro/background/OrbitalSphere.jsx'
import { Dots } from '@/odoro/background/Dots.jsx'
import { GridLines } from '@/odoro/background/GridLines.jsx'
import { Mesh } from '@/odoro/background/Mesh.jsx'
import { Waves } from '@/odoro/background/Waves.jsx'
import { Tide } from '@/odoro/hero/Tide.jsx'
import { CircularText } from '@/odoro/text/CircularText.jsx'
import { CounterRoll } from '@/odoro/text/CounterRoll.jsx'
import { EchoText } from '@/odoro/text/EchoText.jsx'
import { FallingText } from '@/odoro/text/FallingText.jsx'
import { LetterSwap } from '@/odoro/text/LetterSwap.jsx'
import { SpotlightText } from '@/odoro/text/SpotlightText.jsx'
import { StrokeText } from '@/odoro/text/StrokeText.jsx'
import { UnderlineDraw } from '@/odoro/text/UnderlineDraw.jsx'
import { ClickSparks } from '@/odoro/effect/ClickSparks.jsx'
import { CursorRing } from '@/odoro/effect/CursorRing.jsx'
import { BeamConnect } from '@/odoro/effect/BeamConnect.jsx'
import { GlitchHover } from '@/odoro/effect/GlitchHover.jsx'
import { ScrollVelocity } from '@/odoro/effect/ScrollVelocity.jsx'
import { InertiaDrag } from '@/odoro/effect/InertiaDrag.jsx'
import { RevealMask } from '@/odoro/effect/RevealMask.jsx'
import { FloatGroup } from '@/odoro/effect/FloatGroup.jsx'
import { Duotone } from '@/odoro/image/Duotone.jsx'
import { HoverZoom } from '@/odoro/image/HoverZoom.jsx'
import { ImageTrail } from '@/odoro/image/ImageTrail.jsx'
import { KenBurns } from '@/odoro/image/KenBurns.jsx'
import { ParallaxImage } from '@/odoro/image/ParallaxImage.jsx'
import { RevealImage } from '@/odoro/image/RevealImage.jsx'
import { TiltGlare } from '@/odoro/image/TiltGlare.jsx'
import { DotsLoader } from '@/odoro/loader/DotsLoader.jsx'
import { TopLoader } from '@/odoro/loader/TopLoader.jsx'
import { Torch } from '@/odoro/background/Torch.jsx'
import { ClickWaves } from '@/odoro/background/ClickWaves.jsx'
import { MagnetGrid } from '@/odoro/background/MagnetGrid.jsx'
import { Wake } from '@/odoro/background/Wake.jsx'
import { VeilParallax } from '@/odoro/background/VeilParallax.jsx'
import { Ink } from '@/odoro/background/Ink.jsx'
import { Comet } from '@/odoro/background/Comet.jsx'
import { Lightning } from '@/odoro/background/Lightning.jsx'
import { Lava } from '@/odoro/background/Lava.jsx'
import { Kaleidoscope } from '@/odoro/background/Kaleidoscope.jsx'
import { Rays } from '@/odoro/background/Rays.jsx'
import { Radar } from '@/odoro/background/Radar.jsx'
import { TvStatic } from '@/odoro/background/TvStatic.jsx'
import { Bokeh } from '@/odoro/background/Bokeh.jsx'
import { Dunes } from '@/odoro/background/Dunes.jsx'
import { Snow } from '@/odoro/background/Snow.jsx'
import { Currents } from '@/odoro/background/Currents.jsx'
import { AvatarStack } from '@/odoro/ui/AvatarStack.jsx'
import { CodeInput } from '@/odoro/ui/CodeInput.jsx'
import { CopyButton } from '@/odoro/ui/CopyButton.jsx'
import { FileDrop } from '@/odoro/ui/FileDrop.jsx'
import { LiquidButton } from '@/odoro/ui/LiquidButton.jsx'
import { PillTabs } from '@/odoro/ui/PillTabs.jsx'
import { ProgressRing } from '@/odoro/ui/ProgressRing.jsx'
import { RatingStars } from '@/odoro/ui/RatingStars.jsx'
import { StackedCards } from '@/odoro/ui/StackedCards.jsx'
import { ThemeSwitch } from '@/odoro/ui/ThemeSwitch.jsx'
import { GraphPaper } from '@/odoro/background/GraphPaper.jsx'
import { Noise } from '@/odoro/background/Noise.jsx'
import { Stripes } from '@/odoro/background/Stripes.jsx'
import { Checker } from '@/odoro/background/Checker.jsx'
import { Crosshatch } from '@/odoro/background/Crosshatch.jsx'
import { Rings } from '@/odoro/background/Rings.jsx'
import { RadialGlow } from '@/odoro/background/RadialGlow.jsx'
import { MeshStatic } from '@/odoro/background/MeshStatic.jsx'
import { Blueprint } from '@/odoro/background/Blueprint.jsx'
import { SpotGrid } from '@/odoro/background/SpotGrid.jsx'
import { Nebula } from '@/odoro/background/Nebula.jsx'
import { Fireflies } from '@/odoro/background/Fireflies.jsx'
import { Ribbons } from '@/odoro/background/Ribbons.jsx'
import { Smoke } from '@/odoro/background/Smoke.jsx'
import { Ripples } from '@/odoro/background/Ripples.jsx'
import { Scanlines } from '@/odoro/background/Scanlines.jsx'
import { Warp } from '@/odoro/background/Warp.jsx'
import { Interference } from '@/odoro/background/Interference.jsx'
import { RippleClick } from '@/odoro/effect/RippleClick.jsx'
import { Meteors } from '@/odoro/effect/Meteors.jsx'
import { OrbitingDots } from '@/odoro/effect/OrbitingDots.jsx'
import { OrbitLoader } from '@/odoro/loader/OrbitLoader.jsx'
import { BlurReveal } from '@/odoro/text/BlurReveal.jsx'
import { GlitchText } from '@/odoro/text/GlitchText.jsx'
import { GradientFlow } from '@/odoro/text/GradientFlow.jsx'
import { WaveText } from '@/odoro/text/WaveText.jsx'
import { FlipCard } from '@/odoro/ui/FlipCard.jsx'
import { GlowCard } from '@/odoro/ui/GlowCard.jsx'
import { ScrollVideo } from '@/odoro/hero/ScrollVideo.jsx'
import { BookShelf } from '@/odoro/section/BookShelf.jsx'
import { OrbitalTimeline } from '@/odoro/section/OrbitalTimeline.jsx'
import { CardForm } from '@/odoro/ui/CardForm.jsx'
import { HoverRevealButton } from '@/odoro/ui/HoverRevealButton.jsx'
import { PearlButton } from '@/odoro/ui/PearlButton.jsx'
import { PromptInput } from '@/odoro/ui/PromptInput.jsx'
import { ShinyButton } from '@/odoro/ui/ShinyButton.jsx'
import { CinematicFooter } from '@/odoro/section/CinematicFooter.jsx'
import { SignIn } from '@/odoro/section/SignIn.jsx'
import { BorderBeam } from '@/odoro/effect/BorderBeam.jsx'
import { NeonBorder } from '@/odoro/effect/NeonBorder.jsx'
import { Carousel } from '@/odoro/effect/Carousel.jsx'
import { Deform } from '@/odoro/effect/Deform.jsx'
import { Magnetic } from '@/odoro/effect/Magnetic.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { Parallax } from '@/odoro/effect/Parallax.jsx'
import { ScrollProgress } from '@/odoro/effect/ScrollProgress.jsx'
import { Spotlight } from '@/odoro/effect/Spotlight.jsx'
import { Molten } from '@/odoro/hero/Molten.jsx'
import { Compare } from '@/odoro/image/Compare.jsx'
import { Frame } from '@/odoro/image/Frame.jsx'
import { Player } from '@/odoro/image/Player.jsx'
import { Video } from '@/odoro/image/Video.jsx'
import { Faq } from '@/odoro/section/Faq.jsx'
import { LogoBand } from '@/odoro/section/LogoBand.jsx'
import { RevealGrid } from '@/odoro/section/RevealGrid.jsx'
import { ScrollSteps } from '@/odoro/section/ScrollSteps.jsx'
import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { PricingTiers } from '@/odoro/section/PricingTiers.jsx'
import { StatBand } from '@/odoro/section/StatBand.jsx'
import { MagnifyDock } from '@/odoro/ui/MagnifyDock.jsx'
import { TiltCard } from '@/odoro/ui/TiltCard.jsx'
import { CountUp } from '@/odoro/text/CountUp.jsx'
import { DecodeText } from '@/odoro/text/DecodeText.jsx'
import { HighlightSweep } from '@/odoro/text/HighlightSweep.jsx'
import { RotatingWords } from '@/odoro/text/RotatingWords.jsx'
import { ShineText } from '@/odoro/text/ShineText.jsx'
import { SplitLines } from '@/odoro/text/SplitLines.jsx'
import { SplitReveal } from '@/odoro/text/SplitReveal.jsx'
import { Typewriter } from '@/odoro/text/Typewriter.jsx'
import {
  CopyDemo,
  InViewDemo,
  IntervalClockDemo,
  KeyboardListDemo,
  MeasureDemo,
  MediaQueryDemo,
  PointerDampedDemo,
  PosterDemo,
  ScrollProgressDemo,
} from './demos-hooks.jsx'
import {
  CounterGateDemo,
  CursorHaloDemo,
  CurtainWipeDemo,
} from './demos-loaders.jsx'
import type {
  AtelierControl,
  AtelierFrame,
  AtelierValues,
} from './components/Atelier.jsx'
import { DemoContent } from './components/DemoContent.jsx'
import { ParticleField } from '@/odoro/background/ParticleField.js'
import { Hyperspace } from '@/odoro/background/Hyperspace.js'
import { GalaxySpiral } from '@/odoro/background/GalaxySpiral.js'
import { Swarm } from '@/odoro/background/Swarm.js'
import { Constellation } from '@/odoro/background/Constellation.js'
import { Embers } from '@/odoro/background/Embers.js'
import { Fireworks } from '@/odoro/background/Fireworks.js'
import { Dust } from '@/odoro/background/Dust.js'
import { Pollen } from '@/odoro/background/Pollen.js'
import { OrbitRings } from '@/odoro/background/OrbitRings.js'
import { RingSpinner } from '@/odoro/loader/RingSpinner.js'
import { DualRing } from '@/odoro/loader/DualRing.js'
import { ArcTrio } from '@/odoro/loader/ArcTrio.js'
import { DashRing } from '@/odoro/loader/DashRing.js'
import { GradientRing } from '@/odoro/loader/GradientRing.js'
import { CometRing } from '@/odoro/loader/CometRing.js'
import { SegmentRing } from '@/odoro/loader/SegmentRing.js'
import { Gauge } from '@/odoro/loader/Gauge.js'
import { PercentRing } from '@/odoro/loader/PercentRing.js'
import { RingDots } from '@/odoro/loader/RingDots.js'
import { PulseDot } from '@/odoro/loader/PulseDot.js'
import { BouncingDots } from '@/odoro/loader/BouncingDots.js'
import { ChasingDots } from '@/odoro/loader/ChasingDots.js'
import { GridFade } from '@/odoro/loader/GridFade.js'
import { GridWave } from '@/odoro/loader/GridWave.js'
import { SpiralDots } from '@/odoro/loader/SpiralDots.js'
import { DotsOrbit } from '@/odoro/loader/DotsOrbit.js'
import { NewtonCradle } from '@/odoro/loader/NewtonCradle.js'
import { Snake } from '@/odoro/loader/Snake.js'
import { FlowerPetals } from '@/odoro/loader/FlowerPetals.js'
import { SpotlightCard } from '@/odoro/ui/SpotlightCard.js'
import { PixelCard } from '@/odoro/ui/PixelCard.js'
import { ProfileCard } from '@/odoro/ui/ProfileCard.js'
import { ReflectiveCard } from '@/odoro/ui/ReflectiveCard.js'
import { DecayCard } from '@/odoro/ui/DecayCard.js'
import { BounceCards } from '@/odoro/ui/BounceCards.js'
import { CardSwap } from '@/odoro/ui/CardSwap.js'
import { ChromaGrid } from '@/odoro/ui/ChromaGrid.js'
import { LineWaves } from '@/odoro/background/LineWaves.js'
import { SlicedWaves } from '@/odoro/background/SlicedWaves.js'
import { FloatingLines } from '@/odoro/background/FloatingLines.js'
import { WebThreads } from '@/odoro/background/WebThreads.js'
import { Strands } from '@/odoro/background/Strands.js'
import { SineGrid } from '@/odoro/background/SineGrid.js'
import { AudioBars } from '@/odoro/background/AudioBars.js'
import { Oscilloscope } from '@/odoro/background/Oscilloscope.js'
import { Seismograph } from '@/odoro/background/Seismograph.js'
import { Sonar } from '@/odoro/background/Sonar.js'
import { Metaballs } from '@/odoro/background/Metaballs.js'
import { LavaLamp } from '@/odoro/background/LavaLamp.js'
import { BlobMorph } from '@/odoro/background/BlobMorph.js'
import { SoapFilm } from '@/odoro/background/SoapFilm.js'
import { LiquidEther } from '@/odoro/background/LiquidEther.js'
import { Watercolor } from '@/odoro/background/Watercolor.js'
import { Marble } from '@/odoro/background/Marble.js'
import { OilSlick } from '@/odoro/background/OilSlick.js'
import { Ferrofluid } from '@/odoro/background/Ferrofluid.js'
import { Ballpit } from '@/odoro/background/Ballpit.js'
import { CubeFlip } from '@/odoro/loader/CubeFlip.js'
import { CubeFold } from '@/odoro/loader/CubeFold.js'
import { SquareMorph } from '@/odoro/loader/SquareMorph.js'
import { ShapeMorph } from '@/odoro/loader/ShapeMorph.js'
import { HexSpinner } from '@/odoro/loader/HexSpinner.js'
import { TriangleSpinner } from '@/odoro/loader/TriangleSpinner.js'
import { PolygonMorph } from '@/odoro/loader/PolygonMorph.js'
import { Pinwheel } from '@/odoro/loader/Pinwheel.js'
import { FanBlades } from '@/odoro/loader/FanBlades.js'
import { GearPair } from '@/odoro/loader/GearPair.js'
import { WaveBars } from '@/odoro/loader/WaveBars.js'
import { Equalizer } from '@/odoro/loader/Equalizer.js'
import { BarsScale } from '@/odoro/loader/BarsScale.js'
import { Stairs } from '@/odoro/loader/Stairs.js'
import { Bricks } from '@/odoro/loader/Bricks.js'
import { BlocksStack } from '@/odoro/loader/BlocksStack.js'
import { Tetris } from '@/odoro/loader/Tetris.js'
import { Domino } from '@/odoro/loader/Domino.js'
import { ProgressBar } from '@/odoro/loader/ProgressBar.js'
import { ProgressSteps } from '@/odoro/loader/ProgressSteps.js'
import { PillNav } from '@/odoro/ui/PillNav.js'
import { GooeyNav } from '@/odoro/ui/GooeyNav.js'
import { BubbleMenu } from '@/odoro/ui/BubbleMenu.js'
import { CardNav } from '@/odoro/ui/CardNav.js'
import { StaggeredMenu } from '@/odoro/ui/StaggeredMenu.js'
import { FlowingMenu } from '@/odoro/ui/FlowingMenu.js'
import { InfiniteMenu } from '@/odoro/ui/InfiniteMenu.js'
import { LineSidebar } from '@/odoro/ui/LineSidebar.js'
import { Cubes } from '@/odoro/background/Cubes.js'
import { IsometricGrid } from '@/odoro/background/IsometricGrid.js'
import { Voronoi } from '@/odoro/background/Voronoi.js'
import { Truchet } from '@/odoro/background/Truchet.js'
import { Maze } from '@/odoro/background/Maze.js'
import { ShapeGrid } from '@/odoro/background/ShapeGrid.js'
import { PixelBlast } from '@/odoro/background/PixelBlast.js'
import { Dither } from '@/odoro/background/Dither.js'
import { AcidSquares } from '@/odoro/background/AcidSquares.js'
import { TilesFlip } from '@/odoro/background/TilesFlip.js'
import { GridScan } from '@/odoro/background/GridScan.js'
import { GridDistortion } from '@/odoro/background/GridDistortion.js'
import { GridMotion } from '@/odoro/background/GridMotion.js'
import { HexWave } from '@/odoro/background/HexWave.js'
import { Triangles } from '@/odoro/background/Triangles.js'
import { TerrainWireframe } from '@/odoro/background/TerrainWireframe.js'
import { CityBlocks } from '@/odoro/background/CityBlocks.js'
import { Wormhole } from '@/odoro/background/Wormhole.js'
import { NightDrive } from '@/odoro/background/NightDrive.js'
import { LedWall } from '@/odoro/background/LedWall.js'
import { LightPillar } from '@/odoro/background/LightPillar.js'
import { Prism } from '@/odoro/background/Prism.js'
import { PrismaticBurst } from '@/odoro/background/PrismaticBurst.js'
import { Iridescence } from '@/odoro/background/Iridescence.js'
import { LiquidChrome } from '@/odoro/background/LiquidChrome.js'
import { MoltenMetal } from '@/odoro/background/MoltenMetal.js'
import { GradientBlinds } from '@/odoro/background/GradientBlinds.js'
import { Grainient } from '@/odoro/background/Grainient.js'
import { GradientWaves } from '@/odoro/background/GradientWaves.js'
import { ColorBends } from '@/odoro/background/ColorBends.js'
import { LoadingDotsText } from '@/odoro/loader/LoadingDotsText.js'
import { TextShimmerLoader } from '@/odoro/loader/TextShimmerLoader.js'
import { LettersBounce } from '@/odoro/loader/LettersBounce.js'
import { WordFlip } from '@/odoro/loader/WordFlip.js'
import { TypingCursor } from '@/odoro/loader/TypingCursor.js'
import { PercentCounter } from '@/odoro/loader/PercentCounter.js'
import { MatrixDigits } from '@/odoro/loader/MatrixDigits.js'
import { CounterRollLoader } from '@/odoro/loader/CounterRollLoader.js'
import { ScrambleLoader } from '@/odoro/loader/ScrambleLoader.js'
import { DotMatrixText } from '@/odoro/loader/DotMatrixText.js'
import { BouncingBall } from '@/odoro/loader/BouncingBall.js'
import { Juggling } from '@/odoro/loader/Juggling.js'
import { Pendulum } from '@/odoro/loader/Pendulum.js'
import { Hourglass } from '@/odoro/loader/Hourglass.js'
import { ClockHands } from '@/odoro/loader/ClockHands.js'
import { Heartbeat } from '@/odoro/loader/Heartbeat.js'
import { DnaLoader } from '@/odoro/loader/DnaLoader.js'
import { InfinityLoop } from '@/odoro/loader/InfinityLoop.js'
import { YinYang } from '@/odoro/loader/YinYang.js'
import { Windmill } from '@/odoro/loader/Windmill.js'
import { SpecularButton } from '@/odoro/ui/SpecularButton.js'
import { LiquidGlassButton } from '@/odoro/ui/LiquidGlassButton.js'
import { TextFallButton } from '@/odoro/ui/TextFallButton.js'
import { StarBorder } from '@/odoro/ui/StarBorder.js'
import { ElectricBorder } from '@/odoro/ui/ElectricBorder.js'
import { ButtonGroupInput } from '@/odoro/ui/ButtonGroupInput.js'
import { TagInput } from '@/odoro/ui/TagInput.js'
import { SegmentedControl } from '@/odoro/ui/SegmentedControl.js'
import { CodeRain } from '@/odoro/background/CodeRain.js'
import { FaultyTerminal } from '@/odoro/background/FaultyTerminal.js'
import { CrtWarp } from '@/odoro/background/CrtWarp.js'
import { GlitchBlocks } from '@/odoro/background/GlitchBlocks.js'
import { PixelSort } from '@/odoro/background/PixelSort.js'
import { Circuit } from '@/odoro/background/Circuit.js'
import { DataStream } from '@/odoro/background/DataStream.js'
import { Hologram } from '@/odoro/background/Hologram.js'
import { AsciiField } from '@/odoro/background/AsciiField.js'
import { VhsTracking } from '@/odoro/background/VhsTracking.js'
import { LiquidFill } from '@/odoro/loader/LiquidFill.js'
import { BatteryFill } from '@/odoro/loader/BatteryFill.js'
import { WaterDrop } from '@/odoro/loader/WaterDrop.js'
import { BlobLoader } from '@/odoro/loader/BlobLoader.js'
import { JellyLoader } from '@/odoro/loader/JellyLoader.js'
import { MoonPhases } from '@/odoro/loader/MoonPhases.js'
import { SunRays } from '@/odoro/loader/SunRays.js'
import { Eclipse } from '@/odoro/loader/Eclipse.js'
import { RippleLoader } from '@/odoro/loader/RippleLoader.js'
import { SonarLoader } from '@/odoro/loader/SonarLoader.js'
import { DarkVeil } from '@/odoro/background/DarkVeil.js'
import { Lightfall } from '@/odoro/background/Lightfall.js'
import { VolumetricRays } from '@/odoro/background/VolumetricRays.js'
import { LensFlare } from '@/odoro/background/LensFlare.js'
import { NeonGrid } from '@/odoro/background/NeonGrid.js'
import { HaloPulse } from '@/odoro/background/HaloPulse.js'
import { CloudLayer } from '@/odoro/background/CloudLayer.js'
import { FogDrift } from '@/odoro/background/FogDrift.js'
import { Underwater } from '@/odoro/background/Underwater.js'
import { Fire } from '@/odoro/background/Fire.js'
import { FlowField } from '@/odoro/background/FlowField.js'
import { MagneticLines } from '@/odoro/background/MagneticLines.js'
import { ElectricField } from '@/odoro/background/ElectricField.js'
import { PlasmaBall } from '@/odoro/background/PlasmaBall.js'
import { WaterSurface } from '@/odoro/background/WaterSurface.js'
import { SandFlow } from '@/odoro/background/SandFlow.js'
import { WindField } from '@/odoro/background/WindField.js'
import { ParticleSphere } from '@/odoro/background/ParticleSphere.js'
import { Jelly } from '@/odoro/background/Jelly.js'
import { Crystal } from '@/odoro/background/Crystal.js'
import { RoutePath } from '@/odoro/loader/RoutePath.js'
import { LogoDraw } from '@/odoro/loader/LogoDraw.js'
import { CheckmarkSuccess } from '@/odoro/loader/CheckmarkSuccess.js'
import { SpinnerToCheck } from '@/odoro/loader/SpinnerToCheck.js'
import { Envelope } from '@/odoro/loader/Envelope.js'
import { PaperPlane } from '@/odoro/loader/PaperPlane.js'
import { Rocket } from '@/odoro/loader/Rocket.js'
import { ScannerLine } from '@/odoro/loader/ScannerLine.js'
import { SignalBars } from '@/odoro/loader/SignalBars.js'
import { WifiPulse } from '@/odoro/loader/WifiPulse.js'
import { AnimatedList } from '@/odoro/ui/AnimatedList.js'
import { SortableList } from '@/odoro/ui/SortableList.js'
import { TreeView } from '@/odoro/ui/TreeView.js'
import { Stepper } from '@/odoro/ui/Stepper.js'
import { ElasticSlider } from '@/odoro/ui/ElasticSlider.js'
import { OptionWheel } from '@/odoro/ui/OptionWheel.js'
import { ToastStack } from '@/odoro/ui/ToastStack.js'
import { CommandPalette } from '@/odoro/ui/CommandPalette.js'
import { SkeletonLines } from '@/odoro/loader/SkeletonLines.js'
import { SkeletonCard } from '@/odoro/loader/SkeletonCard.js'
import { SkeletonAvatar } from '@/odoro/loader/SkeletonAvatar.js'
import { SkeletonTable } from '@/odoro/loader/SkeletonTable.js'
import { SkeletonGrid } from '@/odoro/loader/SkeletonGrid.js'
import { ShimmerBlock } from '@/odoro/loader/ShimmerBlock.js'
import { PulseBlock } from '@/odoro/loader/PulseBlock.js'
import { PlaceholderImage } from '@/odoro/loader/PlaceholderImage.js'
import { ContentFade } from '@/odoro/loader/ContentFade.js'
import { LazyBlock } from '@/odoro/loader/LazyBlock.js'
import { AsciiText } from '@/odoro/text/AsciiText.js'
import { CurvedLoop } from '@/odoro/text/CurvedLoop.js'
import { DepthText } from '@/odoro/text/DepthText.js'
import { FoldText } from '@/odoro/text/FoldText.js'
import { FuzzyText } from '@/odoro/text/FuzzyText.js'
import { MaskedHeading } from '@/odoro/text/MaskedHeading.js'
import { ParticleText } from '@/odoro/text/ParticleText.js'
import { ScrollFloat } from '@/odoro/text/ScrollFloat.js'
import { ScrollReveal } from '@/odoro/text/ScrollReveal.js'
import { Shuffle } from '@/odoro/text/Shuffle.js'
import { BlobCursor } from '@/odoro/effect/BlobCursor.js'
import { Crosshair } from '@/odoro/effect/Crosshair.js'
import { GhostCursor } from '@/odoro/effect/GhostCursor.js'
import { GlowCursor } from '@/odoro/effect/GlowCursor.js'
import { SplashPointer } from '@/odoro/effect/SplashPointer.js'
import { SwarmCursor } from '@/odoro/effect/SwarmCursor.js'
import { TargetCursor } from '@/odoro/effect/TargetCursor.js'
import { StickyCursor } from '@/odoro/effect/StickyCursor.js'
import { MagnetLines } from '@/odoro/effect/MagnetLines.js'
import { CursorGridDom } from '@/odoro/effect/CursorGridDom.js'
import { SplashCursor } from '@/odoro/background/SplashCursor.js'
import { CursorGrid } from '@/odoro/background/CursorGrid.js'
import { PixelTrail } from '@/odoro/background/PixelTrail.js'
import { GhostFibers } from '@/odoro/background/GhostFibers.js'
import { EyeFollow } from '@/odoro/background/EyeFollow.js'
import { MetallicPaint } from '@/odoro/background/MetallicPaint.js'
import { ElasticMesh } from '@/odoro/background/ElasticMesh.js'
import { FloatingShapes } from '@/odoro/background/FloatingShapes.js'
import { TorusKnot } from '@/odoro/background/TorusKnot.js'
import { DnaHelix } from '@/odoro/background/DnaHelix.js'
import { CadreRideau } from './demos-loaders.jsx'
import { SplitCurtain } from '@/odoro/loader/SplitCurtain.js'
import { IrisOpen } from '@/odoro/loader/IrisOpen.js'
import { WipeDiagonal } from '@/odoro/loader/WipeDiagonal.js'
import { Blinds } from '@/odoro/loader/Blinds.js'
import { PixelDissolve } from '@/odoro/loader/PixelDissolve.js'
import { BarGate } from '@/odoro/loader/BarGate.js'
import { Shutter } from '@/odoro/loader/Shutter.js'
import { ZoomGate } from '@/odoro/loader/ZoomGate.js'
import { FadeGate } from '@/odoro/loader/FadeGate.js'
import { LettersGate } from '@/odoro/loader/LettersGate.js'
import { GlareHover } from '@/odoro/effect/GlareHover.jsx'
import { GradualBlur } from '@/odoro/effect/GradualBlur.jsx'
import { HalftoneReveal } from '@/odoro/effect/HalftoneReveal.jsx'
import { LaserFlow } from '@/odoro/effect/LaserFlow.jsx'
import { MagicRings } from '@/odoro/effect/MagicRings.jsx'
import { PixelSwap } from '@/odoro/effect/PixelSwap.jsx'
import { PixelTransition } from '@/odoro/effect/PixelTransition.jsx'
import { RippleDistortion } from '@/odoro/effect/RippleDistortion.jsx'
import { ShapeBlur } from '@/odoro/effect/ShapeBlur.jsx'
import { StickerPeel } from '@/odoro/effect/StickerPeel.jsx'
import { Icon } from '@odoro-cli/icons'
import { Calendar, Camera, Mail, MapPin } from '@odoro-cli/icons/filaire'
import { Masonry } from '@/odoro/ui/Masonry.js'
import { CircularGallery } from '@/odoro/ui/CircularGallery.js'
import { DomeGallery } from '@/odoro/ui/DomeGallery.js'
import { DepthCarousel } from '@/odoro/ui/DepthCarousel.js'
import { FlyingPosters } from '@/odoro/ui/FlyingPosters.js'
import { GlassSurface } from '@/odoro/ui/GlassSurface.js'
import { GlassIcons } from '@/odoro/ui/GlassIcons.js'
import { Folder } from '@/odoro/ui/Folder.js'
import { ImageMaskText } from '@/odoro/image/ImageMaskText.js'
import { LensZoom } from '@/odoro/image/LensZoom.js'
import { ColorShift } from '@/odoro/image/ColorShift.js'
import { AsciiImage } from '@/odoro/image/AsciiImage.js'
import { ImageParticles } from '@/odoro/image/ImageParticles.js'
import { ImageStackSwipe } from '@/odoro/image/ImageStackSwipe.js'
import { ScrollRevealImage } from '@/odoro/image/ScrollRevealImage.js'
import { ImageGlitch } from '@/odoro/image/ImageGlitch.js'
import { TestimonialsColumns } from '@/odoro/section/TestimonialsColumns.jsx'
import { BentoGrid } from '@/odoro/section/BentoGrid.jsx'
import { FeatureTabs } from '@/odoro/section/FeatureTabs.jsx'
import { Timeline } from '@/odoro/section/Timeline.jsx'
import { HeroScrollMorph } from '@/odoro/section/HeroScrollMorph.jsx'
import { ContainerScroll } from '@/odoro/section/ContainerScroll.jsx'
import { ComingSoon } from '@/odoro/section/ComingSoon.jsx'
import { TeamGrid } from '@/odoro/section/TeamGrid.jsx'
import { CtaBand } from '@/odoro/section/CtaBand.jsx'
import { Newsletter } from '@/odoro/section/Newsletter.jsx'
import { Changelog } from '@/odoro/section/Changelog.jsx'
import { ComparisonTable } from '@/odoro/section/ComparisonTable.jsx'
import { SplitFlap } from '@/odoro/text/SplitFlap.js'
import { TextCursor } from '@/odoro/text/TextCursor.js'
import { TextLoop } from '@/odoro/text/TextLoop.js'
import { TextPressure } from '@/odoro/text/TextPressure.js'
import { TrueFocus } from '@/odoro/text/TrueFocus.js'
import { VariableProximity } from '@/odoro/text/VariableProximity.js'
import { WarpText } from '@/odoro/text/WarpText.js'
import { MorphText } from '@/odoro/text/MorphText.js'
import { HandWritten } from '@/odoro/text/HandWritten.js'
import { BlurWords } from '@/odoro/text/BlurWords.js'

/** Ce qu'une demonstration declare. */
export interface DemoSpec {
  /** Phrase affichee au-dessus de l'apercu. */
  readonly lead?: string
  /** Hauteur du cadre. */
  readonly height?: string
  /** Affiche le contenu de demonstration par defaut. */
  readonly demoByDefault?: boolean
  /** Maquette de contenu de depart (hero, cartes, formulaire, stats, article). */
  readonly demoVariant?: import('./components/DemoContent.jsx').DemoVariant
  /** Reglages, si ceux deduits du meta ne conviennent pas. */
  readonly controls?: readonly AtelierControl[]
  /** Rend la preview derriere un interrupteur. */
  readonly deferred?: { readonly label: string; readonly hint: string }
  /** Rend le composant. */
  readonly render: (values: AtelierValues, frame: AtelierFrame) => ReactNode
}

/** Nombre lu dans les reglages, avec un repli. */
function num(values: AtelierValues, name: string, fallback: number): number {
  const value = values[name]
  return typeof value === 'number' ? value : fallback
}

/**
 * Liste de tokens lue dans les reglages, avec un repli.
 *
 * C'est par elle qu'une demonstration transmet le reglage « Couleurs » de
 * l'atelier a son composant : sans ce relais, le nuancier ne changerait rien.
 *
 * Le helper est generique parce que certains composants typent `colors` comme
 * un n-uplet a longueur fixe. Le nuancier de l'atelier remplace emplacement
 * par emplacement, sans jamais changer la longueur : l'assertion est honnete.
 */
function list<T extends readonly string[]>(
  values: AtelierValues,
  name: string,
  fallback: T,
): T {
  const value = values[name]
  return Array.isArray(value) ? (value as unknown as T) : fallback
}

/** Chaine lue dans les reglages, avec un repli. */
function str(values: AtelierValues, name: string, fallback: string): string {
  const value = values[name]
  return typeof value === 'string' ? value : fallback
}

/** Cadre centre, pour ce qui se juge sur un seul element. */
function Stage({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-p-8 o-text-center">
      {children}
    </div>
  )
}

/** Image de demonstration a structure fine, fabriquee sur place. */
function detailed(): string {
  const lines: string[] = []
  for (let x = 0; x <= 320; x += 20) {
    lines.push(
      `<line x1="${String(x)}" y1="0" x2="${String(x)}" y2="180" stroke="white" stroke-opacity="0.45"/>`,
    )
  }
  for (let y = 0; y <= 180; y += 20) {
    lines.push(
      `<line x1="0" y1="${String(y)}" x2="320" y2="${String(y)}" stroke="white" stroke-opacity="0.45"/>`,
    )
  }

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">',
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#a21caf"/></linearGradient></defs>',
    '<rect width="320" height="180" fill="url(#g)"/>',
    lines.join(''),
    '<circle cx="160" cy="90" r="52" fill="none" stroke="white" stroke-width="3"/>',
    '<circle cx="160" cy="90" r="26" fill="white" fill-opacity="0.9"/>',
    '</svg>',
  ].join('')

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** Le sujet de toutes les demonstrations d'image. */
export const SAMPLE = detailed()

/**
 * Une video reelle, et non une source vide.
 *
 * Un `src=""` fait retelecharger la page entiere au navigateur — le langage
 * de balisage le dit explicitement, et React en avertit. Surtout, une
 * demonstration de lecteur video sans video ne demontre rien : ni la lecture,
 * ni le deplacement, ni la coupure du son.
 *
 * Le fichier fait quatre-vingt-dix kilo-octets et vit dans le dossier public.
 */
const CLIP = '/demo/apercu.mp4'

/** L'affiche du meme clip, sa premiere image. */
const CLIP_POSTER = '/demo/apercu.jpg'

/**
 * Un cadre qui defile, pour ce qui se juge au defilement.
 *
 * Quatre composants ne se montrent qu'en defilant : la parallaxe, la barre de
 * progression, les etapes et les cartes empilees. Les hooks du moteur
 * remontent jusqu'au premier ancetre qui defile reellement, si bien qu'un
 * conteneur suffit — il n'y a rien a leur dire.
 */
function Scroller({
  children,
  hauteur,
}: {
  children: ReactNode
  hauteur?: string
}): ReactNode {
  return (
    <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
      {/*
        La hauteur est en pourcentage du cadre, ce qu'aucune classe generee
        n'exprime : l'echelle des utilitaires est en unites d'espacement, et
        inventer `o-h-[220%]` produirait une classe qui n'existe pas — le
        conteneur ne defilerait alors pas du tout, et la demonstration
        resterait inerte sans rien signaler.
      */}
      <div style={hauteur === undefined ? undefined : { height: hauteur }}>
        {children}
      </div>
    </div>
  )
}

/**
 * La barre de progression, posee sur un contenu qui defile dans le cadre.
 *
 * Elle a besoin d'une **cible** : sans elle, elle mesure le document entier,
 * ce qui, dans un apercu, ne bouge pas. C'est le reglage le plus important du
 * composant, et celui qu'on oublie — l'apercu le montre donc explicitement.
 *
 * Elle est aussi ramenee de `fixed` a `sticky` : ancree a la fenetre, elle se
 * poserait en haut de la page, hors du cadre.
 */
function ProgressDemo({
  thickness,
  position,
}: {
  thickness: number
  position: 'top' | 'bottom'
}): ReactElement {
  const contenu = useRef<HTMLDivElement | null>(null)

  return (
    <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
      <ScrollProgress
        target={contenu}
        thickness={thickness}
        position={position}
        className="o-z-10"
        style={{ position: 'sticky' }}
      />
      <div ref={contenu} className="o-space-y-6 o-p-8">
        {Array.from({ length: 9 }, (_, index) => (
          <p key={index} className="o-max-w-prose o-text-zinc-600 dark:o-text-zinc-300">
            Paragraphe {index + 1}. La mesure passe par la boucle unique du moteur : deux
            lectures du défilement sur une même page produiraient le tremblement que cette
            boucle existe precisement pour supprimer.
          </p>
        ))}
      </div>
    </div>
  )
}

/** Les volumes de la demonstration : trois tokens chacun, comme le contrat le demande. */
const SHELF_VOLUMES = [
  {
    id: 'a',
    title: 'Premier volume',
    shelf: 0,
    slot: 0,
    spine: '--o-palette-brand-700',
    cloth: '--o-theme-surface',
    edge: '--o-palette-amber-100',
  },
  {
    id: 'b',
    title: 'Deuxieme volume',
    shelf: 0,
    slot: 1,
    spine: '--o-palette-emerald-700',
    cloth: '--o-theme-surface',
    edge: '--o-palette-amber-100',
  },
  {
    id: 'c',
    title: 'Troisieme volume',
    shelf: 0,
    slot: 2,
    spine: '--o-palette-rose-700',
    cloth: '--o-theme-surface',
    edge: '--o-palette-amber-100',
  },
  {
    id: 'd',
    title: 'Quatrieme volume',
    shelf: 1,
    slot: 0,
    spine: '--o-palette-amber-600',
    cloth: '--o-theme-surface',
    edge: '--o-palette-amber-100',
  },
  {
    id: 'e',
    title: 'Cinquieme volume',
    shelf: 1,
    slot: 1,
    spine: '--o-palette-violet-700',
    cloth: '--o-theme-surface',
    edge: '--o-palette-amber-100',
  },
  {
    id: 'f',
    title: 'Sixieme volume',
    shelf: 1,
    slot: 2,
    spine: '--o-palette-sky-700',
    cloth: '--o-theme-surface',
    edge: '--o-palette-amber-100',
  },
] as const

/**
 * L'etagere et le panneau que la page rend a cote.
 *
 * C'est exactement la frontiere du composant : il signale par `onSelect`, et
 * ce texte-ci n'appartient pas a la scene.
 */
function ShelfDemo({ colors }: { colors: readonly [string, string] }): ReactElement {
  const [ouvert, setOuvert] = useState<string | null>(null)
  const volume = SHELF_VOLUMES.find((item) => item.id === ouvert)

  return (
    <div className="o-absolute o-inset-0">
      <BookShelf
        className="o-absolute o-inset-0"
        volumes={SHELF_VOLUMES}
        colors={colors}
        selected={ouvert}
        onSelect={setOuvert}
      />
      {volume === undefined ? null : (
        <p className="o-absolute o-bottom-4 o-left-4 o-rounded-lg o-bg-zinc-950 o-px-4 o-py-2 o-text-sm o-text-zinc-50">
          {volume.title}
        </p>
      )}
    </div>
  )
}

/** Les onglets, et la vue choisie ecrite sous la barre. */
function PillTabsDemo({ size }: { size: 'sm' | 'md' }): ReactElement {
  const [vue, setVue] = useState('jour')

  return (
    <div className="o-flex o-flex-col o-items-center o-gap-4">
      <PillTabs
        items={[
          { id: 'jour', label: 'Jour' },
          { id: 'semaine', label: 'Semaine' },
          { id: 'mois', label: 'Mois' },
          { id: 'annee', label: 'Annee' },
        ]}
        value={vue}
        onValueChange={setVue}
        size={size}
        label="Période"
      />
      <p className="o-text-sm o-opacity-70">Vue : {vue}</p>
    </div>
  )
}

/** La note, previsualisee au survol, fixee au clic, relue en toutes lettres. */
function RatingDemo({ count, size }: { count: number; size: number }): ReactElement {
  const [note, setNote] = useState(3)

  return (
    <div className="o-flex o-flex-col o-items-center o-gap-4">
      <RatingStars count={count} size={size} value={note} onValueChange={setNote} />
      <p className="o-text-sm o-opacity-70 o-tabular-nums">
        {note} sur {count}
      </p>
    </div>
  )
}

/** Le champ de code, et le code partiel relu dessous. */
function CodeDemo({ length, masked }: { length: number; masked: boolean }): ReactElement {
  const [code, setCode] = useState('')
  const [complet, setComplet] = useState<string | null>(null)

  return (
    <div className="o-flex o-flex-col o-items-center o-gap-4">
      <CodeInput
        length={length}
        masked={masked}
        onValueChange={(valeur) => {
          setCode(valeur)
          if (valeur.length < length) setComplet(null)
        }}
        onComplete={setComplet}
      />
      <p className="o-text-sm o-opacity-70 o-tabular-nums">
        {complet === null ? `Saisi : ${code === '' ? '—' : code}` : `Complet : ${complet}`}
      </p>
    </div>
  )
}

/**
 * Le rideau ne se leve qu'une fois : pour le rejouer, on remonte le
 * composant — une `key` differente suffit, et c'est exactement ce que le
 * bouton fait.
 */
function RevealMaskDemo({
  bands,
  duration,
  step,
}: {
  bands: number
  duration: number
  step: number
}): ReactElement {
  const [run, setRun] = useState(0)

  return (
    <div className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-4 o-p-6">
      <RevealMask
        key={run}
        bands={bands}
        duration={duration}
        step={step}
        className="o-w-full o-max-w-sm o-rounded-xl"
      >
        <div className="o-rounded-xl o-border-w-1 o-border-current o-p-6">
          <p className="o-text-xs o-uppercase o-tracking-wide o-opacity-50">Numéro 12</p>
          <h4 className="o-mt-1 o-text-lg o-font-semibold">Collection printemps</h4>
          <p className="o-mt-2 o-text-sm o-opacity-70">
            Les bandes se retirent en cascade, puis la surcouche quitte le DOM :
            il ne reste rien au-dessus du contenu.
          </p>
        </div>
      </RevealMask>
      <button
        type="button"
        className="o-rounded-full o-border-w-1 o-border-current o-px-4 o-py-1 o-text-xs o-font-medium"
        onClick={() => setRun(run + 1)}
      >
        Rejouer
      </button>
    </div>
  )
}

/** Un jeu de visuels varies pour le diaporama et la trainee. */
const TRAIL_SOURCES = [
  { src: 'https://picsum.photos/seed/odoro-un/800/500', alt: 'Première planche' },
  { src: 'https://picsum.photos/seed/odoro-deux/800/500', alt: 'Deuxieme planche' },
  { src: 'https://picsum.photos/seed/odoro-trois/800/500', alt: 'Troisieme planche' },
  { src: 'https://picsum.photos/seed/odoro-quatre/800/500', alt: 'Quatrieme planche' },
] as const

/**
 * La barre de chargement, pilotee par un etat local qui progresse puis boucle.
 *
 * Le composant ne s anime pas tout seul en mode determine : c est son
 * appelant qui possede la progression. La demonstration la fait donc avancer
 * par paliers irreguliers, marquer une pause a cent, et repartir de zero.
 */
function TopLoaderDemo({
  height,
  indeterminate,
}: {
  height: number
  indeterminate: boolean
}): ReactElement {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (indeterminate) return
    const timer = setInterval(() => {
      setProgress((value) => (value >= 112 ? 0 : value + 4 + Math.random() * 9))
    }, 300)
    return () => clearInterval(timer)
  }, [indeterminate])

  return (
    <div className="o-absolute o-inset-0">
      <div className="o-relative o-mx-auto o-mt-16 o-h-28 o-max-w-md o-overflow-hidden o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800">
        <TopLoader
          progress={Math.min(100, progress)}
          indeterminate={indeterminate}
          height={height}
        />
        <div className="o-flex o-h-full o-items-center o-justify-center o-text-sm o-opacity-60">
          {indeterminate
            ? 'Attente sans mesure : le segment balaie.'
            : `${String(Math.round(Math.min(100, progress)))} pour cent`}
        </div>
      </div>
    </div>
  )
}

/** Un fond qui occupe tout le cadre. */
const fill = (node: ReactNode): ReactNode => (
  <div className="o-absolute o-inset-0">{node}</div>
)

// ---------------------------------------------------------------------------
// Tokens par defaut, recopies depuis la source de chaque composant.
//
// C'est le relais du reglage « Couleurs » de l'atelier : la demonstration lit
// `list(v, 'colors', X_TOKENS)` et le transmet au composant. Sans ce relais,
// le nuancier du panneau ne changerait rien a l'apercu.
// ---------------------------------------------------------------------------

const AURORA_TOKENS = [
  '--o-palette-brand-600',
  '--o-palette-fuchsia-600',
  '--o-theme-fg',
] as const
const WAVES_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
] as const
const DOTS_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
] as const
const BEAMS_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
] as const
const MESH_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
] as const
const BUBBLES_TOKENS = ['--o-theme-bg', '--o-palette-fuchsia-600'] as const
const CAUSTICS_TOKENS = ['--o-theme-bg', '--o-palette-sky-200'] as const
const CELLS_TOKENS = [
  '--o-theme-bg',
  '--o-palette-emerald-700',
  '--o-palette-emerald-300',
] as const
const CONTOUR_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-emerald-300',
] as const
const HALFTONE_TOKENS = ['--o-theme-bg', '--o-palette-amber-300'] as const
const HEX_TOKENS = ['--o-theme-bg', '--o-palette-brand-900'] as const
const MOSAIC_TOKENS = [
  '--o-theme-surface',
  '--o-palette-brand-600',
  '--o-palette-fuchsia-500',
] as const
const PLASMA_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-400',
] as const
const RAIN_TOKENS = ['--o-theme-bg', '--o-palette-sky-300'] as const
const RIPPLE_GRID_TOKENS = ['--o-theme-bg', '--o-palette-sky-400'] as const
const SILK_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-sky-300',
] as const
const SPECTRUM_TOKENS = ['--o-theme-bg', '--o-palette-brand-400'] as const
const STARS_TOKENS = ['--o-theme-bg', '--o-theme-fg'] as const
const THREADS_TOKENS = ['--o-theme-bg', '--o-palette-emerald-300'] as const
const TUNNEL_TOKENS = ['--o-theme-bg', '--o-palette-sky-400'] as const
const VORTEX_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-600',
  '--o-palette-amber-300',
] as const
const DOT_MATRIX_TOKENS = [
  '--o-theme-fg',
  '--o-theme-muted',
  '--o-theme-bg',
] as const
const ORBITAL_SPHERE_TOKENS = [
  '--o-palette-violet-500',
  '--o-palette-violet-300',
  '--o-palette-fuchsia-400',
] as const
const GLOBE_MESH_TOKENS = [
  '--o-theme-fg',
  '--o-palette-emerald-400',
  '--o-palette-violet-300',
  '--o-palette-sky-400',
  '--o-palette-rose-400',
] as const
const MOLTEN_TOKENS = ['--o-palette-brand-600', '--o-palette-fuchsia-600'] as const
const SHINY_BUTTON_TOKENS = [
  '--o-theme-bg',
  '--o-theme-fg',
  '--o-palette-brand-500',
  '--o-palette-brand-300',
] as const
const PEARL_BUTTON_TOKENS = [
  '--o-theme-bg',
  '--o-theme-fg',
  '--o-theme-surface',
] as const
const HOVER_REVEAL_TOKENS = ['--o-palette-brand-600', '--o-theme-fg'] as const
const CARD_FORM_TOKENS = ['--o-palette-fuchsia-500', '--o-palette-brand-500'] as const
const BOOK_SHELF_TOKENS = ['--o-palette-stone-700', '--o-theme-surface'] as const

/** Tokens par defaut des nouveaux fonds en shader, pour le repli du nuancier. */
const NEBULA_TOKENS = ['--o-theme-bg', '--o-palette-violet-500', '--o-palette-rose-300'] as const
const FIREFLIES_TOKENS = ['--o-theme-bg', '--o-palette-amber-300', '--o-palette-lime-300'] as const
const RIBBONS_TOKENS = ['--o-theme-bg', '--o-palette-teal-400', '--o-palette-sky-300'] as const
const SMOKE_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-theme-fg'] as const
const RIPPLES_TOKENS = ['--o-theme-bg', '--o-palette-cyan-400', '--o-palette-teal-300'] as const
const SCANLINES_TOKENS = ['--o-theme-bg', '--o-palette-green-400', '--o-palette-emerald-200'] as const
const WARP_TOKENS = ['--o-theme-bg', '--o-palette-blue-300', '--o-palette-violet-400'] as const
const INTERFERENCE_TOKENS = ['--o-theme-bg', '--o-palette-fuchsia-400', '--o-palette-cyan-300'] as const

/** Tokens par defaut de la deuxieme fournee de fonds en shader. */
const LIGHTNING_TOKENS = [
  '--o-theme-bg',
  '--o-palette-indigo-400',
  '--o-theme-fg',
] as const
const LAVA_TOKENS = [
  '--o-theme-bg',
  '--o-palette-red-600',
  '--o-palette-amber-400',
] as const
const KALEIDOSCOPE_TOKENS = [
  '--o-theme-bg',
  '--o-palette-purple-500',
  '--o-palette-pink-300',
] as const
const RAYS_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-500',
  '--o-palette-amber-200',
] as const
const RADAR_TOKENS = [
  '--o-theme-bg',
  '--o-palette-green-500',
  '--o-palette-green-200',
] as const
const TV_STATIC_TOKENS = [
  '--o-theme-bg',
  '--o-palette-indigo-300',
  '--o-theme-fg',
] as const
const BOKEH_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-400',
  '--o-palette-rose-400',
] as const
const DUNES_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-600',
  '--o-palette-amber-300',
] as const
const SNOW_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-300',
  '--o-theme-fg',
] as const
const CURRENTS_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-400',
  '--o-palette-cyan-200',
] as const

/** Tokens par defaut des fonds reactifs au pointeur. */
const TORCH_TOKENS = ['--o-theme-bg', '--o-palette-amber-400', '--o-palette-orange-200'] as const
const CLICK_WAVES_TOKENS = ['--o-theme-bg', '--o-palette-cyan-400', '--o-palette-sky-200'] as const
const MAGNET_GRID_TOKENS = ['--o-theme-bg', '--o-palette-indigo-400', '--o-palette-sky-300'] as const
const WAKE_TOKENS = ['--o-theme-bg', '--o-palette-teal-400', '--o-palette-emerald-200'] as const
const VEIL_PARALLAX_TOKENS = ['--o-theme-bg', '--o-palette-purple-400', '--o-palette-pink-300'] as const
const INK_TOKENS = ['--o-theme-bg', '--o-palette-fuchsia-500', '--o-palette-cyan-400'] as const
const COMET_TOKENS = ['--o-theme-bg', '--o-palette-violet-400', '--o-palette-amber-200'] as const

/** Tokens par defaut de la maree : le fond, la houle, les cretes. */
const TIDE_TOKENS = ['--o-theme-bg', '--o-palette-brand-500', '--o-palette-fuchsia-300'] as const

/** Les demonstrations, indexees par identifiant d'entree. */
const PARTICLE_FIELD_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-brand-500',
] as const
const HYPERSPACE_TOKENS = ['--o-theme-bg', '--o-palette-indigo-300', '--o-theme-fg'] as const
const GALAXY_SPIRAL_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-400',
  '--o-palette-amber-200',
] as const
const SWARM_TOKENS = ['--o-theme-bg', '--o-palette-brand-500'] as const
const CONSTELLATION_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const
const EMBERS_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-500',
  '--o-palette-amber-200',
] as const
const FIREWORKS_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-amber-200',
] as const
const DUST_TOKENS = ['--o-theme-bg', '--o-palette-amber-300', '--o-palette-amber-100'] as const
const POLLEN_TOKENS = ['--o-theme-bg', '--o-palette-lime-400', '--o-palette-amber-300'] as const
const ORBIT_RINGS_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-400',
] as const

const CHROMA_TOKENS = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-500',
  '--o-palette-emerald-500',
] as const

const LINE_WAVES_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const
const SLICED_WAVES_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-violet-200',
] as const
const FLOATING_LINES_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-sky-400'] as const
const WEB_THREADS_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-brand-500'] as const
const STRANDS_TOKENS = ['--o-theme-bg', '--o-palette-teal-700', '--o-palette-teal-300'] as const
const SINE_GRID_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-brand-500'] as const
const AUDIO_BARS_TOKENS = ['--o-theme-bg', '--o-palette-brand-500', '--o-palette-amber-300'] as const
const OSCILLOSCOPE_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-green-400'] as const
const SEISMOGRAPH_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const
const SONAR_TOKENS = ['--o-theme-bg', '--o-palette-emerald-500', '--o-palette-emerald-200'] as const

const METABALLS_TOKENS = ['--o-theme-bg', '--o-palette-brand-500', '--o-theme-fg'] as const
const LAVA_LAMP_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-400',
] as const
const BLOB_MORPH_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-300',
] as const
const SOAP_FILM_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-400',
  '--o-palette-fuchsia-400',
] as const
const LIQUID_ETHER_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-cyan-300',
] as const
const WATERCOLOR_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-sky-400',
] as const
const MARBLE_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-amber-400'] as const
const OIL_SLICK_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const
const FERROFLUID_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const
const BALLPIT_TOKENS = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-400',
] as const

const GOOEY_TOKENS = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-500',
] as const
const CARDNAV_TOKENS = [
  '--o-palette-brand-500',
  '--o-palette-sky-500',
  '--o-palette-emerald-500',
] as const
const STAGGERED_TOKENS = ['--o-palette-brand-500', '--o-theme-fg'] as const

const CUBES_TOKENS = ['--o-theme-bg', '--o-palette-violet-500', '--o-palette-brand-500'] as const
const ISOMETRIC_GRID_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const
const VORONOI_TOKENS = ['--o-theme-bg', '--o-palette-cyan-400', '--o-palette-violet-500'] as const
const TRUCHET_TOKENS = ['--o-theme-bg', '--o-palette-brand-500', '--o-palette-teal-400'] as const
const MAZE_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const
const SHAPE_GRID_TOKENS = ['--o-theme-bg', '--o-palette-brand-500', '--o-palette-sky-400'] as const
const PIXEL_BLAST_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-yellow-300',
] as const
const DITHER_TOKENS = ['--o-theme-bg', '--o-palette-brand-500', '--o-palette-indigo-500'] as const
const ACID_SQUARES_TOKENS = [
  '--o-theme-bg',
  '--o-palette-lime-400',
  '--o-palette-fuchsia-500',
] as const
const TILES_FLIP_TOKENS = ['--o-theme-bg', '--o-palette-brand-500', '--o-palette-teal-400'] as const

const GRID_SCAN_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-cyan-400'] as const
const GRID_DISTORTION_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-brand-500'] as const
const GRID_MOTION_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-brand-500'] as const
const HEX_WAVE_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-amber-400'] as const
const TRIANGLES_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-violet-500'] as const
const TERRAIN_WIREFRAME_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-500',
  '--o-palette-teal-200',
] as const
const CITY_BLOCKS_TOKENS = [
  '--o-theme-bg',
  '--o-palette-indigo-500',
  '--o-palette-sky-300',
] as const
const WORMHOLE_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const
const NIGHT_DRIVE_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-amber-400'] as const
const LED_WALL_TOKENS = ['--o-theme-bg', '--o-palette-rose-500', '--o-palette-amber-300'] as const

const LIGHT_PILLAR_TOKENS = ['--o-theme-bg', '--o-palette-sky-400', '--o-palette-amber-200'] as const
const PRISM_TOKENS = ['--o-theme-bg', '--o-palette-violet-500', '--o-palette-amber-400'] as const
const PRISMATIC_BURST_TOKENS = ['--o-theme-bg', '--o-palette-fuchsia-500', '--o-palette-cyan-400'] as const
const IRIDESCENCE_TOKENS = ['--o-theme-bg', '--o-palette-pink-300', '--o-palette-teal-300'] as const
const LIQUID_CHROME_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-sky-400'] as const
const MOLTEN_METAL_TOKENS = ['--o-theme-bg', '--o-palette-red-600', '--o-palette-amber-300'] as const
const GRADIENT_BLINDS_TOKENS = ['--o-theme-bg', '--o-palette-orange-400', '--o-palette-rose-500'] as const
const GRAINIENT_TOKENS = ['--o-theme-bg', '--o-palette-violet-400', '--o-palette-orange-300'] as const
const GRADIENT_WAVES_TOKENS = ['--o-theme-bg', '--o-palette-indigo-400', '--o-palette-cyan-300'] as const
const COLOR_BENDS_TOKENS = ['--o-theme-bg', '--o-palette-brand-500', '--o-palette-violet-500'] as const

const SPECULAR_TOKENS = [
  '--o-palette-brand-600',
  '--o-palette-zinc-50',
  '--o-palette-white',
] as const
const LIQUID_GLASS_TOKENS = ['--o-palette-brand-500', '--o-palette-white'] as const
const ELECTRIC_TOKENS = ['--o-palette-sky-400', '--o-palette-white'] as const

const CODE_RAIN_TOKENS = ['--o-theme-bg', '--o-palette-green-500', '--o-theme-fg'] as const
const FAULTY_TERMINAL_TOKENS = ['--o-theme-bg', '--o-palette-amber-500', '--o-theme-fg'] as const
const CRT_WARP_TOKENS = ['--o-theme-bg', '--o-palette-teal-500', '--o-palette-orange-400'] as const
const GLITCH_BLOCKS_TOKENS = ['--o-theme-bg', '--o-palette-violet-500', '--o-palette-cyan-400'] as const
const PIXEL_SORT_TOKENS = ['--o-theme-bg', '--o-palette-sky-500', '--o-palette-rose-400'] as const
const CIRCUIT_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-emerald-400'] as const
const DATA_STREAM_TOKENS = ['--o-theme-bg', '--o-palette-blue-500', '--o-theme-fg'] as const
const HOLOGRAM_TOKENS = ['--o-theme-bg', '--o-palette-cyan-500', '--o-theme-fg'] as const
const ASCII_FIELD_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-brand-500'] as const
const VHS_TRACKING_TOKENS = ['--o-theme-bg', '--o-palette-fuchsia-500', '--o-palette-cyan-400'] as const

const DARK_VEIL_TOKENS = ['--o-theme-bg', '--o-palette-violet-500', '--o-palette-indigo-950'] as const
const LIGHTFALL_TOKENS = ['--o-theme-bg', '--o-palette-sky-500', '--o-palette-cyan-300'] as const
const VOLUMETRIC_RAYS_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-300',
  '--o-palette-orange-500',
] as const
const LENS_FLARE_TOKENS = ['--o-theme-bg', '--o-palette-amber-400', '--o-palette-sky-400'] as const
const NEON_GRID_TOKENS = ['--o-theme-bg', '--o-palette-fuchsia-500', '--o-palette-amber-400'] as const
const HALO_PULSE_TOKENS = ['--o-theme-bg', '--o-palette-teal-400', '--o-palette-brand-500'] as const
const CLOUD_LAYER_TOKENS = ['--o-theme-bg', '--o-palette-slate-400', '--o-palette-sky-100'] as const
const FOG_DRIFT_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-sky-300'] as const
const UNDERWATER_TOKENS = ['--o-theme-bg', '--o-palette-cyan-300', '--o-palette-sky-600'] as const
const FIRE_TOKENS = ['--o-theme-bg', '--o-palette-orange-500', '--o-palette-yellow-300'] as const

const FLOW_FIELD_TOKENS = ['--o-theme-bg', '--o-palette-sky-400', '--o-palette-amber-300'] as const
const MAGNETIC_LINES_TOKENS = ['--o-theme-bg', '--o-palette-rose-400', '--o-palette-amber-300'] as const
const ELECTRIC_FIELD_TOKENS = ['--o-theme-bg', '--o-palette-cyan-400', '--o-theme-fg'] as const
const PLASMA_BALL_TOKENS = ['--o-theme-bg', '--o-palette-purple-500', '--o-palette-pink-300'] as const
const WATER_SURFACE_TOKENS = ['--o-theme-bg', '--o-palette-sky-600', '--o-palette-sky-200'] as const
const SAND_FLOW_TOKENS = ['--o-theme-bg', '--o-palette-amber-500', '--o-palette-yellow-200'] as const
const WIND_FIELD_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-emerald-400'] as const
const PARTICLE_SPHERE_TOKENS = ['--o-theme-bg', '--o-palette-cyan-400', '--o-palette-amber-400'] as const
const JELLY_TOKENS = ['--o-theme-bg', '--o-palette-lime-500', '--o-palette-lime-200'] as const
const CRYSTAL_TOKENS = ['--o-theme-bg', '--o-palette-sky-300', '--o-palette-violet-400'] as const

const GLOW_CURSOR_COLOR = 'var(--o-palette-brand-500)'

const SPLASH_CURSOR_TOKENS = ['--o-theme-bg', '--o-palette-rose-500', '--o-palette-amber-400'] as const
const CURSOR_GRID_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-sky-400'] as const
const PIXEL_TRAIL_TOKENS = ['--o-theme-bg', '--o-palette-indigo-400', '--o-palette-pink-300'] as const
const GHOST_FIBERS_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-cyan-300'] as const
const EYE_FOLLOW_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const
const METALLIC_PAINT_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-amber-200'] as const
const ELASTIC_MESH_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-violet-400'] as const
const FLOATING_SHAPES_TOKENS = ['--o-theme-bg', '--o-palette-brand-500', '--o-palette-purple-400'] as const
const TORUS_KNOT_TOKENS = ['--o-theme-bg', '--o-palette-emerald-400', '--o-palette-lime-400'] as const
const DNA_HELIX_TOKENS = ['--o-theme-bg', '--o-palette-sky-400', '--o-palette-rose-400'] as const

const RIPPLE_TOKENS = [
  '--o-theme-bg',
  '--o-theme-surface',
  '--o-palette-brand-500',
] as const

const PLANCHES = [
  {
    src: TRAIL_SOURCES[0].src,
    alt: 'Première planche du dossier de presse',
    caption: 'Planche une',
  },
  {
    src: TRAIL_SOURCES[1].src,
    alt: 'Deuxieme planche du dossier de presse',
    caption: 'Planche deux',
  },
  {
    src: TRAIL_SOURCES[2].src,
    alt: 'Troisieme planche du dossier de presse',
    caption: 'Planche trois',
  },
  {
    src: TRAIL_SOURCES[3].src,
    alt: 'Quatrieme planche du dossier de presse',
    caption: 'Planche quatre',
  },
  {
    src: SAMPLE,
    alt: 'Mire de réglage a cercles concentriques',
    caption: 'Mire de réglage',
  },
] as const
const GLASS_SURFACE_TOKENS = ['--o-palette-brand-500', '--o-palette-white'] as const
const GLASS_ICONS_TOKENS = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-500',
  '--o-palette-emerald-500',
] as const
const FOLDER_TOKENS = ['--o-palette-brand-500', '--o-theme-surface'] as const

const SC1_TEMOIGNAGES = [
  {
    quote:
      'Installe un vendredi, retouche le lundi. Le code etait deja le notre, personne n a eu a demander la permission.',
    author: 'Camille Roy',
    role: 'Studio Nord',
  },
  {
    quote:
      'Le repli sans WebGL nous a evite une refonte : la page reste lisible sur les postes de l accueil.',
    author: 'Sami Belkacem',
    role: 'Atelier Sud',
  },
  {
    quote:
      'Les docblocks disent pourquoi, pas quoi. C est la premiere fois qu une relecture d equipe prend dix minutes.',
    author: 'Nour Haddad',
    role: 'Groupe Meridien',
  },
  {
    quote:
      'Un dossier, un meta, une source. Notre registre interne a suivi le meme format en une apres-midi.',
    author: 'Elias Fontaine',
    role: 'Banque Ouest',
  },
  {
    quote:
      'Le mouvement reduit applique l etat final. C est la seule bibliotheque qui ne nous a pas oblige a repasser derriere.',
    author: 'Ana Ferreira',
    role: 'Sante publique',
  },
  {
    quote:
      'Trois cents entrees, et pas une couleur ecrite en dur. Le changement de theme a pris une variable.',
    author: 'Theo Marchand',
    role: 'Agence Loire',
  },
] as const
const SC1_COMPARATIF_COLONNES = [
  { name: 'Depart', note: 'Pour essayer' },
  { name: 'Studio', note: 'Le cas courant', featured: true },
  { name: 'Agence', note: 'Sans plafond' },
] as const
const SC1_COMPARATIF_LIGNES = [
  { group: 'Registre', label: 'Entrées publiques', values: ['Toutes', 'Toutes', 'Toutes'] },
  { group: 'Registre', label: 'Registre prive', values: [false, false, true] },
  { group: 'Registre', label: 'Miroir hors ligne', values: [false, true, true] },
  { group: 'Projets', label: 'Projets suivis', values: ['1', '10', 'Illimite'] },
  { group: 'Projets', label: 'Comparaison des retouches', values: [true, true, true] },
  { group: 'Projets', label: 'Mise a jour guidee', values: [false, true, true] },
  { group: 'Accompagnement', label: 'Réponse sous 24 h', values: [false, true, true] },
  { group: 'Accompagnement', label: 'Astreinte', values: [false, false, true] },
  { group: 'Accompagnement', label: 'Revue d’integration', values: [false, false, true] },
] as const

export const DEMOS: Readonly<Record<string, DemoSpec>> = {
  // ----- Fonds ---------------------------------------------------------------
  'background/torch': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deplacez le curseur : la lueur amortie perce le voile et révèle le motif dessous.',
    render: (v) =>
      fill(
        <Torch
          className="o-size-full"
          radius={num(v, 'radius', 0.3)}
          softness={num(v, 'softness', 0.6)}
          dim={num(v, 'dim', 0.85)}
          colors={list(v, 'colors', TORCH_TOKENS)}
        />,
      ),
  },
  'background/click-waves': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'aucun',
    lead: 'Cliquez dans le cadre : chaque appui date une onde dans un tampon de huit, et l’anneau part du point exact.',
    render: (v) =>
      fill(
        <ClickWaves
          className="o-size-full"
          speed={num(v, 'speed', 0.45)}
          width={num(v, 'width', 0.09)}
          decay={num(v, 'decay', 1.2)}
          colors={list(v, 'colors', CLICK_WAVES_TOKENS)}
        />,
      ),
  },
  'background/magnet-grid': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Approchez le curseur : chaque point s’écarte selon une exponentielle de la distance — ou s’attire, au choix.',
    render: (v) =>
      fill(
        <MagnetGrid
          className="o-size-full"
          density={num(v, 'density', 18)}
          radius={num(v, 'radius', 0.25)}
          force={num(v, 'force', 0.6)}
          attract={v.attract === true}
          colors={list(v, 'colors', MAGNET_GRID_TOKENS)}
        />,
      ),
  },
  'background/wake': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'aucun',
    lead: 'Balayez le cadre : seize positions echantillonnees vieillissent en halos qui s’estompent.',
    render: (v) =>
      fill(
        <Wake
          className="o-size-full"
          life={num(v, 'life', 1.2)}
          size={num(v, 'size', 0.08)}
          colors={list(v, 'colors', WAKE_TOKENS)}
        />,
      ),
  },
  'background/veil-parallax': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Trois nappes de bruit glissent chacune d’un facteur different sous le curseur : la profondeur vient de la parallaxe.',
    render: (v) =>
      fill(
        <VeilParallax
          className="o-size-full"
          depth={num(v, 'depth', 0.25)}
          speed={num(v, 'speed', 0.08)}
          scale={num(v, 'scale', 2.5)}
          colors={list(v, 'colors', VEIL_PARALLAX_TOKENS)}
        />,
      ),
  },
  'background/ink': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'aucun',
    lead: 'Cliquez : un disque de la couleur suivante s’etend depuis le point d’appui jusqu’à repeindre le cadre.',
    render: (v) =>
      fill(
        <Ink
          className="o-size-full"
          speed={num(v, 'speed', 0.7)}
          feather={num(v, 'feather', 0.12)}
          colors={list(v, 'colors', INK_TOKENS)}
        />,
      ),
  },
  'background/comet': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'La comete rattrape le curseur avec retard, et sa queue s’oriente selon la vitesse du rattrapage.',
    render: (v) =>
      fill(
        <Comet
          className="o-size-full"
          size={num(v, 'size', 0.07)}
          tail={num(v, 'tail', 0.45)}
          lag={num(v, 'lag', 1)}
          colors={list(v, 'colors', COMET_TOKENS)}
        />,
      ),
  },
  'background/lightning': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Un chemin déplace par du bruit multi-octave, un trait en exponentielle de la distance, et des rafales tirees du hachage du temps par paliers.',
    render: (v) =>
      fill(
        <Lightning
          className="o-size-full"
          frequency={num(v, 'frequency', 0.6)}
          branches={num(v, 'branches', 4)}
          glow={num(v, 'glow', 0.5)}
          colors={list(v, 'colors', LIGHTNING_TOKENS)}
        />,
      ),
  },
  'background/lava': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'formulaire',
    lead: 'Des metaballs : chaque centre émet un champ en 1/d2, et c’est la somme seuillee en paliers doux qui fait fusionner les gouttes d’elles-mêmes.',
    render: (v) =>
      fill(
        <Lava
          className="o-size-full"
          speed={num(v, 'speed', 0.3)}
          blobs={num(v, 'blobs', 5)}
          threshold={num(v, 'threshold', 1.2)}
          colors={list(v, 'colors', LAVA_TOKENS)}
        />,
      ),
  },
  'background/kaleidoscope': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'L’angle replie modulo 2pi/n puis reflechi : tous les secteurs lisent le même domaine, et un simple bruit fractal devient symetrique.',
    render: (v) =>
      fill(
        <Kaleidoscope
          className="o-size-full"
          speed={num(v, 'speed', 0.15)}
          segments={num(v, 'segments', 6)}
          scale={num(v, 'scale', 2.5)}
          colors={list(v, 'colors', KALEIDOSCOPE_TOKENS)}
        />,
      ),
  },
  'background/rays': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Un bruit 1D de l’angle autour d’un foyer reglable, sculpte par une puissance et éteint par une exponentielle de la distance.',
    render: (v) =>
      fill(
        <Rays
          className="o-size-full"
          x={num(v, 'x', 0.5)}
          y={num(v, 'y', 0.75)}
          count={num(v, 'count', 12)}
          softness={num(v, 'softness', 0.5)}
          colors={list(v, 'colors', RAYS_TOKENS)}
        />,
      ),
  },
  'background/radar': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'La difference d’angle au temps, repliee modulo 2pi, donne l’age du passage : son exponentielle fait la traînée, et les echos decroissent avec elle.',
    render: (v) =>
      fill(
        <Radar
          className="o-size-full"
          speed={num(v, 'speed', 0.5)}
          rings={num(v, 'rings', 4)}
          fade={num(v, 'fade', 0.7)}
          colors={list(v, 'colors', RADAR_TOKENS)}
        />,
      ),
  },
  'background/tv-static': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Un bruit blanc hache par paliers de temps — un tirage par palier, pas par image — sous des bandes sombres qui défilent lentement.',
    render: (v) =>
      fill(
        <TvStatic
          className="o-size-full"
          fps={num(v, 'fps', 12)}
          banding={num(v, 'banding', 0.3)}
          tint={num(v, 'tint', 0.4)}
          colors={list(v, 'colors', TV_STATIC_TOKENS)}
        />,
      ),
  },
  'background/bokeh': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Trois couches de disques haches : plus la couche est proche, plus ses disques sont grands, flous et lents — le rendu d’un objectif hors du plan de nettete.',
    render: (v) =>
      fill(
        <Bokeh
          className="o-size-full"
          speed={num(v, 'speed', 0.3)}
          density={num(v, 'density', 6)}
          blur={num(v, 'blur', 0.5)}
          colors={list(v, 'colors', BOKEH_TOKENS)}
        />,
      ),
  },
  'background/dunes': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Des courbes horizon — sinus plus bruit — empilees et remplies sous elles : le desaccord des vitesses entre couches fait la parallaxe.',
    render: (v) =>
      fill(
        <Dunes
          className="o-size-full"
          speed={num(v, 'speed', 0.1)}
          layers={num(v, 'layers', 4)}
          amplitude={num(v, 'amplitude', 0.12)}
          colors={list(v, 'colors', DUNES_TOKENS)}
        />,
      ),
  },
  'background/snow': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Un flocon par cellule hachee, en halo exponentiel : la grille descend a trois vitesses, et chaque flocon se balance sur un sinus a phase propre.',
    render: (v) =>
      fill(
        <Snow
          className="o-size-full"
          speed={num(v, 'speed', 0.5)}
          density={num(v, 'density', 12)}
          drift={num(v, 'drift', 0.3)}
          colors={list(v, 'colors', SNOW_TOKENS)}
        />,
      ),
  },
  'background/currents': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Un bruit fin lu en un point advecte par un champ a grande échelle, puis etire dans le repère local du flot : les filaments suivent le courant sans qu’aucune ligne ne soit tracee.',
    render: (v) =>
      fill(
        <Currents
          className="o-size-full"
          speed={num(v, 'speed', 0.2)}
          scale={num(v, 'scale', 3)}
          stretch={num(v, 'stretch', 6)}
          colors={list(v, 'colors', CURRENTS_TOKENS)}
        />,
      ),
  },
  'background/graph-paper': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'La maille épaisse toutes les cinq fines donne l’échelle, pas seulement la texture.',
    render: (v) =>
      fill(
        <GraphPaper
          className="o-size-full"
          size={num(v, 'size', 8)}
          strength={num(v, 'strength', 0.4)}
        />,
      ),
  },
  'background/noise': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Le bruit vient d’un filtre SVG mis en cache : rien ne s’execute après le rendu.',
    render: (v) =>
      fill(
        <Noise
          className="o-size-full"
          opacity={num(v, 'opacity', 0.1)}
          scale={num(v, 'scale', 0.8)}
        />,
      ),
  },
  'background/stripes': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Une bande, un vide : le dégradé répète fait le reste gratuitement.',
    render: (v) =>
      fill(
        <Stripes
          className="o-size-full"
          width={num(v, 'width', 10)}
          gap={num(v, 'gap', 22)}
          angle={num(v, 'angle', 45)}
        />,
      ),
  },
  'background/checker': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Quatre quarts de tour d’un dégradé conique : le damier tient en une seule image.',
    render: (v) =>
      fill(
        <Checker
          className="o-size-full"
          size={num(v, 'size', 24)}
          strength={num(v, 'strength', 0.06)}
        />,
      ),
  },
  'background/crosshatch': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Deux trames inclinees se superposent ; les nœuds se renforcent tout seuls.',
    render: (v) =>
      fill(
        <Crosshatch
          className="o-size-full"
          spacing={num(v, 'spacing', 14)}
          strength={num(v, 'strength', 0.12)}
        />,
      ),
  },
  'background/rings': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deplacer le centre change ce que le motif raconte : cible au milieu, onde dans un coin.',
    render: (v) =>
      fill(
        <Rings
          className="o-size-full"
          spacing={num(v, 'spacing', 32)}
          thickness={num(v, 'thickness', 1)}
          x={num(v, 'x', 0.5)}
          y={num(v, 'y', 0.5)}
        />,
      ),
  },
  'background/radial-glow': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Le fond de hero le moins cher qui existe : deux lueurs peintes une fois.',
    render: (v) =>
      fill(
        <RadialGlow
          className="o-size-full"
          size={num(v, 'size', 0.9)}
          x={num(v, 'x', 0.5)}
          y={num(v, 'y', 0.3)}
          strength={num(v, 'strength', 0.5)}
        />,
      ),
  },
  'background/mesh-static': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'La nappe au repos, sans shader : quatre taches posees aux tiers du cadre.',
    render: (v) =>
      fill(
        <MeshStatic
          className="o-size-full"
          strength={num(v, 'strength', 0.5)}
          blur={num(v, 'blur', 24)}
        />,
      ),
  },
  'background/blueprint': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Les croix sortent d’un conique recouvert d’un cache : aucun script ne les dessine.',
    render: (v) =>
      fill(
        <Blueprint
          className="o-size-full"
          cell={num(v, 'cell', 24)}
          strength={num(v, 'strength', 0.4)}
        />,
      ),
  },
  'background/spot-grid': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Le masque retire de l’opacité au lieu de peindre : la vignette marche sur tout fond.',
    render: (v) =>
      fill(
        <SpotGrid
          className="o-size-full"
          gap={num(v, 'gap', 24)}
          dot={num(v, 'dot', 2)}
          vignette={num(v, 'vignette', 0.6)}
        />,
      ),
  },
  'background/nebula': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deux couches de bruit a deux vitesses, la seconde lue en un point déplace par la première : le couplage fait les volutes.',
    render: (v) =>
      fill(
        <Nebula
          className="o-size-full"
          speed={num(v, 'speed', 0.1)}
          scale={num(v, 'scale', 2.2)}
          depth={num(v, 'depth', 4)}
          colors={list(v, 'colors', NEBULA_TOKENS)}
        />,
      ),
  },
  'background/fireflies': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Une luciole par cellule hachee, un sinus de phase propre pour l’éclat, une exponentielle de la distance pour le halo.',
    render: (v) =>
      fill(
        <Fireflies
          className="o-size-full"
          speed={num(v, 'speed', 0.8)}
          density={num(v, 'density', 16)}
          glow={num(v, 'glow', 0.6)}
          colors={list(v, 'colors', FIREFLIES_TOKENS)}
        />,
      ),
  },
  'background/ribbons': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Des sinusoides dephasees dont la lumière decroit en exponentielle de la distance a l’axe : les croisements s’eclaircissent d’eux-mêmes.',
    render: (v) =>
      fill(
        <Ribbons
          className="o-size-full"
          speed={num(v, 'speed', 0.4)}
          count={num(v, 'count', 5)}
          amplitude={num(v, 'amplitude', 0.08)}
          colors={list(v, 'colors', RIBBONS_TOKENS)}
        />,
      ),
  },
  'background/smoke': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Le gradient du bruit tourne d’un quart de tour donne un champ sans divergence : la fumee tourbillonne sans jamais se compresser.',
    render: (v) =>
      fill(
        <Smoke
          className="o-size-full"
          speed={num(v, 'speed', 0.15)}
          scale={num(v, 'scale', 2)}
          lift={num(v, 'lift', 0.35)}
          colors={list(v, 'colors', SMOKE_TOKENS)}
        />,
      ),
  },
  'background/ripples': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Chaque goutte est un sinus de la distance éteint par une exponentielle : les trains d’anneaux se somment et interferent.',
    render: (v) =>
      fill(
        <Ripples
          className="o-size-full"
          speed={num(v, 'speed', 1)}
          drops={num(v, 'drops', 6)}
          decay={num(v, 'decay', 2.5)}
          colors={list(v, 'colors', RIPPLES_TOKENS)}
        />,
      ),
  },
  'background/scanlines': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Tout l’écran cathodique tient dans des fonctions periodiques de y ; le grain est rejoue par paliers, un tirage par image scintillerait.',
    render: (v) =>
      fill(
        <Scanlines
          className="o-size-full"
          speed={num(v, 'speed', 0.5)}
          lines={num(v, 'lines', 90)}
          flicker={num(v, 'flicker', 0.4)}
          colors={list(v, 'colors', SCANLINES_TOKENS)}
        />,
      ),
  },
  'background/warp': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'La grille est posee sur (angle, 1/r) : avancer n’est qu’un glissement de la coordonnee radiale, et trois grilles font trois profondeurs.',
    render: (v) =>
      fill(
        <Warp
          className="o-size-full"
          speed={num(v, 'speed', 0.8)}
          density={num(v, 'density', 24)}
          stretch={num(v, 'stretch', 0.35)}
          colors={list(v, 'colors', WARP_TOKENS)}
        />,
      ),
  },
  'background/interference': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Le produit de deux sinus de distances fait les battements : les franges dessinent des hyperboles qu’aucun des deux reseaux ne contient.',
    render: (v) =>
      fill(
        <Interference
          className="o-size-full"
          speed={num(v, 'speed', 0.15)}
          frequency={num(v, 'frequency', 24)}
          separation={num(v, 'separation', 0.25)}
          colors={list(v, 'colors', INTERFERENCE_TOKENS)}
        />,
      ),
  },
  'background/aurora': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Bruit fractal a déplacement de domaine. Le plus dense des fonds en shader.',
    render: (v) =>
      fill(
        <Aurora
          className="o-size-full"
          colors={list(v, 'colors', AURORA_TOKENS)}
          speed={num(v, 'speed', 0.12)}
          scale={num(v, 'scale', 2.4)}
          octaves={num(v, 'octaves', 4)}
        />,
      ),
  },
  'background/waves': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Trois sinus de frequences non multiples : le motif ne se répète jamais a l œil.',
    render: (v) =>
      fill(
        <Waves
          className="o-size-full"
          colors={list(v, 'colors', WAVES_TOKENS)}
          speed={num(v, 'speed', 0.25)}
          bands={num(v, 'bands', 5)}
          amplitude={num(v, 'amplitude', 0.12)}
        />,
      ),
  },
  'background/dots': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'L’espace est replie sur lui-même : le coût ne depend pas du nombre de points.',
    render: (v) =>
      fill(
        <Dots
          className="o-size-full"
          colors={list(v, 'colors', DOTS_TOKENS)}
          speed={num(v, 'speed', 1.2)}
          density={num(v, 'density', 14)}
          radius={num(v, 'radius', 0.18)}
        />,
      ),
  },
  'background/beams': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'C’est l’espace qui tourne, pas les rais : deux multiplications au lieu d’une géométrie.',
    render: (v) =>
      fill(
        <Beams
          className="o-size-full"
          colors={list(v, 'colors', BEAMS_TOKENS)}
          speed={num(v, 'speed', 0.35)}
          count={num(v, 'count', 9)}
          angle={num(v, 'angle', 0.35)}
        />,
      ),
  },
  'background/mesh': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Trois taches suffisent : au-delà, elles se recouvrent et le motif se perd.',
    render: (v) =>
      fill(
        <Mesh
          className="o-size-full"
          colors={list(v, 'colors', MESH_TOKENS)}
          speed={num(v, 'speed', 0.2)}
          spread={num(v, 'spread', 0.55)}
        />,
      ),
  },
  'background/grid-lines': {
    height: 'o-h-80',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Aucun contexte graphique : celui-ci se pose autant de fois qu’on veut sur une page.',
    render: (v, frame) =>
      fill(
        <GridLines
          className="o-size-full"
          size={num(v, 'size', 48)}
          thickness={num(v, 'thickness', 1)}
          speed={num(v, 'speed', 0)}
          color={frame.color}
        />,
      ),
  },

  'background/bubbles': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'formulaire',
    lead: 'Deux disques dessines côté a côté restent deux disques ; deux champs additionnes fusionnent.',
    render: (v) =>
      fill(
        <Bubbles
          className="o-size-full"
          colors={list(v, 'colors', BUBBLES_TOKENS)}
          speed={num(v, 'speed', 0.25)}
          count={num(v, 'count', 9)}
          radius={num(v, 'radius', 0.09)}
        />,
      ),
  },
  'background/caustics': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'formulaire',
    lead: 'Cinq replis de l’espace. La distance accumulee dessine les filaments.',
    render: (v) =>
      fill(
        <Caustics
          className="o-size-full"
          colors={list(v, 'colors', CAUSTICS_TOKENS)}
          speed={num(v, 'speed', 0.5)}
          scale={num(v, 'scale', 4)}
          intensity={num(v, 'intensity', 1)}
        />,
      ),
  },
  'background/cells': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'La difference entre première et seconde distance s’annule sur les aretes.',
    render: (v) =>
      fill(
        <Cells
          className="o-size-full"
          colors={list(v, 'colors', CELLS_TOKENS)}
          speed={num(v, 'speed', 0.35)}
          density={num(v, 'density', 7)}
          edge={num(v, 'edge', 0.06)}
        />,
      ),
  },
  'background/contour': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'L’épaisseur du trait est corrigee par la dérivée du champ, donc constante partout.',
    render: (v) =>
      fill(
        <Contour
          className="o-size-full"
          colors={list(v, 'colors', CONTOUR_TOKENS)}
          speed={num(v, 'speed', 0.06)}
          scale={num(v, 'scale', 2.2)}
          levels={num(v, 'levels', 8)}
        />,
      ),
  },
  'background/halftone': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'La trame est bicolore : c’est la taille des points qui simule la nuance.',
    render: (v) =>
      fill(
        <Halftone
          className="o-size-full"
          colors={list(v, 'colors', HALFTONE_TOKENS)}
          speed={num(v, 'speed', 0.12)}
          density={num(v, 'density', 26)}
          angle={num(v, 'angle', 0.26)}
        />,
      ),
  },
  'background/hex': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Deux grilles rectangulaires decalees d’une demi-maille en font une hexagonale.',
    render: (v) =>
      fill(
        <Hex
          className="o-size-full"
          colors={list(v, 'colors', HEX_TOKENS)}
          speed={num(v, 'speed', 0.6)}
          density={num(v, 'density', 9)}
          edge={num(v, 'edge', 0.04)}
        />,
      ),
  },
  'background/mosaic': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Le champ est lu au centre de la cellule : le carreau n’existe nulle part dans le calcul.',
    render: (v) =>
      fill(
        <Mosaic
          className="o-size-full"
          colors={list(v, 'colors', MOSAIC_TOKENS)}
          speed={num(v, 'speed', 0.05)}
          density={num(v, 'density', 16)}
          gap={num(v, 'gap', 0.06)}
        />,
      ),
  },
  'background/plasma': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Quatre sinus au même point. La figure n’est faite que de leurs battements.',
    render: (v) =>
      fill(
        <Plasma
          className="o-size-full"
          colors={list(v, 'colors', PLASMA_TOKENS)}
          speed={num(v, 'speed', 0.35)}
          scale={num(v, 'scale', 3)}
        />,
      ),
  },
  'background/rain': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Une vitesse par colonne : sans ce décalage, la pluie tomberait en rangs.',
    render: (v) =>
      fill(
        <Rain
          className="o-size-full"
          colors={list(v, 'colors', RAIN_TOKENS)}
          speed={num(v, 'speed', 0.6)}
          columns={num(v, 'columns', 60)}
          length={num(v, 'length', 0.35)}
        />,
      ),
  },
  'background/ripple-grid': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'A amplitude nulle, la grille sans WebGL fait le même travail pour bien moins cher.',
    render: (v) =>
      fill(
        <RippleGrid
          className="o-size-full"
          colors={list(v, 'colors', RIPPLE_GRID_TOKENS)}
          speed={num(v, 'speed', 0.4)}
          density={num(v, 'density', 14)}
          amplitude={num(v, 'amplitude', 0.06)}
        />,
      ),
  },
  'background/silk': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Le déplacement de domaine applique deux fois : une passe froisse, deux font couler.',
    render: (v) =>
      fill(
        <Silk
          className="o-size-full"
          colors={list(v, 'colors', SILK_TOKENS)}
          speed={num(v, 'speed', 0.08)}
          scale={num(v, 'scale', 1.6)}
          octaves={num(v, 'octaves', 4)}
        />,
      ),
  },
  'background/spectrum': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Trois cosinus decales d’un tiers de tour : le balayage ne traverse jamais de gris.',
    render: (v) =>
      fill(
        <Spectrum
          className="o-size-full"
          colors={list(v, 'colors', SPECTRUM_TOKENS)}
          speed={num(v, 'speed', 0.08)}
          turns={num(v, 'turns', 1)}
          saturation={num(v, 'saturation', 0.5)}
        />,
      ),
  },
  'background/stars': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Trois profondeurs a trois vitesses. Une seule couche se lirait comme une texture qui glisse.',
    render: (v) =>
      fill(
        <Stars
          className="o-size-full"
          colors={list(v, 'colors', STARS_TOKENS)}
          speed={num(v, 'speed', 0.5)}
          density={num(v, 'density', 24)}
          twinkle={num(v, 'twinkle', 0.6)}
        />,
      ),
  },
  'background/threads': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'L’épaisseur est divisee par la pente : sans cela le fil s’epaissirait sur les plats.',
    render: (v) =>
      fill(
        <Threads
          className="o-size-full"
          colors={list(v, 'colors', THREADS_TOKENS)}
          speed={num(v, 'speed', 0.3)}
          count={num(v, 'count', 7)}
          thickness={num(v, 'thickness', 0.004)}
        />,
      ),
  },
  'background/tunnel': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'z = 1/r : toute la perspective tient dans cette division.',
    render: (v) =>
      fill(
        <Tunnel
          className="o-size-full"
          colors={list(v, 'colors', TUNNEL_TOKENS)}
          speed={num(v, 'speed', 0.25)}
          rings={num(v, 'rings', 0.6)}
          segments={num(v, 'segments', 12)}
        />,
      ),
  },
  'background/vortex': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'En polaires, un tourbillon n’est pas un mouvement mais une addition.',
    render: (v) =>
      fill(
        <Vortex
          className="o-size-full"
          colors={list(v, 'colors', VORTEX_TOKENS)}
          speed={num(v, 'speed', 0.25)}
          arms={num(v, 'arms', 6)}
          twist={num(v, 'twist', 2.5)}
        />,
      ),
  },

  'background/dot-matrix': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Une grille qui s’allume depuis le centre. Le sens est un uniforme : l’aller et le retour partagent la seule surface que l’arbitre accorde.',
    render: (v) =>
      fill(
        <DotMatrix
          className="o-size-full"
          colors={list(v, 'colors', DOT_MATRIX_TOKENS)}
          reverse={v['reverse'] === true}
          speed={num(v, 'speed', 0.6)}
          cells={num(v, 'cells', 42)}
          dot={num(v, 'dot', 0.3)}
          flicker={num(v, 'flicker', 0.7)}
        />,
      ),
  },

  'background/orbital-sphere': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Une sphere de points repartis par la spirale de Fibonacci, ceinte d’anneaux inclines.',
    render: (v) =>
      fill(
        <OrbitalSphere
          className="o-size-full"
          colors={list(v, 'colors', ORBITAL_SPHERE_TOKENS)}
          points={num(v, 'points', 2400)}
          rings={num(v, 'rings', 3)}
          nodes={num(v, 'nodes', 12)}
          rpm={num(v, 'rpm', 2)}
        />,
      ),
  },
  'background/globe-mesh': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. Elle se glisse au pointeur, et ses faces s’allument.',
    },
    lead: 'Trois appels de dessin quelle que soit la densité : tout est dérive dans le shader.',
    render: (v) =>
      fill(
        <GlobeMesh
          className="o-size-full"
          colors={list(v, 'colors', GLOBE_MESH_TOKENS)}
          density={num(v, 'density', 14)}
          spin={num(v, 'spin', 8)}
          detail={num(v, 'detail', 1)}
          sweepAngle={num(v, 'sweepAngle', 90)}
        />,
      ),
  },

  'background/ashen-press': {
    height: 'o-h-96',
    lead: 'Une porte vers un paquet tiers : rien n’est télécharge avant l’approche du champ, et rien du tout sous mouvement réduit.',
    render: () => (
      <Stage>
        <p className="o-max-w-sm o-text-center o-text-sm o-text-zinc-600 dark:o-text-zinc-300">
          Cette entrée demande le paquet threeui, que le registre n’embarque pas. Elle
          ouvre en outre sa propre surface WebGL, hors de l’arbitre du moteur : un seul
          fond de ce genre par page.
        </p>
      </Stage>
    ),
  },

  // ----- Heros ---------------------------------------------------------------
  'hero/tide': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur « Scène » du panneau la monte quand vous le decidez.',
    },
    lead: 'Une nappe soulevee par une houle de bruit, eclairee en rasant : le pointeur l’incline, le défilement du cadre l’eloigne.',
    render: (v) =>
      fill(
        <Tide
          className="o-size-full"
          colors={list(v, 'colors', TIDE_TOKENS)}
          amplitude={num(v, 'amplitude', 0.45)}
          frequency={num(v, 'frequency', 0.55)}
          speed={num(v, 'speed', 0.18)}
          shine={num(v, 'shine', 0.9)}
          parallax={num(v, 'parallax', 0.2)}
          scroll={num(v, 'scroll', 1)}
        />,
      ),
  },
  'hero/molten': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur « Scène » du panneau la monte quand vous le decidez.',
    },
    lead: 'Une masse en fusion, deformee par un bruit tridimensionnel.',
    render: (v) =>
      fill(
        <Molten
          className="o-size-full"
          colors={list(v, 'colors', MOLTEN_TOKENS)}
          amplitude={num(v, 'amplitude', 0.28)}
          glow={num(v, 'glow', 0.8)}
          parallax={num(v, 'parallax', 0.25)}
        />,
      ),
  },

  'hero/scroll-video': {
    height: 'o-h-96',
    lead: 'Le défilement fait avancer la video, sans jamais verrouiller la page : une enveloppe haute, une scène collante, et la progression reelle.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
        <ScrollVideo
          src={CLIP}
          poster={CLIP_POSTER}
          description="Un dégradé anime, avec un carre qui dérive"
          title="La ville s’ouvre"
          tagline="Chaque porte est deja ouverte."
          range={num(v, 'range', 3)}
          ease={num(v, 'ease', 6)}
        />
      </div>
    ),
  },

  'hero/spline-scene': {
    height: 'o-h-72',
    lead: 'Seule entrée du registre sans aperçu vivant, et pour une raison qui lui appartient.',
    render: () => (
      <Stage>
        <div className="o-max-w-md o-space-y-3">
          <div className="o-h-24 o-rounded-lg o-bg-gradient-to-br o-from-zinc-200 o-to-zinc-300 dark:o-from-zinc-800 dark:o-to-zinc-900" />
          <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Voilà ce que le cadre montre tant que la scène n’est pas la — et pour
            toujours en mouvement réduit.
          </p>
          <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            La scène elle-même n’est pas montree ici : son adresse appartient au
            compte Spline du projet, et le runtime est un paquet tiers que cette
            documentation n’installe pas. L’onglet « Code » montre l’integralite du
            composant.
          </p>
        </div>
      </Stage>
    ),
  },

  // ----- Texte ---------------------------------------------------------------
  'text/split-reveal': {
    height: 'o-h-80',
    lead: 'En situation : le composant est le titre du hero, et se compose caractère par caractère.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <SplitReveal
            key={JSON.stringify(v)}
            as="span"
            className="o-block"
            by={str(v, 'by', 'chars') as 'chars' | 'words' | 'lines'}
            stagger={num(v, 'stagger', 24)}
            distance={num(v, 'distance', 24)}
          >
            Des interfaces vivantes
          </SplitReveal>
        }
      />
    ),
  },
  'text/decode-text': {
    height: 'o-h-80',
    lead: 'En situation : le titre du hero se decode. Le brouillage n’existe que pour l œil, le texte reste annonce et cherchable.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <DecodeText
            key={JSON.stringify(v)}
            as="span"
            className="o-block o-font-mono"
            duration={num(v, 'duration', 1200)}
            trigger={str(v, 'trigger', 'view') as 'view' | 'mount' | 'hover'}
          >
            ODORO ENGINE
          </DecodeText>
        }
      />
    ),
  },
  'text/typewriter': {
    height: 'o-h-80',
    lead: 'En situation : la frappe tourne dans le titre du hero, une image sur trois.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <span className="o-block">
            Odoro, c’est{' '}
            <Typewriter
              typeSpeed={num(v, 'typeSpeed', 55)}
              hold={num(v, 'hold', 1400)}
              phrases={[
                'un systeme de style',
                'un moteur d animation',
                'un routeur',
                'un registre de composants',
              ]}
            />
          </span>
        }
      />
    ),
  },
  'text/shine-text': {
    height: 'o-h-80',
    lead: 'En situation : le reflet balaie le titre du hero. Aucun JavaScript ne s’execute après le premier rendu.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <ShineText
            as="span"
            className="o-block"
            from={frame.color}
            duration={num(v, 'duration', 3000)}
            width={num(v, 'width', 30)}
          >
            Le registre qui brille
          </ShineText>
        }
      />
    ),
  },

  'text/split-lines': {
    height: 'o-h-80',
    lead: 'En situation : un titre de hero sur plusieurs lignes, chacune montant sous son masque telle que le navigateur l’a composee.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <SplitLines
            key={JSON.stringify(v)}
            as="span"
            className="o-block"
            duration={num(v, 'duration', 700)}
            stagger={num(v, 'stagger', 90)}
            delay={num(v, 'delay', 0)}
            declenchement="montage"
          >
            Une ligne n’existe pas dans le DOM : on la lit donc là où elle
            existe, après la mise en page.
          </SplitLines>
        }
      />
    ),
  },
  'text/count-up': {
    height: 'o-h-72',
    lead: 'En situation : un bandeau de chiffres en pied de section. Le nombre final est toujours dans le DOM ; les valeurs intermediaires sont un calque.',
    render: (v, frame) => (
      <div className="o-flex o-h-full o-flex-col o-justify-between o-p-6 sm:o-p-8">
        <p className="o-max-w-sm o-text-lg o-font-bold o-tracking-tight">
          Des chiffres qui comptent, pas des chiffres qui clignotent.
        </p>
        <div className="o-grid o-grid-cols-3 o-gap-3" key={JSON.stringify(v)}>
          {[
            {
              value: num(v, 'value', 12480),
              from: num(v, 'from', 0),
              decimals: num(v, 'decimals', 0),
              suffix: str(v, 'suffix', ''),
              legende: 'projets livres',
            },
            { value: 99.98, from: 90, decimals: 2, suffix: ' %', legende: 'disponibilite' },
            { value: 42, from: 0, decimals: 0, suffix: '', legende: 'pays couverts' },
          ].map((stat) => (
            <div
              key={stat.legende}
              className="o-border-w-1 o-p-4"
              style={{
                borderColor: 'currentColor',
                borderRadius: `${String(frame.radius)}px`,
                backgroundColor: 'color-mix(in oklab, currentColor 8%, transparent)',
              }}
            >
              <CountUp
                value={stat.value}
                from={stat.from}
                duration={num(v, 'duration', 1500)}
                decimals={stat.decimals}
                suffix={stat.suffix}
                declenchement="montage"
                className="o-text-3xl o-font-extrabold o-tracking-tight o-tabular-nums"
              />
              <p className="o-text-xs o-opacity-70">{stat.legende}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  'text/highlight-sweep': {
    height: 'o-h-80',
    lead: 'En situation : le surligneur passe sur deux mots du titre. Il ne découpe rien, un fond se trace derrière le nœud existant.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <span className="o-block" key={JSON.stringify(v)}>
            Un moteur{' '}
            <HighlightSweep
              thickness={num(v, 'thickness', 0.35)}
              duration={num(v, 'duration', 600)}
              delay={num(v, 'delay', 0)}
              declenchement="montage"
            >
              cent pour cent maison
            </HighlightSweep>
            , et rien d’autre.
          </span>
        }
      />
    ),
  },
  'text/rotating-words': {
    height: 'o-h-80',
    lead: 'En situation : le mot tourne dans le titre du hero. La largeur ne saute pas, tous les mots occupent la même cellule de grille.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <span className="o-block">
            Construisez plus{' '}
            <RotatingWords
              words={['vite', 'sur', 'ensemble', 'sereinement']}
              interval={num(v, 'interval', 2200)}
              duration={num(v, 'duration', 420)}
              className="o-text-brand-400"
            />
          </span>
        }
      />
    ),
  },

  // ----- Effets --------------------------------------------------------------
  'effect/cursor-halo': {
    height: 'o-h-72',
    lead: 'Le point est exact, le halo arrive après — et c’est cet écart, pas le rond, qui fait l’effet.',
    render: (v) => (
      <CursorHaloDemo
        speed={num(v, 'speed', 8)}
        haloSize={num(v, 'haloSize', 34)}
        hoverScale={num(v, 'hoverScale', 1.8)}
      />
    ),
  },
  'effect/magnetic': {
    height: 'o-h-64',
    lead: 'Trois cibles côté a côté, comme dans une barre d’actions : chacune attire le pointeur qui l’approche.',
    render: (v) => (
      <Stage>
        <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-6">
          {['Suivre', 'Partager', 'Nous ecrire'].map((mot) => (
            <Magnetic
              key={mot}
              strength={num(v, 'strength', 0.35)}
              radius={num(v, 'radius', 120)}
              ease={num(v, 'ease', 8)}
            >
              <span className="o-inline-flex o-h-12 o-items-center o-rounded-full o-border-w-1 o-border-current o-px-6 o-text-sm o-font-medium">
                {mot}
              </span>
            </Magnetic>
          ))}
        </div>
      </Stage>
    ),
  },
  'effect/spotlight': {
    height: 'o-h-80',
    lead: 'Une grille de quatre cartes, comme sur une page de fonctionnalites : le halo suit le pointeur de l’une a l’autre. Deux variables CSS écrites au déplacement, aucun rendu React.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-grid o-grid-cols-2 o-gap-4 o-p-6">
        {[
          ['Moteur', 'Une boucle unique, partagee par toute la page.'],
          ['Registre', 'Des composants copies, jamais lies.'],
          ['Styles', 'Une feuille generee depuis les tokens.'],
          ['Routeur', 'Des transitions sans rechargement.'],
        ].map(([titre, texte]) => (
          <Spotlight
            key={titre}
            size={num(v, 'size', 320)}
            border={v['border'] !== false}
            className="o-flex o-flex-col o-justify-center o-rounded-xl o-border-w-1 o-border-current o-p-5"
          >
            <h4 className="o-text-sm o-font-semibold">{titre}</h4>
            <p className="o-mt-1 o-text-xs o-opacity-70">{texte}</p>
          </Spotlight>
        ))}
      </div>
    ),
  },
  'effect/border-beam': {
    height: 'o-h-72',
    lead: 'Trois offres, dont une mise en avant par le faisceau : c’est l’usage reel de l’effet, distinguer une carte parmi ses voisines.',
    render: (v, frame) => (
      <div className="o-absolute o-inset-0 o-grid o-grid-cols-3 o-items-center o-gap-4 o-p-6">
        <div className="o-rounded-xl o-border-w-1 o-border-current o-p-5">
          <h4 className="o-text-sm o-font-semibold">Départ</h4>
          <p className="o-mt-1 o-text-xs o-opacity-70">Pour essayer.</p>
        </div>
        <BorderBeam
          duration={num(v, 'duration', 4000)}
          width={num(v, 'width', 2)}
          trail={num(v, 'trail', 25)}
          color={frame.color}
          className="o-rounded-xl o-border-w-1 o-border-current o-p-5"
        >
          <h4 className="o-text-sm o-font-semibold">Studio</h4>
          <p className="o-mt-1 o-text-xs o-opacity-70">
            La couleur du trait suit celle du texte.
          </p>
        </BorderBeam>
        <div className="o-rounded-xl o-border-w-1 o-border-current o-p-5">
          <h4 className="o-text-sm o-font-semibold">Agence</h4>
          <p className="o-mt-1 o-text-xs o-opacity-70">Sans plafond.</p>
        </div>
      </div>
    ),
  },
  'effect/marquee': {
    height: 'o-h-40',
    lead: 'Le contenu est rendu deux fois et translate de la moitie : la boucle ne se voit pas.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-flex o-items-center">
        <Marquee
          speed={num(v, 'speed', 40)}
          reverse={v['reverse'] === true}
          pauseOnHover={v['pauseOnHover'] !== false}
          fade={num(v, 'fade', 12)}
          className="o-w-full"
        >
          {['Routeur', 'Styles', 'Animations', 'Moteur', 'Registre', 'CLI'].map(
            (word) => (
              <span
                key={word}
                className="o-px-8 o-text-2xl o-font-bold o-tracking-tight o-opacity-70"
              >
                {word}
              </span>
            ),
          )}
        </Marquee>
      </div>
    ),
  },
  'effect/carousel': {
    height: 'o-h-72',
    lead: 'Le défilement natif apporte le geste, l’inertie et le clavier.',
    render: (v, frame) => (
      <div className="o-absolute o-inset-0 o-flex o-items-center o-p-6">
        <Carousel
          label="Exemple de carrousel"
          perView={num(v, 'perView', 2)}
          gap={num(v, 'gap', 16)}
          loop={v['loop'] === true}
          className="o-w-full"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="o-flex o-h-32 o-items-center o-justify-center o-border-w-1 o-border-current o-text-3xl o-font-bold"
              style={{ borderRadius: `${String(frame.radius)}px` }}
            >
              {n}
            </div>
          ))}
        </Carousel>
      </div>
    ),
  },
  'effect/deform': {
    height: 'o-h-80',
    lead: 'Le temoin à gauche, le même contenu deforme à droite. Une deformation ne se voit que sur du détail.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-grid o-grid-cols-2 o-items-center o-gap-6 o-p-6">
        <div className="o-flex o-flex-col o-items-center o-gap-2">
          <span className="o-text-xs o-uppercase o-tracking-wide o-opacity-50">sans</span>
          <Frame src={SAMPLE} alt="" ratio={16 / 9} className="o-w-full o-rounded-lg" />
        </div>
        <div className="o-flex o-flex-col o-items-center o-gap-2">
          <span className="o-text-xs o-uppercase o-tracking-wide o-opacity-50">
            deforme
          </span>
          <Deform
            className="o-w-full"
            amount={num(v, 'amount', 22)}
            frequency={num(v, 'frequency', 0.014)}
            speed={num(v, 'speed', 0.15)}
            octaves={num(v, 'octaves', 1)}
            edges={str(v, 'edges', 'clean') as 'clean' | 'organic'}
          >
            <Frame src={SAMPLE} alt="" ratio={16 / 9} className="o-w-full o-rounded-lg" />
          </Deform>
        </div>
      </div>
    ),
  },

  'effect/neon-border': {
    height: 'o-h-80',
    lead: 'L’arc avance a pas constant le long du bord, pas en angle : sans cette correction il file sur les petits côtés et traine sur les longs.',
    render: (v) => (
      <Stage>
        <div className="o-relative o-flex o-h-40 o-w-64 o-flex-col o-items-center o-justify-center o-gap-1 o-rounded-2xl o-bg-zinc-950 o-p-6">
          <p className="o-text-sm o-font-semibold o-text-zinc-50">Accès anticipe</p>
          <p className="o-text-xs o-text-zinc-400">L’arc fait le tour de la carte.</p>
          <NeonBorder
            radius={num(v, 'radius', 16)}
            thickness={num(v, 'thickness', 2)}
            length={num(v, 'length', 50)}
            glow={num(v, 'glow', 100)}
            duration={num(v, 'duration', 4000)}
          />
        </div>
      </Stage>
    ),
  },

  // ----- Images --------------------------------------------------------------
  'image/frame': {
    height: 'o-h-80',
    lead: 'Le rapport est pose dès le premier rendu : l’image qui arrive ne pousse rien.',
    render: (v) => (
      <Stage>
        <Frame
          src={SAMPLE}
          alt="Image de démonstration"
          ratio={num(v, 'ratio', 1.777)}
          zoom={num(v, 'zoom', 0.08)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/compare': {
    height: 'o-h-80',
    lead: 'Un curseur, pas une image cliquable : les fleches le déplacent.',
    render: (v) => (
      <Stage>
        <Compare
          label="Comparaison de démonstration"
          before={{ src: SAMPLE, alt: 'Version initiale' }}
          after={{ src: detailed(), alt: 'Version retouchee' }}
          start={num(v, 'start', 50)}
          ratio={num(v, 'ratio', 1.777)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/video': {
    height: 'o-h-80',
    lead: 'La lecture attend l’entrée dans le champ, et n’a jamais lieu sous mouvement réduit.',
    render: (v) => (
      <Stage>
        <Video
          src={CLIP}
          poster={CLIP_POSTER}
          description="Un dégradé anime, avec un carre qui dérive"

          ratio={num(v, 'ratio', 1.777)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/player': {
    height: 'o-h-96',
    lead: 'Ce qui reste au natif reste au natif : decodage, sous-titres, plein écran.',
    render: (v) => (
      <Stage>
        <Player
          src={CLIP}
          poster={CLIP_POSTER}
          label="Video de démonstration"
          ratio={num(v, 'ratio', 1.777)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },

  'section/stat-band': {
    height: 'o-h-64',
    lead: 'Le retard entre les nombres appartient a la bande : une rangee se lit comme un objet, pas comme trois événements.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-flex o-items-center o-px-10">
        <StatBand
          stagger={num(v, 'stagger', 120)}
          duration={num(v, 'duration', 1500)}
          locale="fr-FR"
          className="o-w-full"
          stats={[
            { value: 12480, label: 'projets livres' },
            { value: 99.98, label: 'disponibilite', suffix: ' %', decimals: 2 },
            { value: 42, label: 'pays' },
            { value: 74, label: 'entrées au registre' },
          ]}
        />
      </div>
    ),
  },
  'section/pricing-tiers': {
    height: 'o-h-[34rem]',
    lead: 'Basculez la période : les prix se recalculent au lieu d’être remplaces, et l œil suit le sens du changement.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-auto o-p-8">
        <PricingTiers
          yearlyDiscount={num(v, 'yearlyDiscount', 0.2)}
          locale="fr-FR"
          tiers={[
            {
              name: 'Depart',
              monthly: 0,
              note: 'Pour essayer',
              features: ['Un projet', 'Registre public', 'Communaute'],
              cta: 'Commencer',
            },
            {
              name: 'Studio',
              monthly: 29,
              note: 'Le cas courant',
              features: ['Dix projets', 'Bases geree', 'Support sous 24 h'],
              featured: true,
            },
            {
              name: 'Agence',
              monthly: 99,
              note: 'Sans plafond',
              features: ['Projets illimites', 'Astreinte', 'Registre prive'],
            },
          ]}
        />
      </div>
    ),
  },

  // ----- Sections ------------------------------------------------------------
  'section/reveal-grid': {
    height: 'o-h-96',
    lead: 'Transitions CSS decalees : aucun JavaScript ne s’execute pendant l’animation.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-6">
        <RevealGrid
          key={JSON.stringify(v)}
          columns={num(v, 'columns', 3)}
          stagger={num(v, 'stagger', 70)}
          distance={num(v, 'distance', 24)}
        >
          {[
            ['Format', 'Un dossier, un meta, une source.'],
            ['Validation', 'Le schema refuse l invalide.'],
            ['Installation', 'Les fichiers sont copies.'],
            ['Contrat', 'Des props typees et bornees.'],
            ['Diagnostic', 'Chaque refus est explique.'],
            ['Publication', 'Un index et un fichier par entree.'],
          ].map(([titre, texte]) => (
            <div
              key={titre}
              className="o-rounded-lg o-border-w-1 o-border-current o-p-4"
            >
              <p className="o-text-sm o-font-semibold">{titre}</p>
              <p className="o-mt-1 o-text-xs o-opacity-70">{texte}</p>
            </div>
          ))}
        </RevealGrid>
      </div>
    ),
  },
  'section/logo-band': {
    height: 'o-h-56',
    lead: 'Le défilement vient de effect/marquee : cette section n’ajoute qu’une mise en page.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-flex o-items-center">
        <LogoBand title="Ils emploient Odoro" speed={num(v, 'speed', 30)}>
          {['Atelier', 'Studio Nord', 'Fabrique', 'Comptoir', 'Maison Verte'].map(
            (nom) => (
              <span key={nom} className="o-text-lg o-font-semibold o-opacity-60">
                {nom}
              </span>
            ),
          )}
        </LogoBand>
      </div>
    ),
  },
  'section/faq': {
    height: 'o-h-96',
    lead: 'Le repliage est natif : c’est ce qui rend les réponses trouvables par la recherche du navigateur.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-6">
        <Faq
          single={v['single'] !== false}
          items={[
            {
              question: 'Pourquoi copier plutot que dependre ?',
              answer: <p>Un composant d’animation est presque toujours retouche.</p>,
            },
            {
              question: 'Que se passe-t-il sous mouvement reduit ?',
              answer: <p>L’animation est neutralisee, jamais l’état final.</p>,
            },
            {
              question: 'Deux fonds en shader sur une page ?',
              answer: <p>Non : l’arbitre n’accorde qu’un contexte par backend.</p>,
            },
          ]}
        />
      </div>
    ),
  },

  'effect/parallax': {
    height: 'o-h-96',
    lead: 'Faites defiler dans le cadre : le contenu se déplace moins vite que lui.',
    render: (v) => (
      <Scroller hauteur="220%">
        <div className="o-flex o-h-full o-flex-col o-justify-center o-gap-6 o-p-8">
          <p className="o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Defilez vers le bas
          </p>
          <div className="o-relative o-h-48 o-overflow-hidden o-rounded-xl">
            <Parallax
              key={JSON.stringify(v)}
              distance={num(v, 'distance', 80)}
              axis={str(v, 'axis', 'y') === 'x' ? 'x' : 'y'}
              scale={num(v, 'scale', 0)}
              className="o-absolute o-inset-0"
            >
              <img src={SAMPLE} alt="" className="o-size-full o-object-cover" />
            </Parallax>
          </div>
          <p className="o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            et remontez : l’image revient a sa place au centre du champ.
          </p>
        </div>
      </Scroller>
    ),
  },
  'effect/scroll-progress': {
    height: 'o-h-96',
    lead: 'Lue dans la boucle du moteur, et non par un rendu React par image. La cible est le contenu, jamais la barre.',
    render: (v) => (
      <ProgressDemo
        thickness={num(v, 'thickness', 3)}
        position={str(v, 'position', 'top') === 'bottom' ? 'bottom' : 'top'}
      />
    ),
  },
  'section/sticky-stack': {
    height: 'o-h-96',
    lead: 'Chaque carte se fige, puis se réduit quand la suivante la recouvre.',
    render: (v) => (
      <Scroller>
        <div className="o-p-6">
          <StickyStack
            key={JSON.stringify(v)}
            offset={num(v, 'offset', 24)}
            gap={num(v, 'gap', 24)}
            shrink={num(v, 'shrink', 0.05)}
          >
            {['Ecrire', 'Valider', 'Compiler', 'Installer'].map((titre, index) => (
              <div
                key={titre}
                className="o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-8 o-shadow-md"
              >
                <p className="o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-400">
                  Étape {index + 1}
                </p>
                <p className="o-text-lg o-font-semibold o-text-zinc-900 dark:o-text-zinc-50">
                  {titre}
                </p>
              </div>
            ))}
          </StickyStack>
        </div>
      </Scroller>
    ),
  },
  'section/scroll-steps': {
    height: 'o-h-96',
    lead: 'Le media reste colle et suit l’étape que le défilement a atteinte.',
    render: () => (
      <Scroller>
        <div className="o-p-6">
          <ScrollSteps
            label="Comment une entrée arrive dans un projet"
            steps={[
              {
                title: 'Écrire',
                body: <p>Un dossier, un composant, un meta qui le décrit.</p>,
              },
              {
                title: 'Valider',
                body: <p>Le schema refuse ce qui ne pourrait pas s’installer.</p>,
              },
              {
                title: 'Compiler',
                body: <p>Un fichier par entrée, source inline, plus un index.</p>,
              },
              {
                title: 'Installer',
                body: (
                  <p>Les fichiers sont copies, jamais liés : ils vous appartiennent.</p>
                ),
              },
            ]}
            render={(index) => (
              <div className="o-flex o-aspect-square o-items-center o-justify-center o-rounded-xl o-bg-gradient-to-br o-from-brand-600 o-to-fuchsia-600 o-text-6xl o-font-bold o-text-white">
                {index + 1}
              </div>
            )}
          />
        </div>
      </Scroller>
    ),
  },

  'section/sign-in': {
    height: 'o-h-96',
    lead: 'Trois écrans, poses sur la trame qui s’inverse a la reussite. Le composant enchaine et previent ; l’application decide.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
        <SignIn
          codeLength={num(v, 'codeLength', 6)}
          legal={<span>En continuant, vous acceptez les conditions.</span>}
        />
      </div>
    ),
  },
  'section/cinematic-footer': {
    height: 'o-h-96',
    lead: 'Le rideau est de la mise en page — une découpe et un élément fixe — et ne coûte rien a l’execution.',
    render: () => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
        <div className="o-h-1/2" />
        <CinematicFooter
          heading="On commence ?"
          word="ODORO"
          banner={<span className="o-px-8">Registre — moteur — librairie</span>}
          copyright="© 2026 Odoro"
        />
      </div>
    ),
  },

  'section/orbital-timeline': {
    height: 'o-h-96',
    lead: 'La rotation passe par la boucle du moteur : aucun rendu React pendant qu’elle tourne.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-hidden">
        <OrbitalTimeline
          className="o-h-full o-min-h-0"
          radius={num(v, 'radius', 130)}
          rpm={num(v, 'rpm', 1)}
          steps={[
            {
              id: 'cadrage',
              title: 'Cadrage',
              date: 'Janvier',
              status: 'done',
              energy: 100,
              content: <p>Ce que le produit doit faire, et ce qu’il ne fera pas.</p>,
            },
            {
              id: 'design',
              title: 'Design',
              date: 'Fevrier',
              status: 'done',
              energy: 90,
              relatedIds: ['cadrage', 'build'],
            },
            {
              id: 'build',
              title: 'Fabrication',
              date: 'Mars',
              status: 'current',
              energy: 60,
              relatedIds: ['design'],
            },
            {
              id: 'recette',
              title: 'Recette',
              date: 'Avril',
              status: 'todo',
              energy: 30,
              relatedIds: ['build'],
            },
          ]}
        />
      </div>
    ),
  },

  'section/book-shelf': {
    height: 'o-h-96',
    demoByDefault: true,
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. Glissez pour tourner le rayon, cliquez pour tirer un volume.',
    },
    lead: 'La scène seule : le panneau de détail et le catalogue appartiennent a la page, qui les rend avec ses propres composants.',
    render: (v) => <ShelfDemo colors={list(v, 'colors', BOOK_SHELF_TOKENS)} />,
  },

  // ----- Interface -----------------------------------------------------------
  'ui/shiny-button': {
    height: 'o-h-64',
    lead: 'L’angle du dégradé est une propriété enregistree, donc animable : aucune boucle JavaScript.',
    render: (v) => (
      <Stage>
        <ShinyButton
          colors={list(v, 'colors', SHINY_BUTTON_TOKENS)}
          spin={num(v, 'spin', 3000)}
        >
          Acceder sans limite
        </ShinyButton>
      </Stage>
    ),
  },
  'ui/pearl-button': {
    height: 'o-h-64',
    lead: 'Cinq ombres superposees, sans image ni filtre. Retirer la quatrieme colle le bouton a la page.',
    render: (v) => (
      <Stage>
        <PearlButton colors={list(v, 'colors', PEARL_BUTTON_TOKENS)}>
          Commencer
        </PearlButton>
      </Stage>
    ),
  },
  'ui/hover-reveal-button': {
    height: 'o-h-64',
    lead: 'Deux copies du libelle se croisent : la largeur du bouton ne bouge pas.',
    render: (v) => (
      <Stage>
        <HoverRevealButton colors={list(v, 'colors', HOVER_REVEAL_TOKENS)}>
          Nous écrire
        </HoverRevealButton>
      </Stage>
    ),
  },
  'ui/prompt-input': {
    height: 'o-h-96',
    lead: 'La hauteur est mesuree a chaque frappe, jamais devinee. Sans micro, le bouton de dictee est absent — l’original ecrivait une phrase d’exemple a la place.',
    render: () => (
      <Stage>
        <PromptInput className="o-max-w-md" />
      </Stage>
    ),
  },
  'ui/card-form': {
    height: 'o-h-96',
    lead: 'Contrôle de Luhn, et carte qui se retourne au focus du code. A ne pas brancher sur un encaissement reel sans passer par un champ heberge.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-6">
        <CardForm colors={list(v, 'colors', CARD_FORM_TOKENS)} />
      </div>
    ),
  },

  'ui/magnify-dock': {
    height: 'o-h-72',
    lead: 'L’échelle part du bas : les éléments grandissent vers le haut, et la cible ne bouge jamais pendant qu’on la vise.',
    render: (v) => (
      <Stage>
        <MagnifyDock scale={num(v, 'scale', 1.6)} radius={num(v, 'radius', 130)}>
          {['Accueil', 'Travaux', 'Studio', 'Journal', 'Contact'].map((mot) => (
            <button
              key={mot}
              type="button"
              className="o-rounded-lg o-border-w-1 o-border-current/20 o-px-4 o-py-3 o-text-sm o-font-medium"
            >
              {mot}
            </button>
          ))}
        </MagnifyDock>
      </Stage>
    ),
  },
  'ui/tilt-card': {
    height: 'o-h-80',
    lead: 'Le retard entre le pointeur et l’angle est ce qui donne du poids : collee, la carte serait sans masse.',
    render: (v) => (
      <Stage>
        <TiltCard
          tilt={num(v, 'tilt', 8)}
          perspective={num(v, 'perspective', 900)}
          speed={num(v, 'speed', 10)}
          glare={num(v, 'glare', 0.18)}
          className="o-w-72"
        >
          <div className="o-rounded-xl o-border-w-1 o-border-current/20 o-bg-white/60 dark:o-bg-zinc-900/60 o-p-6 o-text-left">
            <p className="o-text-xs o-uppercase o-tracking-wider o-opacity-60">Registre</p>
            <p className="o-mt-2 o-text-xl o-font-semibold o-tracking-tight">
              Soixante-douze entrées
            </p>
            <p className="o-mt-2 o-text-sm o-opacity-70">
              Promenez le pointeur sur la carte.
            </p>
          </div>
        </TiltCard>
      </Stage>
    ),
  },

  // ----- Rideaux -------------------------------------------------------------
  'loader/counter-gate': {
    height: 'o-h-96',
    lead: 'Le compteur se gare sous son plafond tant que rien n’est prêt — decochez « prêt » pour le voir tenir parole.',
    controls: [
      { kind: 'switch', name: 'ready', label: 'pret', value: true },
      { kind: 'range', name: 'ceiling', label: 'plafond', min: 50, max: 99, step: 1, value: 92 },
      {
        kind: 'range',
        name: 'minVisibleMs',
        label: 'plancher',
        min: 0,
        max: 3000,
        step: 100,
        value: 900,
        unit: 'ms',
      },
    ],
    render: (v) => (
      <CounterGateDemo
        ready={v['ready'] !== false}
        ceiling={num(v, 'ceiling', 92)}
        minVisibleMs={num(v, 'minVisibleMs', 900)}
      />
    ),
  },
  'loader/curtain-wipe': {
    height: 'o-h-96',
    lead: 'La plaque ne s’efface pas : elle se perce, par un découpage que le compositeur anime seul.',
    render: (v) => (
      <CurtainWipeDemo holdMs={num(v, 'holdMs', 1200)} wipeMs={num(v, 'wipeMs', 1000)} />
    ),
  },

  // ----- Hooks ---------------------------------------------------------------
  'hooks/use-pointer-damped': {
    height: 'o-h-96',
    lead: 'Promenez le pointeur dans le cadre : le petit cercle est la position brute, le disque la rattrape.',
    render: (v) => <PointerDampedDemo speed={num(v, 'speed', 3)} />,
  },
  'hooks/use-in-view': {
    height: 'o-h-96',
    lead: 'Ce qui compte est le seuil : montez la part visible, refaites defiler, le basculement arrive plus tard.',
    render: (v) => <InViewDemo amount={num(v, 'amount', 0.3)} />,
  },
  'hooks/use-poster': {
    height: 'o-h-96',
    lead: 'Le repli couvre l’attente, se fond quand la scène arrive, et reste quand elle ne viendra jamais.',
    render: (v) => <PosterDemo fade={num(v, 'fade', 320)} />,
  },

  // ----- Texte ---------------------------------------------------------------
  'text/glitch-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'La casse vit en rafales espacees d’un minuteur : entre deux, rien ne s’execute.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <GlitchText
            intensity={num(v, 'intensity', 3)}
            interval={num(v, 'interval', 2600)}
          >
            Un titre qui accroche
          </GlitchText>
        }
      />
    ),
  },
  'text/wave-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Toutes les lettres jouent la même animation ; seule leur phase differe.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <WaveText amplitude={num(v, 'amplitude', 6)} speed={num(v, 'speed', 1400)}>
            Un titre qui accroche
          </WaveText>
        }
      />
    ),
  },
  'text/blur-reveal': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Les mots passent du flou au net a l’entrée dans le champ ; le texte complet reste lisible aux lecteurs d’écran.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <BlurReveal
            key={JSON.stringify(v)}
            as="span"
            step={num(v, 'step', 90)}
            blur={num(v, 'blur', 8)}
            duration={num(v, 'duration', 600)}
          >
            Un titre qui accroche
          </BlurReveal>
        }
      />
    ),
  },
  'text/gradient-flow': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Le dégradé est la couleur du texte : sous mouvement réduit il reste, seul son déplacement s’arrête.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <GradientFlow speed={num(v, 'speed', 4000)} angle={num(v, 'angle', 90)}>
            Un titre qui accroche
          </GradientFlow>
        }
      />
    ),
  },

  // ----- Effets --------------------------------------------------------------
  'effect/ripple-click': {
    height: 'o-h-72',
    lead: 'Chaque clic crée un élément, l’anime, puis le retire : rien ne vit dans l’état React.',
    render: (v) => (
      <Stage>
        <RippleClick
          duration={num(v, 'duration', 600)}
          opacity={num(v, 'opacity', 0.25)}
          className="o-w-full o-max-w-sm o-rounded-xl o-border-w-1 o-border-current o-p-8 o-text-center"
        >
          <h4 className="o-text-lg o-font-semibold">Cliquez n’importe ou ici</h4>
          <p className="o-mt-2 o-text-sm o-opacity-70">
            L’onde part du point touche et couvre toute la zone, d’où que parte le
            clic.
          </p>
        </RippleClick>
      </Stage>
    ),
  },
  'effect/meteors': {
    height: 'o-h-80',
    lead: 'Position, delai et durée dérivent de l’index : la même pluie partout, sans erreur d’hydratation.',
    render: (v, frame) => (
      <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-p-6">
        <div
          className="o-relative o-h-full o-w-full o-overflow-hidden o-border-w-1 o-p-8"
          style={{
            borderColor: 'color-mix(in oklab, currentColor 20%, transparent)',
            borderRadius: `${String(frame.radius)}px`,
          }}
        >
          <Meteors count={num(v, 'count', 12)} angle={num(v, 'angle', 215)} />
          <h3 className="o-text-2xl o-font-bold o-tracking-tight">Un coin de hero</h3>
          <p className="o-mt-2 o-max-w-sm o-text-sm o-opacity-70">
            La pluie est decorative : elle est retiree de l’arbre d’accessibilite,
            et absente sous mouvement réduit.
          </p>
        </div>
      </div>
    ),
  },
  'effect/orbiting-dots': {
    height: 'o-h-80',
    lead: 'Deux anneaux croises, a vitesses et sens alternes : un seul se lirait comme un chargeur.',
    render: (v, frame) => (
      <Stage>
        <OrbitingDots
          count={num(v, 'count', 6)}
          radius={num(v, 'radius', 48)}
          speed={num(v, 'speed', 6000)}
          color={frame.color}
        >
          <span className="o-inline-flex o-h-16 o-items-center o-rounded-full o-border-w-1 o-border-current o-px-6 o-text-sm o-font-medium">
            Nouveau
          </span>
        </OrbitingDots>
      </Stage>
    ),
  },

  // ----- Interface -----------------------------------------------------------
  'ui/flip-card': {
    height: 'o-h-80',
    lead: 'Un bouton qui a l’air d’une carte : Entrée et Espace la retournent aussi, et la face cachee est muette aux lecteurs d’écran.',
    render: (v, frame) => (
      <Stage>
        <div className="o-grid o-grid-cols-2 o-gap-6">
          {[
            ['Recto', 'Verso'],
            ['Question', 'Reponse'],
          ].map(([front, back]) => (
            <FlipCard
              key={front}
              className="o-h-40 o-w-52"
              direction={str(v, 'direction', 'horizontal') as 'horizontal' | 'vertical'}
              duration={num(v, 'duration', 600)}
              front={
                <div
                  className="o-flex o-h-full o-items-center o-justify-center o-border-w-1 o-border-current o-p-6 o-text-lg o-font-semibold"
                  style={{ borderRadius: `${String(frame.radius)}px` }}
                >
                  {front}
                </div>
              }
              back={
                <div
                  className="o-flex o-h-full o-items-center o-justify-center o-border-w-1 o-border-current o-p-6 o-text-sm o-opacity-80"
                  style={{ borderRadius: `${String(frame.radius)}px` }}
                >
                  {back}
                </div>
              }
            />
          ))}
        </div>
      </Stage>
    ),
  },
  'ui/glow-card': {
    height: 'o-h-80',
    lead: 'La lueur ne se repand pas sur le fond : un masque la retient sur l’anneau de la bordure.',
    render: (v, frame) => (
      <Stage>
        <div className="o-grid o-w-full o-max-w-lg o-grid-cols-2 o-gap-6">
          {['Composer', 'Publier'].map((title) => (
            <GlowCard
              key={title}
              radius={num(v, 'radius', 200)}
              strength={num(v, 'strength', 0.8)}
              className="o-border-w-1 o-p-6"
              style={{
                borderColor: 'color-mix(in oklab, currentColor 20%, transparent)',
                borderRadius: `${String(frame.radius)}px`,
              }}
            >
              <h4 className="o-text-lg o-font-semibold">{title}</h4>
              <p className="o-mt-2 o-text-sm o-opacity-70">
                Longez la bordure avec le pointeur.
              </p>
            </GlowCard>
          ))}
        </div>
      </Stage>
    ),
  },

  // ----- Chargeurs -----------------------------------------------------------
  'loader/orbit-loader': {
    height: 'o-h-64',
    lead: 'Trois arcs a contresens : un signe d’attente qui ne pretend rien compter.',
    render: (v, frame) => (
      <Stage>
        <OrbitLoader
          size={num(v, 'size', 48)}
          speed={num(v, 'speed', 1200)}
          color={frame.color}
        />
      </Stage>
    ),
  },

  'ui/liquid-button': {
    height: 'o-h-64',
    lead: 'Le calque colore deborde de cinq pour cent : le rebond elastique ne découvre jamais le fond.',
    render: (v) => (
      <Stage>
        <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-3">
          <LiquidButton
            duration={num(v, 'duration', 450)}
            direction={str(v, 'direction', 'up') as 'up' | 'left'}
          >
            Publier
          </LiquidButton>
          <LiquidButton
            duration={num(v, 'duration', 450)}
            direction={str(v, 'direction', 'up') as 'up' | 'left'}
          >
            Enregistrer le brouillon
          </LiquidButton>
        </div>
      </Stage>
    ),
  },
  'ui/pill-tabs': {
    height: 'o-h-64',
    lead: 'La pastille est mesuree sur le vrai texte, jamais devinee : elle epouse le libelle long comme le court.',
    render: (v) => (
      <Stage>
        <PillTabsDemo size={str(v, 'size', 'md') as 'sm' | 'md'} />
      </Stage>
    ),
  },
  'ui/avatar-stack': {
    height: 'o-h-72',
    lead: 'L’etalement est une vraie marge, pas une transformation : la rangee pousse ses voisines. Le clavier y a droit aussi.',
    render: (v, frame) => (
      <Stage>
        <div
          className="o-flex o-flex-col o-gap-4 o-border-w-1 o-border-current/20 o-p-6 o-text-left"
          style={{ borderRadius: `${String(frame.radius)}px` }}
        >
          <div>
            <p className="o-font-semibold">Équipe aperçu</p>
            <p className="o-text-sm o-opacity-70">Cinq personnes sur le projet</p>
          </div>
          <AvatarStack
            items={[
              { name: 'Ada Lovelace' },
              { name: 'Grace Hopper' },
              { name: 'Alan Turing' },
              { name: 'Margaret Hamilton' },
              { name: 'Edsger Dijkstra' },
              { name: 'Barbara Liskov' },
              { name: 'Donald Knuth' },
            ]}
            max={num(v, 'max', 5)}
            offset={num(v, 'offset', 12)}
          />
        </div>
      </Stage>
    ),
  },
  'ui/theme-switch': {
    height: 'o-h-64',
    lead: 'Purement decoratif : il expose un état, et c’est la page qui decide d’en faire un thème — ou rien.',
    render: (v) => (
      <Stage>
        <ThemeSwitch size={num(v, 'size', 32)} />
      </Stage>
    ),
  },
  'ui/stacked-cards': {
    height: 'o-h-80',
    lead: 'La première carte donne sa taille au paquet ; les autres se posent dessus et s’eventent autour du centre.',
    render: (v, frame) => (
      <Stage>
        <StackedCards spread={num(v, 'spread', 10)} lift={num(v, 'lift', 36)}>
          {[
            ['Notes', 'Trois idees pour la maquette'],
            ['Taches', 'Relire la fiche du registre'],
            ['Lecture', 'Un chapitre sur les courbes'],
          ].map(([titre, corps]) => (
            <article
              key={titre}
              className="o-w-52 o-border-w-1 o-border-current/20 o-bg-white/80 dark:o-bg-zinc-900/80 o-p-6 o-text-left"
              style={{ borderRadius: `${String(frame.radius)}px` }}
            >
              <p className="o-text-xs o-uppercase o-tracking-wider o-opacity-60">{titre}</p>
              <p className="o-mt-2 o-text-sm">{corps}</p>
            </article>
          ))}
        </StackedCards>
      </Stage>
    ),
  },
  'ui/code-input': {
    height: 'o-h-72',
    lead: 'Chaque case est un vrai input : collez un code entier, il se repartit tout seul.',
    render: (v) => (
      <Stage>
        <CodeDemo
          length={num(v, 'length', 6)}
          masked={Boolean(v['masked'] ?? false)}
        />
      </Stage>
    ),
  },
  'ui/progress-ring': {
    height: 'o-h-72',
    lead: 'Le tiret du cercle fait exactement le perimetre : decaler le tiret découvre la fraction voulue, et une transition fait le trajet.',
    render: (v) => (
      <Stage>
        <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-6">
          {[28, num(v, 'value', 65), 92].map((valeur, rang) => (
            <ProgressRing
              key={rang}
              value={valeur}
              size={num(v, 'size', 96)}
              thickness={num(v, 'thickness', 8)}
            />
          ))}
        </div>
      </Stage>
    ),
  },
  'ui/copy-button': {
    height: 'o-h-64',
    lead: 'Le succès est annonce dans une region polie ; l’échec ne montre jamais de coche.',
    render: (v) => (
      <Stage>
        <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-3">
          <CopyButton
            value="pnpm dlx odoro add ui/copy-button"
            delay={num(v, 'delay', 2000)}
          />
          <CopyButton
            value="https://odoro.dev"
            label="Copier le lien"
            delay={num(v, 'delay', 2000)}
          />
        </div>
      </Stage>
    ),
  },
  'ui/rating-stars': {
    height: 'o-h-64',
    lead: 'Une étoile est un bouton radio : « 3 sur 5, coche » vient gratuitement, fleches comprises.',
    render: (v) => (
      <Stage>
        <RatingDemo count={num(v, 'count', 5)} size={num(v, 'size', 24)} />
      </Stage>
    ),
  },
  'ui/file-drop': {
    height: 'o-h-96',
    lead: 'L’input natif fait le vrai travail ; les pointilles ne défilent que pendant le survol d’un fichier, jamais sous mouvement réduit.',
    render: (v) => (
      <Stage>
        <FileDrop
          multiple={Boolean(v['multiple'] ?? true)}
          className="o-w-full o-max-w-md"
        />
      </Stage>
    ),
  },

  'text/falling-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Chaque lettre tombe en place avec un léger depassement ; le texte complet reste lisible aux lecteurs d’écran.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <FallingText
            key={JSON.stringify(v)}
            as="span"
            step={num(v, 'step', 45)}
            drop={num(v, 'drop', 1.2)}
          >
            Un titre qui accroche
          </FallingText>
        }
      />
    ),
  },
  'text/stroke-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Le contour est le texte reel ; la copie pleine, révélée par un clip-path qui monte, n’est qu’un calque aria-hidden.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <StrokeText
            key={JSON.stringify(v)}
            as="span"
            strokeWidth={num(v, 'strokeWidth', 1.5)}
            duration={num(v, 'duration', 900)}
          >
            Un titre qui accroche
          </StrokeText>
        }
      />
    ),
  },
  'text/circular-text': {
    height: 'o-h-80',
    lead: 'Un badge rotatif autour d’un point : le texte suit un trace SVG, la rotation est une seule animation CSS.',
    render: (v) => (
      <Stage>
        <span className="o-relative o-inline-flex o-items-center o-justify-center">
          <CircularText
            size={num(v, 'size', 160)}
            speed={num(v, 'speed', 12)}
            className="o-font-bold o-uppercase"
          >
            FAIT MAIN · DEPUIS 2012 · FAIT MAIN · DEPUIS 2012 ·
          </CircularText>
          <span
            className="o-absolute"
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'currentColor',
            }}
          />
        </span>
      </Stage>
    ),
  },
  'text/spotlight-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Le halo suit le pointeur par deux variables CSS, sans un seul rendu React ; hors survol, le titre reste lisible, attenue.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <SpotlightText radius={num(v, 'radius', 120)} rest={num(v, 'rest', 0.25)}>
            Un titre qui accroche
          </SpotlightText>
        }
      />
    ),
  },
  'text/counter-roll': {
    height: 'o-h-72',
    lead: 'En situation : un bandeau de chiffres. Chaque colonne roule jusqu’à son chiffre, en cascade depuis la droite ; la valeur finale reste lisible aux lecteurs d’écran.',
    render: (v, frame) => (
      <div className="o-flex o-h-full o-flex-col o-justify-between o-p-6 sm:o-p-8">
        <p className="o-max-w-sm o-text-lg o-font-bold o-tracking-tight">
          Des chiffres qui roulent, pas des chiffres qui clignotent.
        </p>
        <div className="o-grid o-grid-cols-3 o-gap-3" key={JSON.stringify(v)}>
          {[
            { value: num(v, 'value', 12480), legende: 'projets livres' },
            { value: 852, legende: 'clients suivis' },
            { value: 42, legende: 'pays couverts' },
          ].map((stat) => (
            <div
              key={stat.legende}
              className="o-border-w-1 o-p-4"
              style={{
                borderColor: 'currentColor',
                borderRadius: `${String(frame.radius)}px`,
                backgroundColor: 'color-mix(in oklab, currentColor 8%, transparent)',
              }}
            >
              <CounterRoll
                value={stat.value}
                duration={num(v, 'duration', 900)}
                step={num(v, 'step', 80)}
                className="o-text-3xl o-font-extrabold o-tracking-tight"
              />
              <p className="o-text-xs o-opacity-70">{stat.legende}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  'text/underline-draw': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Le trait se dessine sous deux mots du titre : un tiret normalise par pathLength, révèle par une transition.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <span className="o-block" key={JSON.stringify(v)}>
            Un choix{' '}
            <UnderlineDraw
              trigger={str(v, 'trigger', 'view') === 'hover' ? 'hover' : 'view'}
              thickness={num(v, 'thickness', 3)}
              duration={num(v, 'duration', 700)}
            >
              vraiment assume
            </UnderlineDraw>
          </span>
        }
      />
    ),
  },
  'text/letter-swap': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Au survol du titre, chaque lettre glisse et sa doublure prend sa place — tout est transition CSS, le retour est gratuit.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <LetterSwap step={num(v, 'step', 25)} duration={num(v, 'duration', 350)}>
            Un titre qui accroche
          </LetterSwap>
        }
      />
    ),
  },
  'text/echo-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Des copies attenuees suivent le pointeur, chacune avec son retard ; l’original ne bouge pas.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <EchoText
            copies={num(v, 'copies', 3)}
            lag={num(v, 'lag', 220)}
            spread={num(v, 'spread', 1)}
          >
            Un titre qui accroche
          </EchoText>
        }
      />
    ),
  },
  'effect/click-sparks': {
    height: 'o-h-72',
    lead: 'Chaque clic fait jaillir quelques traits du point d’appui : créés, animes, retires — rien ne vit dans l’état React.',
    render: (v, frame) => (
      <Stage>
        <ClickSparks
          count={num(v, 'count', 8)}
          distance={num(v, 'distance', 48)}
          duration={num(v, 'duration', 500)}
          color={frame.color}
          className="o-w-full o-max-w-sm o-rounded-xl o-border-w-1 o-border-current o-p-8 o-text-center"
        >
          <h4 className="o-text-lg o-font-semibold">Cliquez n’importe ou ici</h4>
          <p className="o-mt-2 o-text-sm o-opacity-70">
            Les etincelles partent du point touche, jamais du centre. Rien ne
            part sous mouvement réduit.
          </p>
        </ClickSparks>
      </Stage>
    ),
  },
  'effect/cursor-ring': {
    height: 'o-h-64',
    lead: 'Le point est exact, l’anneau rattrape — et grossit sur les boutons. Au toucher comme sous mouvement réduit, le curseur natif reste.',
    render: (v) => (
      <CursorRing
        size={num(v, 'size', 36)}
        lag={num(v, 'lag', 1)}
        grow={num(v, 'grow', 1.8)}
        className="o-absolute o-inset-0 o-flex o-items-center o-justify-center"
      >
        <div className="o-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-current o-p-2">
          <button
            type="button"
            className="o-rounded-full o-px-5 o-py-2 o-text-sm o-font-medium"
          >
            Suivre
          </button>
          <button
            type="button"
            className="o-rounded-full o-px-5 o-py-2 o-text-sm o-font-medium"
          >
            Partager
          </button>
        </div>
      </CursorRing>
    ),
  },
  'effect/beam-connect': {
    height: 'o-h-72',
    lead: 'Deux cartes identifiees par data-beam="from" et "to" : le trait est mesure au montage, remesure au redimensionnement, et le flux circule par une seule animation CSS.',
    render: (v) => (
      <BeamConnect
        curvature={num(v, 'curvature', 40)}
        speed={num(v, 'speed', 3000)}
        thickness={num(v, 'thickness', 2)}
        className="o-absolute o-inset-0 o-flex o-items-center o-justify-between o-p-10"
      >
        <div data-beam="from" className="o-rounded-xl o-border-w-1 o-border-current o-p-5">
          <h4 className="o-text-sm o-font-semibold">Collecte</h4>
          <p className="o-mt-1 o-text-xs o-opacity-70">data-beam="from"</p>
        </div>
        <div data-beam="to" className="o-rounded-xl o-border-w-1 o-border-current o-p-5">
          <h4 className="o-text-sm o-font-semibold">Entrepot</h4>
          <p className="o-mt-1 o-text-xs o-opacity-70">data-beam="to"</p>
        </div>
      </BeamConnect>
    ),
  },
  'effect/glitch-hover': {
    height: 'o-h-72',
    lead: 'Survolez ou donnez le focus : deux copies partent en tranches decalees, frange chaude d’un côté, froide de l’autre, puis tout redevient net.',
    render: (v) => (
      <Stage>
        <GlitchHover
          intensity={num(v, 'intensity', 6)}
          slices={num(v, 'slices', 3)}
          className="o-inline-block"
        >
          <div className="o-rounded-xl o-border-w-1 o-border-current o-px-8 o-py-6 o-text-center">
            <p className="o-text-xs o-uppercase o-tracking-wide o-opacity-50">Archive</p>
            <h4 className="o-mt-1 o-text-lg o-font-semibold">Vignette 07</h4>
            <p className="o-mt-1 o-text-xs o-opacity-70">Passez le pointeur dessus.</p>
          </div>
        </GlitchHover>
      </Stage>
    ),
  },
  'effect/scroll-velocity': {
    height: 'o-h-80',
    lead: 'Faites defiler la zone : le contenu penche avec la vitesse, pas avec la position, et se redresse en douceur a l’arrêt.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
        <ScrollVelocity
          strength={num(v, 'strength', 1)}
          damping={num(v, 'damping', 8)}
          className="o-space-y-6 o-p-8"
        >
          {Array.from({ length: 10 }, (_, index) => (
            <p key={index} className="o-max-w-prose o-text-sm o-opacity-70">
              Paragraphe {index + 1}. La vitesse est mesuree dans la boucle du
              moteur, lissee, puis écrite dans deux variables CSS : le transform
              qui les consomme n’est pose qu’une fois.
            </p>
          ))}
        </ScrollVelocity>
      </div>
    ),
  },
  'effect/inertia-drag': {
    height: 'o-h-72',
    lead: 'Trainez la pastille et lachez-la : elle file sur sa lancee, depasse, puis revient a sa place en ressort amorti.',
    render: (v) => (
      <Stage>
        <InertiaDrag friction={num(v, 'friction', 8)} spring={num(v, 'spring', 120)}>
          <span className="o-flex o-h-20 o-w-20 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-current o-text-center o-text-xs o-font-medium">
            Trainez-moi
          </span>
        </InertiaDrag>
      </Stage>
    ),
  },
  'effect/reveal-mask': {
    height: 'o-h-80',
    lead: 'Le rideau attend l’entrée dans le champ, puis les bandes se retirent l’une après l’autre. Sous mouvement réduit, le contenu est visible immediatement.',
    render: (v) => (
      <RevealMaskDemo
        bands={num(v, 'bands', 4)}
        duration={num(v, 'duration', 600)}
        step={num(v, 'step', 90)}
      />
    ),
  },
  'effect/float-group': {
    height: 'o-h-64',
    lead: 'Trois badges, trois cadences : durée et phase dérivent de l’index, jamais les mêmes pour deux voisins — le groupe respire au lieu de sauter a l’unisson.',
    render: (v) => (
      <Stage>
        <FloatGroup
          amplitude={num(v, 'amplitude', 8)}
          duration={num(v, 'duration', 3000)}
          className="o-flex o-items-center o-gap-6"
        >
          {['Nouveau', 'Sans engagement', 'Ouvert la nuit'].map((mot) => (
            <span
              key={mot}
              className="o-inline-flex o-items-center o-rounded-full o-border-w-1 o-border-current o-px-4 o-py-2 o-text-xs o-font-medium"
            >
              {mot}
            </span>
          ))}
        </FloatGroup>
      </Stage>
    ),
  },
  'image/hover-zoom': {
    height: 'o-h-96',
    lead: 'Le zoom suit le pointeur par l’origine de transformation : le cadre, lui, ne bouge jamais.',
    render: (v) => (
      <Stage>
        <HoverZoom
          src={SAMPLE}
          alt="Image de démonstration"
          ratio={num(v, 'ratio', 1.777)}
          zoom={num(v, 'zoom', 1.15)}
          duration={num(v, 'duration', 480)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/parallax-image': {
    height: 'o-h-96',
    lead: 'Faites defiler dans le cadre : l’image, plus haute que lui, glisse pendant la traversee.',
    render: (v) => (
      <Scroller hauteur="220%">
        <div className="o-flex o-h-full o-flex-col o-justify-center o-gap-6 o-p-8">
          <p className="o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Defilez vers le bas
          </p>
          <ParallaxImage
            key={JSON.stringify(v)}
            src={SAMPLE}
            alt="Image de démonstration"
            ratio={num(v, 'ratio', 1.777)}
            strength={num(v, 'strength', 0.35)}
            className="o-mx-auto o-w-full o-max-w-md o-rounded-lg"
          />
          <p className="o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            et remontez : l’image revient au centre de sa course.
          </p>
        </div>
      </Scroller>
    ),
  },
  'image/reveal-image': {
    height: 'o-h-96',
    lead: 'Le rideau est un découpage, le zoom une transformation : deux calques, deux transitions.',
    render: (v) => (
      <Stage>
        <RevealImage
          key={JSON.stringify(v)}
          src={SAMPLE}
          alt="Image de démonstration"
          ratio={num(v, 'ratio', 1.777)}
          direction={str(v, 'direction', 'up') === 'left' ? 'left' : 'up'}
          duration={num(v, 'duration', 900)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/tilt-glare': {
    height: 'o-h-96',
    lead: 'La carte pivote vers le pointeur, le reflet glisse a l’oppose : une lumière, pas un curseur.',
    render: (v) => (
      <Stage>
        <TiltGlare
          src={SAMPLE}
          alt="Image de démonstration"
          ratio={num(v, 'ratio', 1.777)}
          tilt={num(v, 'tilt', 10)}
          glare={num(v, 'glare', 0.25)}
          className="o-w-full o-max-w-md o-rounded-xl"
        />
      </Stage>
    ),
  },
  'image/duotone': {
    height: 'o-h-96',
    lead: 'Deux calques pleins font la bichromie ; survolez : les couleurs reviennent par transition.',
    render: (v) => (
      <Stage>
        <Duotone
          src={SAMPLE}
          alt="Image de démonstration"
          ratio={num(v, 'ratio', 1.777)}
          strength={num(v, 'strength', 1)}
          hover={v['hover'] !== false}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/ken-burns': {
    height: 'o-h-96',
    lead: 'Chaque image dérive lentement pendant son affichage ; la dérive dure deux intervalles et ne finit jamais a l’écran.',
    render: (v) => (
      <Stage>
        <KenBurns
          key={JSON.stringify(v)}
          images={TRAIL_SOURCES.slice(0, 3)}
          ratio={num(v, 'ratio', 1.777)}
          interval={num(v, 'interval', 4000)}
          zoom={num(v, 'zoom', 1.12)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/image-trail': {
    height: 'o-h-96',
    lead: 'Promenez le pointeur : une vignette nait a chaque franchissement du seuil, puis se resorbe.',
    render: (v) => (
      <ImageTrail
        key={JSON.stringify(v)}
        sources={TRAIL_SOURCES}
        threshold={num(v, 'threshold', 80)}
        life={num(v, 'life', 700)}
        size={num(v, 'size', 140)}
        className="o-absolute o-inset-0"
      >
        <div className="o-flex o-h-full o-items-center o-justify-center">
          <p className="o-text-sm o-opacity-60">Promenez le pointeur dans le cadre.</p>
        </div>
      </ImageTrail>
    ),
  },

  'loader/dots-loader': {
    height: 'o-h-64',
    lead: 'Une seule animation, trois delais negatifs : le canon est complet dès la première image.',
    render: (v, frame) => (
      <Stage>
        <DotsLoader
          size={num(v, 'size', 10)}
          speed={num(v, 'speed', 900)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/top-loader': {
    height: 'o-h-64',
    lead: 'Déterminée, la barre montre une valeur vraie ; indeterminee, elle balaie sans pretendre mesurer.',
    render: (v) => (
      <TopLoaderDemo
        height={num(v, 'height', 3)}
        indeterminate={v['indeterminate'] === true}
      />
    ),
  },
  'background/particle-field': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deplacez le curseur : les particules qu’il couvre s’allument, le champ dérive sans lui.',
    render: (v) =>
      fill(
        <ParticleField
          className="o-size-full"
          speed={num(v, 'speed', 0.4)}
          density={num(v, 'density', 10)}
          radius={num(v, 'radius', 0.22)}
          colors={list(v, 'colors', PARTICLE_FIELD_TOKENS)}
        />,
      ),
  },
  'background/hyperspace': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Montez la vitesse : les points deviennent des traits, et le point de fuite ne bouge pas.',
    render: (v) =>
      fill(
        <Hyperspace
          className="o-size-full"
          speed={num(v, 'speed', 1)}
          density={num(v, 'density', 64)}
          stretch={num(v, 'stretch', 1)}
          colors={list(v, 'colors', HYPERSPACE_TOKENS)}
        />,
      ),
  },
  'background/galaxy-spiral': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deux bras enroules autour d’un cœur ; la torsion règle combien de tours ils font.',
    render: (v) =>
      fill(
        <GalaxySpiral
          className="o-size-full"
          speed={num(v, 'speed', 0.5)}
          arms={num(v, 'arms', 2)}
          twist={num(v, 'twist', 3)}
          density={num(v, 'density', 18)}
          colors={list(v, 'colors', GALAXY_SPIRAL_TOKENS)}
        />,
      ),
  },
  'background/swarm': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Approchez le curseur : la nuee s’ouvre autour de lui et se referme derrière.',
    render: (v) =>
      fill(
        <Swarm
          className="o-size-full"
          count={num(v, 'count', 240)}
          speed={num(v, 'speed', 1)}
          avoid={num(v, 'avoid', 0.9)}
          colors={list(v, 'colors', SWARM_TOKENS)}
        />,
      ),
  },
  'background/constellation': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Les points proches se relient ; le curseur les attire, et ils reviennent a leur place.',
    render: (v) =>
      fill(
        <Constellation
          className="o-size-full"
          count={num(v, 'count', 110)}
          distance={num(v, 'distance', 0.9)}
          attract={num(v, 'attract', 1)}
          speed={num(v, 'speed', 0.6)}
          colors={list(v, 'colors', CONSTELLATION_TOKENS)}
        />,
      ),
  },
  'background/embers': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Les braises montent du bas du cadre, scintillent, et s’éteignent avant le haut.',
    render: (v) =>
      fill(
        <Embers
          className="o-size-full"
          speed={num(v, 'speed', 0.5)}
          density={num(v, 'density', 9)}
          glow={num(v, 'glow', 1)}
          colors={list(v, 'colors', EMBERS_TOKENS)}
        />,
      ),
  },
  'background/fireworks': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Cliquez dans le cadre : un bouquet éclate a cet endroit et retombe. Un autre part tout seul.',
    render: (v) =>
      fill(
        <Fireworks
          className="o-size-full"
          sparks={num(v, 'sparks', 32)}
          gravity={num(v, 'gravity', 0.25)}
          decay={num(v, 'decay', 1.1)}
          auto={num(v, 'auto', 2.6)}
          colors={list(v, 'colors', FIREWORKS_TOKENS)}
        />,
      ),
  },
  'background/dust': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Les grains ne se voient que dans le rai ; tournez-le, la poussiere suit la lumière.',
    render: (v) =>
      fill(
        <Dust
          className="o-size-full"
          speed={num(v, 'speed', 0.3)}
          density={num(v, 'density', 12)}
          angle={num(v, 'angle', -55)}
          width={num(v, 'width', 0.22)}
          colors={list(v, 'colors', DUST_TOKENS)}
        />,
      ),
  },
  'background/pollen': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Deplacez le curseur : le plan flou glisse plus que le plan net, et la profondeur apparaît.',
    render: (v) =>
      fill(
        <Pollen
          className="o-size-full"
          speed={num(v, 'speed', 0.35)}
          density={num(v, 'density', 11)}
          blur={num(v, 'blur', 0.6)}
          parallax={num(v, 'parallax', 1)}
          colors={list(v, 'colors', POLLEN_TOKENS)}
        />,
      ),
  },
  'background/orbit-rings': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Cinq anneaux en sens alternes autour d’un centre vide, l’ensemble en lente precession.',
    render: (v) =>
      fill(
        <OrbitRings
          className="o-size-full"
          rings={num(v, 'rings', 5)}
          points={num(v, 'points', 320)}
          rpm={num(v, 'rpm', 3)}
          tilt={num(v, 'tilt', 0.6)}
          colors={list(v, 'colors', ORBIT_RINGS_TOKENS)}
        />,
      ),
  },
  'loader/ring-spinner': {
    height: 'o-h-64',
    lead: 'Une piste et un arc sur le même élément : montez l’épaisseur, le filet devient une piece d’interface.',
    render: (v, frame) => (
      <Stage>
        <RingSpinner
          size={num(v, 'size', 40)}
          thickness={num(v, 'thickness', 4)}
          speed={num(v, 'speed', 900)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/dual-ring': {
    height: 'o-h-64',
    lead: 'Deux arcs par anneau, même vitesse, sens contraires : les croisements tombent toujours au même endroit.',
    render: (v, frame) => (
      <Stage>
        <DualRing
          size={num(v, 'size', 48)}
          thickness={num(v, 'thickness', 3)}
          speed={num(v, 'speed', 1200)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/arc-trio': {
    height: 'o-h-64',
    lead: 'Trois arcs sur un seul cercle, a trois vitesses : ils se rattrapent, se recouvrent, se separent.',
    render: (v, frame) => (
      <Stage>
        <ArcTrio
          size={num(v, 'size', 48)}
          thickness={num(v, 'thickness', 4)}
          speed={num(v, 'speed', 1400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/dash-ring': {
    height: 'o-h-64',
    lead: 'Rien ne tourne : le tirete glisse le long du cercle, comme une chaîne.',
    render: (v, frame) => (
      <Stage>
        <DashRing
          size={num(v, 'size', 48)}
          thickness={num(v, 'thickness', 4)}
          dashes={num(v, 'dashes', 12)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/gradient-ring': {
    height: 'o-h-64',
    lead: 'Un dégradé conique masque en anneau : la couleur s’éteint sur tout le tour, la tête ronde ferme la couture.',
    render: (v, frame) => (
      <Stage>
        <GradientRing
          size={num(v, 'size', 48)}
          thickness={num(v, 'thickness', 6)}
          speed={num(v, 'speed', 1000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/comet-ring': {
    height: 'o-h-64',
    lead: 'Une tête et cinq arcs empiles derrière elle : allongez la traînée, elle s’efface sur presque tout le tour.',
    render: (v, frame) => (
      <Stage>
        <CometRing
          size={num(v, 'size', 48)}
          thickness={num(v, 'thickness', 3)}
          tail={num(v, 'tail', 150)}
          speed={num(v, 'speed', 1100)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/segment-ring': {
    height: 'o-h-64',
    lead: 'Les segments ne bougent pas : chacun s’allume d’un coup et s’éteint lentement, le front fait le tour.',
    render: (v, frame) => (
      <Stage>
        <SegmentRing
          size={num(v, 'size', 48)}
          thickness={num(v, 'thickness', 5)}
          segments={num(v, 'segments', 8)}
          speed={num(v, 'speed', 1200)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/gauge': {
    height: 'o-h-64',
    lead: 'Un cadran gradue ouvert en bas : glissez la valeur, ou cochez « indeterminate » pour le voir balayer sans chiffre.',
    render: (v, frame) => (
      <Stage>
        <Gauge
          value={num(v, 'value', 64)}
          indeterminate={v['indeterminate'] === true}
          size={num(v, 'size', 96)}
          thickness={num(v, 'thickness', 8)}
          speed={num(v, 'speed', 1600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/percent-ring': {
    height: 'o-h-64',
    lead: 'L’anneau se remplit depuis le sommet et dit son pourcentage ; en indetermine, l’arc tourne et le centre reste vide.',
    render: (v, frame) => (
      <Stage>
        <PercentRing
          value={num(v, 'value', 42)}
          indeterminate={v['indeterminate'] === true}
          size={num(v, 'size', 80)}
          thickness={num(v, 'thickness', 5)}
          speed={num(v, 'speed', 1000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/ring-dots': {
    height: 'o-h-64',
    lead: 'Les points ne bougent pas, seul leur éclat tourne : une traînée de fondus fait le tour de la couronne.',
    render: (v, frame) => (
      <Stage>
        <RingDots
          size={num(v, 'size', 40)}
          dot={num(v, 'dot', 6)}
          count={num(v, 'count', 8)}
          speed={num(v, 'speed', 1000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/pulse-dot': {
    height: 'o-h-64',
    lead: 'Un point fixe, deux ondes a une demi-période d’écart : il y en a toujours une en route.',
    render: (v, frame) => (
      <Stage>
        <PulseDot
          size={num(v, 'size', 32)}
          speed={num(v, 'speed', 1400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/bouncing-dots': {
    height: 'o-h-64',
    lead: 'Montée en ease-out, chute en ease-in, pause au sol : un saut, pas une vague.',
    render: (v, frame) => (
      <Stage>
        <BouncingDots
          size={num(v, 'size', 10)}
          speed={num(v, 'speed', 800)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/chasing-dots': {
    height: 'o-h-64',
    lead: 'Un seul plateau tourne, quatre points poses dessus : la poursuite est un placement.',
    render: (v, frame) => (
      <Stage>
        <ChasingDots
          size={num(v, 'size', 40)}
          speed={num(v, 'speed', 1000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/grid-fade': {
    height: 'o-h-64',
    lead: 'Trois anneaux, trois delais : l’onde part du centre et atteint les coins en dernier.',
    render: (v, frame) => (
      <Stage>
        <GridFade
          size={num(v, 'size', 8)}
          speed={num(v, 'speed', 1200)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/grid-wave': {
    height: 'o-h-64',
    lead: 'Sept fronts diagonaux pour seize points : une crete qui traverse la grille en biais.',
    render: (v, frame) => (
      <Stage>
        <GridWave
          size={num(v, 'size', 6)}
          speed={num(v, 'speed', 1400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/spiral-dots': {
    height: 'o-h-64',
    lead: 'Quatorze points sur une spirale d’Archimede, un signal qui court du centre vers le bord.',
    render: (v, frame) => (
      <Stage>
        <SpiralDots
          size={num(v, 'size', 48)}
          speed={num(v, 'speed', 1600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/dots-orbit': {
    height: 'o-h-64',
    lead: 'Trois orbites tracees, trois périodes qui ne se referment pas : plus loin, plus lent.',
    render: (v, frame) => (
      <Stage>
        <DotsOrbit
          size={num(v, 'size', 48)}
          speed={num(v, 'speed', 1000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/newton-cradle': {
    height: 'o-h-64',
    lead: 'Deux billes bougent, trois transmettent le choc : le pendule reel, en deux animations.',
    render: (v, frame) => (
      <Stage>
        <NewtonCradle
          size={num(v, 'size', 10)}
          speed={num(v, 'speed', 1400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/snake': {
    height: 'o-h-64',
    lead: 'Rien ne se déplace : seize cases fixes, chacune allumee un quart de cycle a son rang du zigzag.',
    render: (v, frame) => (
      <Stage>
        <Snake
          size={num(v, 'size', 7)}
          speed={num(v, 'speed', 1600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/flower-petals': {
    height: 'o-h-64',
    lead: 'Huit petales poussent depuis leur base, tiennent, se referment d’un coup.',
    render: (v, frame) => (
      <Stage>
        <FlowerPetals
          size={num(v, 'size', 48)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'ui/spotlight-card': {
    height: 'o-h-80',
    lead: 'La lumière se repand sur la surface et l’anneau n’en est que le bord ; le retard du halo est ce qui la fait lire comme une lampe.',
    render: (v, frame) => (
      <Stage>
        <div className="o-grid o-w-full o-max-w-lg o-grid-cols-2 o-gap-6 o-text-left o-text-zinc-900 dark:o-text-zinc-50">
          {[
            ['Deploiement', 'Trois environnements, une seule commande.'],
            ['Journal', 'Chaque version, datee et relue.'],
          ].map(([titre, corps]) => (
            <SpotlightCard
              key={titre}
              radius={num(v, 'radius', 260)}
              strength={num(v, 'strength', 0.35)}
              speed={num(v, 'speed', 8)}
              className="o-p-6"
              style={{ borderRadius: `${String(frame.radius)}px` }}
            >
              <h4 className="o-text-lg o-font-semibold">{titre}</h4>
              <p className="o-mt-2 o-text-sm o-opacity-70">{corps}</p>
            </SpotlightCard>
          ))}
        </div>
      </Stage>
    ),
  },
  'ui/pixel-card': {
    height: 'o-h-80',
    lead: 'Les cellules du bord partent en premier, le hasard casse le front : le bord ronge, il n’avance pas en ligne droite.',
    render: (v, frame) => (
      <Stage>
        <div className="o-grid o-w-full o-max-w-lg o-grid-cols-2 o-gap-6 o-text-left o-text-zinc-900 dark:o-text-zinc-50">
          {[
            ['Archives', 'Douze mille fiches, indexees la nuit.'],
            ['Sauvegarde', 'Toutes les heures, sur deux sites.'],
          ].map(([titre, corps]) => (
            <PixelCard
              key={titre}
              size={num(v, 'size', 8)}
              depth={num(v, 'depth', 56)}
              duration={num(v, 'duration', 600)}
              className="o-p-6"
              style={{ borderRadius: `${String(frame.radius)}px` }}
            >
              <h4 className="o-text-lg o-font-semibold">{titre}</h4>
              <p className="o-mt-2 o-text-sm o-opacity-70">{corps}</p>
            </PixelCard>
          ))}
        </div>
      </Stage>
    ),
  },
  'ui/profile-card': {
    height: 'o-h-80',
    lead: 'Le portrait est un cran devant la carte : en pivotant, il se décale du texte, et la carte prend de l’épaisseur.',
    render: (v, frame) => (
      <Stage>
        <ProfileCard
          name="Lea Marchand"
          subtitle="Designer produit"
          avatar="LM"
          tilt={num(v, 'tilt', 10)}
          speed={num(v, 'speed', 8)}
          sheen={num(v, 'sheen', 0.35)}
          className="o-w-72 o-text-zinc-900 dark:o-text-zinc-50"
          style={{ borderRadius: `${String(frame.radius)}px` }}
        >
          <div className="o-p-6 o-text-left">
            <p className="o-text-sm o-opacity-70">
              Dessine les parcours, les tient a jour, et relit chaque fiche du registre.
            </p>
            <div className="o-mt-4 o-flex o-flex-wrap o-gap-2 o-text-xs">
              {['Parcours', 'Maquettes', 'Relecture'].map((tag) => (
                <span
                  key={tag}
                  className="o-rounded-md o-px-2 o-py-1"
                  style={{ backgroundColor: 'color-mix(in oklab, currentColor 10%, transparent)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </ProfileCard>
      </Stage>
    ),
  },
  'ui/reflective-card': {
    height: 'o-h-80',
    lead: 'Un metal renvoie une lumière qui vient d’une direction : tout l’effet tient en un angle, qui oriente l’anneau, la bande et le brossage.',
    render: (v, frame) => (
      <Stage>
        <ReflectiveCard
          speed={num(v, 'speed', 6)}
          shine={num(v, 'shine', 0.12)}
          brush={num(v, 'brush', 0.06)}
          className="o-w-72 o-p-6 o-text-left o-text-zinc-900 dark:o-text-zinc-50"
          style={{ borderRadius: `${String(frame.radius)}px` }}
        >
          <p className="o-text-xs o-uppercase o-tracking-wider o-opacity-60">Abonnes</p>
          <p className="o-mt-2 o-text-2xl o-font-semibold o-tabular-nums">4 812</p>
          <p className="o-mt-2 o-text-sm o-opacity-70">Tournez autour de la carte avec le pointeur.</p>
        </ReflectiveCard>
      </Stage>
    ),
  },
  'ui/decay-card': {
    height: 'o-h-96',
    lead: 'La distorsion suit la vitesse du geste, pas sa position : un passage lent effleure l’image, un passage vif la dechire.',
    render: (v, frame) => (
      <Stage>
        <DecayCard
          src={SAMPLE}
          alt="Planche de démonstration"
          ratio={num(v, 'ratio', 1.5)}
          strength={num(v, 'strength', 48)}
          speed={num(v, 'speed', 5)}
          grain={num(v, 'grain', 0.012)}
          className="o-w-72 o-text-left o-text-zinc-900 dark:o-text-zinc-50"
          style={{ borderRadius: `${String(frame.radius)}px` }}
        >
          <div className="o-p-4">
            <p className="o-text-sm o-font-semibold">Planche douze</p>
            <p className="o-mt-1 o-text-xs o-opacity-70">Traversez l’image d’un geste vif.</p>
          </div>
        </DecayCard>
      </Stage>
    ),
  },
  'ui/bounce-cards': {
    height: 'o-h-96',
    lead: 'L’eventail est l’état de repos ; c’est l’arrivee qui rebondit, et les voisines s’écartent pour la carte survolee.',
    render: (v, frame) => (
      <Stage>
        <BounceCards
          spread={num(v, 'spread', 6)}
          gap={num(v, 'gap', 56)}
          delay={num(v, 'delay', 90)}
          className="o-text-zinc-900 dark:o-text-zinc-50"
        >
          {[
            ['Lundi', 'Relire la fiche'],
            ['Mardi', 'Poser les tokens'],
            ['Mercredi', 'Tester au clavier'],
            ['Jeudi', 'Publier le lot'],
          ].map(([jour, tache]) => (
            <article
              key={jour}
              className="o-w-40 o-border-w-1 o-p-4 o-text-left o-bg-zinc-50 dark:o-bg-zinc-950"
              style={{
                borderRadius: `${String(frame.radius)}px`,
                borderColor: 'color-mix(in oklab, currentColor 20%, transparent)',
              }}
            >
              <p className="o-text-xs o-uppercase o-tracking-wider o-opacity-60">{jour}</p>
              <p className="o-mt-2 o-text-sm">{tache}</p>
            </article>
          ))}
        </BounceCards>
      </Stage>
    ),
  },
  'ui/card-swap': {
    height: 'o-h-80',
    lead: 'Le rang est un état, la position en decoule : la carte de devant fait un saut hors de la pile et remonte a l’arriere.',
    render: (v, frame) => (
      <Stage>
        <CardSwap
          interval={num(v, 'interval', 3000)}
          duration={num(v, 'duration', 700)}
          offset={num(v, 'offset', 16)}
          className="o-text-zinc-900 dark:o-text-zinc-50"
        >
          {[
            ['Fiabilite', 'Chaque entree est validee avant publication.'],
            ['Legerete', 'Aucune couleur en dur, aucun rendu par image.'],
            ['Theme', 'Surface et filet suivent le clair et le sombre.'],
          ].map(([titre, corps]) => (
            <article
              key={titre}
              className="o-w-64 o-border-w-1 o-p-6 o-text-left o-bg-zinc-50 dark:o-bg-zinc-950"
              style={{
                borderRadius: `${String(frame.radius)}px`,
                borderColor: 'color-mix(in oklab, currentColor 20%, transparent)',
              }}
            >
              <p className="o-text-lg o-font-semibold">{titre}</p>
              <p className="o-mt-2 o-text-sm o-opacity-70">{corps}</p>
            </article>
          ))}
        </CardSwap>
      </Stage>
    ),
  },
  'ui/chroma-grid': {
    height: 'o-h-96',
    lead: 'Les cartes gardent leurs teintes ; c’est un voile qui les desature, et le pointeur y perce un trou amorti.',
    render: (v, frame) => (
      <Stage>
        <ChromaGrid
          columns={num(v, 'columns', 3)}
          colors={list(v, 'colors', CHROMA_TOKENS)}
          radius={num(v, 'radius', 220)}
          speed={num(v, 'speed', 6)}
          className="o-w-full o-max-w-2xl o-text-left o-text-zinc-900 dark:o-text-zinc-50"
          style={{ '--o-chroma-radius': `${String(frame.radius)}px` } as CSSProperties}
        >
          {[
            ['Fonds', '96 entrees'],
            ['Chargeurs', '24 entrees'],
            ['Interface', '27 entrees'],
            ['Textes', '18 entrees'],
            ['Sections', '12 entrees'],
            ['Images', '11 entrees'],
          ].map(([titre, compte]) => (
            <div key={titre} className="o-p-5">
              <p className="o-text-xs o-uppercase o-tracking-wider o-opacity-60">{titre}</p>
              <p className="o-mt-2 o-text-lg o-font-semibold o-tabular-nums">{compte}</p>
            </div>
          ))}
        </ChromaGrid>
      </Stage>
    ),
  },
  'background/line-waves': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Un trait fin par bande, la même houle pour toutes : le dephasage entre lignes dessine une nappe diagonale qui glisse de gauche à droite.',
    render: (v) =>
      fill(
        <LineWaves
          className="o-size-full"
          colors={list(v, 'colors', LINE_WAVES_TOKENS)}
          count={num(v, 'count', 24)}
          amplitude={num(v, 'amplitude', 0.6)}
          speed={num(v, 'speed', 0.4)}
          thickness={num(v, 'thickness', 0.0025)}
        />,
      ),
  },
  'background/sliced-waves': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Une bande épaisse lue par colonnes : la hauteur saute de marche en marche, et chaque tranche bat a son propre rythme.',
    render: (v) =>
      fill(
        <SlicedWaves
          className="o-size-full"
          colors={list(v, 'colors', SLICED_WAVES_TOKENS)}
          slices={num(v, 'slices', 40)}
          amplitude={num(v, 'amplitude', 0.22)}
          speed={num(v, 'speed', 0.9)}
          height={num(v, 'height', 0.28)}
        />,
      ),
  },
  'background/floating-lines': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Des segments diagonaux de longueur finie, qui dérivent très lentement : le croisement de deux halos fait l’événement, pas le mouvement.',
    render: (v) =>
      fill(
        <FloatingLines
          className="o-size-full"
          colors={list(v, 'colors', FLOATING_LINES_TOKENS)}
          count={num(v, 'count', 7)}
          speed={num(v, 'speed', 0.3)}
          length={num(v, 'length', 0.6)}
          glow={num(v, 'glow', 0.03)}
        />,
      ),
  },
  'background/web-threads': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. Deplacez le curseur : les points a portée sont repousses et les fils s’eclairent.',
    },
    lead: 'Une toile de segments dont seuls les sommets bougent ; le pointeur repousse les points a portée et fait vibrer les fils.',
    render: (v) =>
      fill(
        <WebThreads
          className="o-size-full"
          colors={list(v, 'colors', WEB_THREADS_TOKENS)}
          points={num(v, 'points', 80)}
          radius={num(v, 'radius', 1.1)}
          vibration={num(v, 'vibration', 0.4)}
          reach={num(v, 'reach', 1.4)}
        />,
      ),
  },
  'background/strands': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Des brins ancres en bas : la racine tient, la pointe suit le courant avec retard.',
    render: (v) =>
      fill(
        <Strands
          className="o-size-full"
          colors={list(v, 'colors', STRANDS_TOKENS)}
          count={num(v, 'count', 18)}
          sway={num(v, 'sway', 0.7)}
          speed={num(v, 'speed', 0.6)}
          thickness={num(v, 'thickness', 0.006)}
        />,
      ),
  },
  'background/sine-grid': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Chaque nœud décrit une petite boucle ; la seconde grille, tournee de quelques degres, pose un moire dont les franges glissent bien plus lentement.',
    render: (v) =>
      fill(
        <SineGrid
          className="o-size-full"
          colors={list(v, 'colors', SINE_GRID_TOKENS)}
          cells={num(v, 'cells', 12)}
          amplitude={num(v, 'amplitude', 0.18)}
          speed={num(v, 'speed', 0.8)}
          moire={num(v, 'moire', 0.6)}
        />,
      ),
  },
  'background/audio-bars': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Aucun son n’est écoute : un bruit lisse par barre, une enveloppe qui favorise les graves, un indicateur de crete qui retombe.',
    render: (v) =>
      fill(
        <AudioBars
          className="o-size-full"
          colors={list(v, 'colors', AUDIO_BARS_TOKENS)}
          bars={num(v, 'bars', 48)}
          speed={num(v, 'speed', 1)}
          gap={num(v, 'gap', 0.35)}
          segments={num(v, 'segments', 24)}
          mirror={v['mirror'] === true}
        />,
      ),
  },
  'background/oscilloscope': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Le spot balaie de gauche à droite ; le signal est fige par balayage et le phosphore s’éteint derrière lui.',
    render: (v) =>
      fill(
        <Oscilloscope
          className="o-size-full"
          colors={list(v, 'colors', OSCILLOSCOPE_TOKENS)}
          speed={num(v, 'speed', 0.5)}
          decay={num(v, 'decay', 1.2)}
          frequency={num(v, 'frequency', 3)}
          amplitude={num(v, 'amplitude', 0.28)}
        />,
      ),
  },
  'background/seismograph': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'aucun',
    lead: 'Cliquez dans le cadre : chaque appui pose un stylet et écrit une secousse amortie qui s’eloigne avec le papier, plus forte sur les traces a sa hauteur.',
    render: (v) =>
      fill(
        <Seismograph
          className="o-size-full"
          colors={list(v, 'colors', SEISMOGRAPH_TOKENS)}
          traces={num(v, 'traces', 5)}
          scroll={num(v, 'scroll', 0.12)}
          decay={num(v, 'decay', 1.5)}
          amplitude={num(v, 'amplitude', 1)}
        />,
      ),
  },
  'background/sonar': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deplacez le curseur : les impulsions partent du pointeur amorti, front raide vers l’exterieur, traine sombre vers l’intérieur.',
    render: (v) =>
      fill(
        <Sonar
          className="o-size-full"
          colors={list(v, 'colors', SONAR_TOKENS)}
          speed={num(v, 'speed', 0.8)}
          spacing={num(v, 'spacing', 6)}
          fade={num(v, 'fade', 1.6)}
        />,
      ),
  },
  'background/metaballs': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deplacez le curseur : une boule le suit et fusionne avec celles qu’elle croise ; le reflet vient du gradient du champ.',
    render: (v) =>
      fill(
        <Metaballs
          className="o-size-full"
          colors={list(v, 'colors', METABALLS_TOKENS)}
          speed={num(v, 'speed', 0.3)}
          count={num(v, 'count', 7)}
          threshold={num(v, 'threshold', 1)}
          gloss={num(v, 'gloss', 0.7)}
        />,
      ),
  },
  'background/lava-lamp': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Des gouttes etirees qui montent de la réserve et redescendent ; chacune prend sa couleur de sa hauteur.',
    render: (v) =>
      fill(
        <LavaLamp
          className="o-size-full"
          colors={list(v, 'colors', LAVA_LAMP_TOKENS)}
          speed={num(v, 'speed', 0.08)}
          drops={num(v, 'drops', 5)}
          stretch={num(v, 'stretch', 1.6)}
          glow={num(v, 'glow', 0.5)}
        />,
      ),
  },
  'background/blob-morph': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Une seule forme qui respire, trois harmoniques impaires pour le contour, une frange de bruit au bord.',
    render: (v) =>
      fill(
        <BlobMorph
          className="o-size-full"
          colors={list(v, 'colors', BLOB_MORPH_TOKENS)}
          size={num(v, 'size', 0.28)}
          speed={num(v, 'speed', 0.4)}
          wobble={num(v, 'wobble', 0.35)}
          fringe={num(v, 'fringe', 0.5)}
        />,
      ),
  },
  'background/soap-film': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'La teinte tourne avec l’épaisseur du film, les franges glissent vers le bas, et le fond apparaît là où le film s’amincit.',
    render: (v) =>
      fill(
        <SoapFilm
          className="o-size-full"
          colors={list(v, 'colors', SOAP_FILM_TOKENS)}
          speed={num(v, 'speed', 0.15)}
          drain={num(v, 'drain', 0.4)}
          scale={num(v, 'scale', 1.5)}
          bands={num(v, 'bands', 4)}
        />,
      ),
  },
  'background/liquid-ether': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deplacez le curseur : chaque geste depose un tourbillon date qui pousse la vapeur et y laisse une trace claire.',
    render: (v) =>
      fill(
        <LiquidEther
          className="o-size-full"
          colors={list(v, 'colors', LIQUID_ETHER_TOKENS)}
          speed={num(v, 'speed', 0.1)}
          radius={num(v, 'radius', 0.22)}
          strength={num(v, 'strength', 0.8)}
          life={num(v, 'life', 2.5)}
        />,
      ),
  },
  'background/watercolor': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Des taches qui s’etalent sur le papier, se chargent de pigment au bord en sechant, puis s’effacent.',
    render: (v) =>
      fill(
        <Watercolor
          className="o-size-full"
          colors={list(v, 'colors', WATERCOLOR_TOKENS)}
          speed={num(v, 'speed', 0.25)}
          blots={num(v, 'blots', 6)}
          bleed={num(v, 'bleed', 0.5)}
          grain={num(v, 'grain', 0.3)}
        />,
      ),
  },
  'background/marble': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Trois bruits enchaines, chacun deformant le domaine du suivant ; les veines sont les zeros d’un sinus du résultat.',
    render: (v) =>
      fill(
        <Marble
          className="o-size-full"
          colors={list(v, 'colors', MARBLE_TOKENS)}
          speed={num(v, 'speed', 0.03)}
          scale={num(v, 'scale', 1.2)}
          veins={num(v, 'veins', 0.6)}
          octaves={num(v, 'octaves', 4)}
        />,
      ),
  },
  'background/oil-slick': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Des franges serrees enroulees par un bruit tordu, decoupees en lobes sur une eau sombre qui ondule.',
    render: (v) =>
      fill(
        <OilSlick
          className="o-size-full"
          colors={list(v, 'colors', OIL_SLICK_TOKENS)}
          speed={num(v, 'speed', 0.12)}
          scale={num(v, 'scale', 2.2)}
          fringes={num(v, 'fringes', 6)}
          ripple={num(v, 'ripple', 0.3)}
        />,
      ),
  },
  'background/ferrofluid': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deplacez le curseur : la flaque le suit et ses pics s’aiguisent sous l’aimant, eclaires par le gradient du relief.',
    render: (v) =>
      fill(
        <Ferrofluid
          className="o-size-full"
          colors={list(v, 'colors', FERROFLUID_TOKENS)}
          spikes={num(v, 'spikes', 14)}
          reach={num(v, 'reach', 0.35)}
          height={num(v, 'height', 0.8)}
          gloss={num(v, 'gloss', 0.7)}
        />,
      ),
  },
  'background/ballpit': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Des balles qui tombent et rebondissent, que le curseur écarte ; un seul maillage instancie, des chocs par paires.',
    render: (v) =>
      fill(
        <Ballpit
          className="o-size-full"
          colors={list(v, 'colors', BALLPIT_TOKENS)}
          count={num(v, 'count', 80)}
          size={num(v, 'size', 0.32)}
          gravity={num(v, 'gravity', 6)}
          bounce={num(v, 'bounce', 0.55)}
          push={num(v, 'push', 8)}
        />,
      ),
  },
  'loader/cube-flip': {
    height: 'o-h-64',
    lead: 'Quatre bascules en aller-retour, une pause entre chaque : la dernière image du cycle est la première, la boucle est invisible.',
    render: (v, frame) => (
      <Stage>
        <CubeFlip
          size={num(v, 'size', 32)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/cube-fold': {
    height: 'o-h-64',
    lead: 'Un patron en croix dont les volets se relevent un a un sur leur charniere, ferment la boîte, puis se rabattent.',
    render: (v, frame) => (
      <Stage>
        <CubeFold
          size={num(v, 'size', 20)}
          speed={num(v, 'speed', 2600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/square-morph': {
    height: 'o-h-64',
    lead: 'Le carre devient rond a mi-tour et retrouve ses angles en finissant : la rotation ne s’arrête jamais, seuls les angles vont et viennent.',
    render: (v, frame) => (
      <Stage>
        <SquareMorph
          size={num(v, 'size', 32)}
          speed={num(v, 'speed', 1800)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/shape-morph': {
    height: 'o-h-64',
    lead: 'Rond, carre, triangle : un seul chemin de quatre courbes que le navigateur interpole, avec un palier sur chaque forme.',
    render: (v, frame) => (
      <Stage>
        <ShapeMorph
          size={num(v, 'size', 40)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/hex-spinner': {
    height: 'o-h-64',
    lead: 'Le cadre tourne par crans d’un sixieme de tour, comme un ecrou qu’on visse ; le noyau se gonfle pendant les arrêts.',
    render: (v, frame) => (
      <Stage>
        <HexSpinner
          size={num(v, 'size', 44)}
          thickness={num(v, 'thickness', 3)}
          speed={num(v, 'speed', 1600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/triangle-spinner': {
    height: 'o-h-64',
    lead: 'Rien ne tourne : un tiret long comme le perimetre se dessine depuis le sommet, puis s’efface par le même sommet.',
    render: (v, frame) => (
      <Stage>
        <TriangleSpinner
          size={num(v, 'size', 44)}
          thickness={num(v, 'thickness', 4)}
          speed={num(v, 'speed', 1800)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/polygon-morph': {
    height: 'o-h-64',
    lead: 'Du triangle a l’hexagone un côté à la fois, puis retour : soixante points par forme, pour que chaque sommet tombe juste.',
    render: (v, frame) => (
      <Stage>
        <PolygonMorph
          size={num(v, 'size', 44)}
          thickness={num(v, 'thickness', 3)}
          speed={num(v, 'speed', 3000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/pinwheel': {
    height: 'o-h-64',
    lead: 'Quatre pales en deux nuances qui tournent par rafales : un elan et un ralenti par demi-tour, comme sous le vent.',
    render: (v, frame) => (
      <Stage>
        <Pinwheel
          size={num(v, 'size', 40)}
          speed={num(v, 'speed', 1600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/fan-blades': {
    height: 'o-h-64',
    lead: 'Des pales en faucille a vitesse constante dans leur carter : changez le nombre de pales, le dessin reste le même, tourne.',
    render: (v, frame) => (
      <Stage>
        <FanBlades
          size={num(v, 'size', 48)}
          blades={num(v, 'blades', 3)}
          speed={num(v, 'speed', 1400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/gear-pair': {
    height: 'o-h-64',
    lead: 'Douze dents contre huit : le petit tourne une fois et demie plus vite, en sens inverse, et les dents restent engrenees.',
    render: (v, frame) => (
      <Stage>
        <GearPair
          size={num(v, 'size', 56)}
          speed={num(v, 'speed', 3000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/wave-bars': {
    height: 'o-h-64',
    lead: 'Cinq barres etirees depuis leur centre, un cinquieme de cycle d’écart : une onde qui traverse la rangee.',
    render: (v, frame) => (
      <Stage>
        <WaveBars
          size={num(v, 'size', 4)}
          speed={num(v, 'speed', 1000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/equalizer': {
    height: 'o-h-64',
    lead: 'Six partitions, six durées sans rapport simple : les barres dansent sans jamais former de motif.',
    render: (v, frame) => (
      <Stage>
        <Equalizer
          size={num(v, 'size', 5)}
          speed={num(v, 'speed', 1200)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/bars-scale': {
    height: 'o-h-64',
    lead: 'Les barres poussent du sol l’une après l’autre, tiennent, puis retombent d’un coup.',
    render: (v, frame) => (
      <Stage>
        <BarsScale
          size={num(v, 'size', 5)}
          speed={num(v, 'speed', 1800)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/stairs': {
    height: 'o-h-64',
    lead: 'L’escalier est fixe ; seul le carre bouge, un saut par marche, puis il reparait en bas.',
    render: (v, frame) => (
      <Stage>
        <Stairs
          size={num(v, 'size', 8)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/bricks': {
    height: 'o-h-64',
    lead: 'Dix briques posees rangee par rangee, la rangee du milieu décalée d’une demi-brique : un mur qui se batit puis s’efface.',
    render: (v, frame) => (
      <Stage>
        <Bricks
          size={num(v, 'size', 6)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/blocks-stack': {
    height: 'o-h-64',
    lead: 'Quatre blocs tombent en colonne, la pile tient, puis bascule sur son coin et s’efface.',
    render: (v, frame) => (
      <Stage>
        <BlocksStack
          size={num(v, 'size', 10)}
          speed={num(v, 'speed', 2200)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/tetris': {
    height: 'o-h-64',
    lead: 'Un L, un J’et un carre tombent cran par cran, completent trois lignes qui clignotent et s’effacent.',
    render: (v, frame) => (
      <Stage>
        <Tetris
          size={num(v, 'size', 8)}
          speed={num(v, 'speed', 2600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/domino': {
    height: 'o-h-64',
    lead: 'Chaque domino pivote sur son arete au sol, en accelerant, et s’appuie sur le suivant ; la rangee se releve d’un bloc.',
    render: (v, frame) => (
      <Stage>
        <Domino
          size={num(v, 'size', 5)}
          speed={num(v, 'speed', 2000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/progress-bar': {
    height: 'o-h-64',
    lead: 'Une barre dans le flux, étiquette et valeur comprises ; indeterminee, un segment respire le long de la piste.',
    render: (v, frame) => (
      <Stage>
        <div className="o-w-64 o-text-left">
          <ProgressBar
            value={num(v, 'value', 42)}
            indeterminate={v['indeterminate'] === true}
            showLabel={v['showLabel'] !== false}
            height={num(v, 'height', 6)}
            speed={num(v, 'speed', 1600)}
            color={frame.color}
          />
        </div>
      </Stage>
    ),
  },
  'loader/progress-steps': {
    height: 'o-h-64',
    lead: 'La barre et les étapes lisent la même valeur : la première étape non franchie est en cours, et pulse.',
    render: (v, frame) => (
      <Stage>
        <div className="o-w-72">
          <ProgressSteps
            value={num(v, 'value', 40)}
            indeterminate={v['indeterminate'] === true}
            steps={num(v, 'steps', 4)}
            size={num(v, 'size', 28)}
            speed={num(v, 'speed', 1600)}
            color={frame.color}
          />
        </div>
      </Stage>
    ),
  },
  'ui/pill-nav': {
    height: 'o-h-64',
    lead: 'La pilule suit le lien vise, survol ou focus, et revient se poser sous la page courante : elle dit ou l’on va avant le clic.',
    render: () => (
      <Stage>
        <PillNav
          items={[
            { label: 'Accueil' },
            { label: 'Travaux' },
            { label: 'Studio' },
            { label: 'Journal' },
            { label: 'Contact' },
          ]}
          defaultActive={0}
          label="Principale"
          className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/gooey-nav': {
    height: 'o-h-64',
    lead: 'Un flou puis un seuil sur l’alpha : la pastille et ses gouttes deviennent une seule matière, qui se detache quand elle change de lien.',
    render: (v) => (
      <Stage>
        <GooeyNav
          items={[
            { label: 'Studio' },
            { label: 'Projets' },
            { label: 'Journal' },
            { label: 'Contact' },
          ]}
          defaultActive={1}
          colors={list(v, 'colors', GOOEY_TOKENS)}
          drops={num(v, 'drops', 10)}
          distance={num(v, 'distance', 48)}
          className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/bubble-menu': {
    height: 'o-h-80',
    lead: 'Chaque bulle connaît sa place sur l’arc et son tour : elles sortent une a une avec un léger depassement, et rentrent dans l’ordre inverse.',
    render: (v) => (
      <Stage>
        <BubbleMenu
          items={[
            { label: 'Accueil' },
            { label: 'Galerie' },
            { label: 'Ateliers' },
            { label: 'Contact' },
          ]}
          direction={str(v, 'direction', 'up') as 'up' | 'right' | 'down' | 'left'}
          radius={num(v, 'radius', 110)}
          spread={num(v, 'spread', 120)}
          stagger={num(v, 'stagger', 50)}
          active={0}
          className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/card-nav': {
    height: 'o-h-96',
    lead: 'La hauteur n’est jamais mesuree : une rangee de grille passe de zéro a une fraction, et les cartes montent dedans l’une après l’autre.',
    render: (v, frame) => (
      <Stage>
        <CardNav
          brand={<strong className="o-text-sm o-font-semibold">Atelier Nord</strong>}
          cta={<span className="o-text-xs o-opacity-70">Ouvert du mardi au samedi</span>}
          items={[
            { label: 'Travaux', description: 'Ce que nous avons livre.' },
            { label: 'Studio', description: 'Qui nous sommes, et comment.' },
            { label: 'Contact', description: 'Parlons de votre projet.' },
          ]}
          colors={list(v, 'colors', CARDNAV_TOKENS)}
          stagger={num(v, 'stagger', 60)}
          active={0}
          className="o-w-full o-max-w-xl o-text-left o-text-sm o-text-zinc-900 dark:o-text-zinc-50"
          style={{ borderRadius: `${String(frame.radius)}px` }}
        />
      </Stage>
    ),
  },
  'ui/staggered-menu': {
    height: 'o-h-96',
    lead: 'Un attribut, trois temps : les bandes balaient le cadre, le panneau les suit, les liens montent depuis un masque. Echap ferme, le focus revient au bouton.',
    render: (v) => (
      <Stage>
        <StaggeredMenu
          contained
          items={[
            { label: 'Accueil' },
            { label: 'Projets' },
            { label: 'Studio' },
            { label: 'Journal' },
            { label: 'Contact' },
          ]}
          colors={list(v, 'colors', STAGGERED_TOKENS)}
          side={str(v, 'side', 'right') as 'right' | 'left'}
          stagger={num(v, 'stagger', 70)}
          active={0}
          footer={<p className="o-text-xs o-opacity-60">Paris, Lyon, Nantes</p>}
          className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/flowing-menu': {
    height: 'o-h-96',
    lead: 'Le bord d’entrée est lu sur le geste : la bande inversee part du bord le plus proche du pointeur, et ressort par celui ou il s’en va.',
    render: (v) => (
      <Stage>
        <FlowingMenu
          items={[{ label: 'Cuisine' }, { label: 'Terrasse' }, { label: 'Cave' }]}
          speed={num(v, 'speed', 10)}
          repeat={num(v, 'repeat', 4)}
          active={0}
          className="o-w-full o-max-w-xl o-text-left o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/infinite-menu': {
    height: 'o-h-96',
    lead: 'Une roue, pas une liste qui boucle : molette pour changer de cran, glisser pour lancer, et la roue se cale toujours sur un lien.',
    render: (v) => (
      <Stage>
        <InfiniteMenu
          items={[
            { label: 'Expositions' },
            { label: 'Collections' },
            { label: 'Visites' },
            { label: 'Ateliers' },
            { label: 'Boutique' },
            { label: 'Billets' },
          ]}
          radius={num(v, 'radius', 140)}
          speed={num(v, 'speed', 8)}
          active={0}
          className="o-size-full o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/line-sidebar': {
    height: 'o-h-80',
    lead: 'Rien ne grossit : un trait s’allonge vers l’intérieur de la page, et le libelle apparaît a son bout. La colonne ne bouge pas d’un pixel.',
    render: (v) => (
      <Stage>
        <LineSidebar
          items={[
            { label: 'Intro' },
            { label: 'Méthode' },
            { label: 'Résultats' },
            { label: 'Limites' },
            { label: 'Suite' },
          ]}
          side={str(v, 'side', 'left') as 'left' | 'right'}
          extend={num(v, 'extend', 2.4)}
          reach={num(v, 'reach', 90)}
          speed={num(v, 'speed', 10)}
          active={1}
          className="o-text-left o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'background/cubes': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Une seule géométrie instanciee : la vague est resolue dans le shader de sommets, la boucle n’écrit qu’un temps.',
    render: (v) =>
      fill(
        <Cubes
          className="o-size-full"
          grid={num(v, 'grid', 18)}
          amplitude={num(v, 'amplitude', 0.8)}
          speed={num(v, 'speed', 0.8)}
          frequency={num(v, 'frequency', 0.9)}
          gap={num(v, 'gap', 0.2)}
          colors={list(v, 'colors', CUBES_TOKENS)}
        />,
      ),
  },
  'background/isometric-grid': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Trois faces a trois ombres font le relief ; les cubes s’allument chacun a son rythme, jamais les mêmes.',
    render: (v) =>
      fill(
        <IsometricGrid
          className="o-size-full"
          speed={num(v, 'speed', 0.5)}
          density={num(v, 'density', 7)}
          lit={num(v, 'lit', 0.25)}
          colors={list(v, 'colors', ISOMETRIC_GRID_TOKENS)}
        />,
      ),
  },
  'background/voronoi': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'L’arete est exacte, par les mediatrices : le trait garde la même largeur jusque dans les coins.',
    render: (v) =>
      fill(
        <Voronoi
          className="o-size-full"
          speed={num(v, 'speed', 0.4)}
          density={num(v, 'density', 5)}
          glow={num(v, 'glow', 0.08)}
          colors={list(v, 'colors', VORONOI_TOKENS)}
        />,
      ),
  },
  'background/truchet': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Chaque tuile pivote d’un quart de tour en cascade ; la couleur suit l’arc, et les courbes se recomposent.',
    render: (v) =>
      fill(
        <Truchet
          className="o-size-full"
          speed={num(v, 'speed', 0.35)}
          density={num(v, 'density', 8)}
          thickness={num(v, 'thickness', 0.09)}
          stagger={num(v, 'stagger', 0.12)}
          colors={list(v, 'colors', TRUCHET_TOKENS)}
        />,
      ),
  },
  'background/maze': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Un front diagonal redessine une cellule à la fois : le labyrinthe reste lisible pendant qu’il change.',
    render: (v) =>
      fill(
        <Maze
          className="o-size-full"
          period={num(v, 'period', 6)}
          density={num(v, 'density', 14)}
          thickness={num(v, 'thickness', 0.1)}
          colors={list(v, 'colors', MAZE_TOKENS)}
        />,
      ),
  },
  'background/shape-grid': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'formulaire',
    lead: 'Rond, carre ou triangle par cellule, chacun a sa vitesse et son sens : une collection, pas une trame.',
    render: (v) =>
      fill(
        <ShapeGrid
          className="o-size-full"
          speed={num(v, 'speed', 0.4)}
          density={num(v, 'density', 9)}
          size={num(v, 'size', 0.28)}
          colors={list(v, 'colors', SHAPE_GRID_TOKENS)}
        />,
      ),
  },
  'background/pixel-blast': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Cliquez dans le cadre : des pixels carres sautent de case en case et retombent. Une gerbe part toute seule.',
    render: (v) =>
      fill(
        <PixelBlast
          className="o-size-full"
          pixels={num(v, 'pixels', 40)}
          count={num(v, 'count', 24)}
          gravity={num(v, 'gravity', 0.5)}
          auto={num(v, 'auto', 2.2)}
          colors={list(v, 'colors', PIXEL_BLAST_TOKENS)}
        />,
      ),
  },
  'background/dither': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Trois teintes seulement : c’est la densité des points, pas leur couleur, qui fait le dégradé.',
    render: (v) =>
      fill(
        <Dither
          className="o-size-full"
          speed={num(v, 'speed', 0.3)}
          pixel={num(v, 'pixel', 4)}
          scale={num(v, 'scale', 2.2)}
          colors={list(v, 'colors', DITHER_TOKENS)}
        />,
      ),
  },
  'background/acid-squares': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Chaque carre tourne un peu plus vite que celui qui l’enferme ; les cellules voisines tournent a l’envers.',
    render: (v) =>
      fill(
        <AcidSquares
          className="o-size-full"
          speed={num(v, 'speed', 0.25)}
          rings={num(v, 'rings', 7)}
          density={num(v, 'density', 2)}
          twist={num(v, 'twist', 0.12)}
          colors={list(v, 'colors', ACID_SQUARES_TOKENS)}
        />,
      ),
  },
  'background/tiles-flip': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Deplacez le curseur : les tuiles proches se retournent en ondes et montrent leur dos, les lointaines restent a plat.',
    render: (v) =>
      fill(
        <TilesFlip
          className="o-size-full"
          speed={num(v, 'speed', 1)}
          density={num(v, 'density', 12)}
          radius={num(v, 'radius', 0.4)}
          colors={list(v, 'colors', TILES_FLIP_TOKENS)}
        />,
      ),
  },
  'background/grid-scan': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Une barre parcourt le quadrillage et sort du cadre avant de repartir ; chaque cellule franchie s’éteint a son rythme.',
    render: (v) =>
      fill(
        <GridScan
          className="o-size-full"
          colors={list(v, 'colors', GRID_SCAN_TOKENS)}
          cells={num(v, 'cells', 14)}
          speed={num(v, 'speed', 1)}
          trail={num(v, 'trail', 3)}
          vertical={v['vertical'] === true}
        />,
      ),
  },
  'background/grid-distortion': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deplacez le curseur : la lentille le suit avec retard, et les mailles se dilatent sous elle comme sous un verre.',
    render: (v) =>
      fill(
        <GridDistortion
          className="o-size-full"
          colors={list(v, 'colors', GRID_DISTORTION_TOKENS)}
          cells={num(v, 'cells', 16)}
          strength={num(v, 'strength', 0.55)}
          radius={num(v, 'radius', 0.3)}
        />,
      ),
  },
  'background/grid-motion': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Chaque rangee glisse dans son sens et a sa vitesse : deux rangees voisines ne s’alignent jamais.',
    render: (v) =>
      fill(
        <GridMotion
          className="o-size-full"
          colors={list(v, 'colors', GRID_MOTION_TOKENS)}
          rows={num(v, 'rows', 8)}
          speed={num(v, 'speed', 0.6)}
          gap={num(v, 'gap', 0.12)}
          accent={num(v, 'accent', 0.12)}
        />,
      ),
  },
  'background/hex-wave': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deplacez le curseur : les alveoles s’allument en cercles qui s’en eloignent, chacune d’un bloc.',
    render: (v) =>
      fill(
        <HexWave
          className="o-size-full"
          colors={list(v, 'colors', HEX_WAVE_TOKENS)}
          size={num(v, 'size', 9)}
          speed={num(v, 'speed', 0.6)}
          spacing={num(v, 'spacing', 3)}
          fade={num(v, 'fade', 2.5)}
        />,
      ),
  },
  'background/triangles': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Les facettes sont fixes ; c’est la lumière qui glisse dessus, et chacune y répond a sa manière.',
    render: (v) =>
      fill(
        <Triangles
          className="o-size-full"
          colors={list(v, 'colors', TRIANGLES_TOKENS)}
          size={num(v, 'size', 7)}
          speed={num(v, 'speed', 0.5)}
          contrast={num(v, 'contrast', 0.8)}
          tint={num(v, 'tint', 0.6)}
        />,
      ),
  },
  'background/terrain-wireframe': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Une nappe de segments dont seules les hauteurs changent : le bruit est lu a une profondeur décalée du temps, les cretes avancent, les sommets restent.',
    render: (v) =>
      fill(
        <TerrainWireframe
          className="o-size-full"
          colors={list(v, 'colors', TERRAIN_WIREFRAME_TOKENS)}
          columns={num(v, 'columns', 80)}
          speed={num(v, 'speed', 1.2)}
          height={num(v, 'height', 1.6)}
          valley={num(v, 'valley', 0.6)}
        />,
      ),
  },
  'background/city-blocks': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Un damier de blocs instancies en un seul appel de dessin ; la vague traverse en diagonale, celle que la camera regarde de face.',
    render: (v) =>
      fill(
        <CityBlocks
          className="o-size-full"
          colors={list(v, 'colors', CITY_BLOCKS_TOKENS)}
          size={num(v, 'size', 14)}
          speed={num(v, 'speed', 0.6)}
          height={num(v, 'height', 2.4)}
          gap={num(v, 'gap', 0.25)}
        />,
      ),
  },
  'background/wormhole': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Même perspective que le tunnel, rien d’autre en commun : les aretes s’enroulent avec la profondeur, le tout pivote, la teinte tourne.',
    render: (v) =>
      fill(
        <Wormhole
          className="o-size-full"
          colors={list(v, 'colors', WORMHOLE_TOKENS)}
          speed={num(v, 'speed', 0.5)}
          twist={num(v, 'twist', 1)}
          spin={num(v, 'spin', 0.3)}
          rings={num(v, 'rings', 8)}
        />,
      ),
  },
  'background/night-drive': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Un sol en z = 1/y, et une file bornee de lampadaires qui approchent lentement de loin puis filent en passant.',
    render: (v) =>
      fill(
        <NightDrive
          className="o-size-full"
          colors={list(v, 'colors', NIGHT_DRIVE_TOKENS)}
          speed={num(v, 'speed', 1)}
          width={num(v, 'width', 1)}
          lamps={num(v, 'lamps', 8)}
          height={num(v, 'height', 0.8)}
        />,
      ),
  },
  'background/led-wall': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'formulaire',
    lead: 'Le dégradé est echantillonne au centre de chaque pastille : une diode est d’une seule couleur, et c’est ce qui fait le mur.',
    render: (v) =>
      fill(
        <LedWall
          className="o-size-full"
          colors={list(v, 'colors', LED_WALL_TOKENS)}
          pixels={num(v, 'pixels', 32)}
          speed={num(v, 'speed', 0.4)}
          gap={num(v, 'gap', 0.25)}
          bloom={num(v, 'bloom', 0.5)}
        />,
      ),
  },
  'background/light-pillar': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Un cœur gaussien net dans un halo exponentiel sans fin : la largeur respire sur deux périodes, et des stries montent dans la colonne.',
    render: (v) =>
      fill(
        <LightPillar
          className="o-size-full"
          colors={list(v, 'colors', LIGHT_PILLAR_TOKENS)}
          x={num(v, 'x', 0.5)}
          width={num(v, 'width', 0.12)}
          breath={num(v, 'breath', 0.6)}
          glow={num(v, 'glow', 0.8)}
        />,
      ),
  },
  'background/prism': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Un faisceau entre par la gauche, traverse un prisme et ressort en eventail : la teinte tourne d’un token a l’autre, et un cosinus dessine les raies du spectre.',
    render: (v) =>
      fill(
        <Prism
          className="o-size-full"
          colors={list(v, 'colors', PRISM_TOKENS)}
          x={num(v, 'x', 0.42)}
          y={num(v, 'y', 0.5)}
          spread={num(v, 'spread', 0.6)}
          bands={num(v, 'bands', 6)}
          speed={num(v, 'speed', 0.5)}
        />,
      ),
  },
  'background/prismatic-burst': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Des rais qui tournent autour d’un foyer et changent de teinte sur le tour ; des anneaux partent du centre et relevent les rais qu’ils traversent.',
    render: (v) =>
      fill(
        <PrismaticBurst
          className="o-size-full"
          colors={list(v, 'colors', PRISMATIC_BURST_TOKENS)}
          x={num(v, 'x', 0.5)}
          y={num(v, 'y', 0.5)}
          spokes={num(v, 'spokes', 10)}
          speed={num(v, 'speed', 0.5)}
          burst={num(v, 'burst', 0.6)}
        />,
      ),
  },
  'background/iridescence': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Une nacre : la surface ondule doucement, la teinte tourne avec son inclinaison, et deux reflets se posent par addition sans jamais assombrir le fond.',
    render: (v) =>
      fill(
        <Iridescence
          className="o-size-full"
          colors={list(v, 'colors', IRIDESCENCE_TOKENS)}
          speed={num(v, 'speed', 0.3)}
          scale={num(v, 'scale', 1.4)}
          shimmer={num(v, 'shimmer', 0.7)}
          bands={num(v, 'bands', 2.5)}
        />,
      ),
  },
  'background/liquid-chrome': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Un liquide qui reflechit un studio : ciel clair, sol sombre, horizon dur. En thème clair le chrome se dessine en encre, en sombre il luit.',
    render: (v) =>
      fill(
        <LiquidChrome
          className="o-size-full"
          colors={list(v, 'colors', LIQUID_CHROME_TOKENS)}
          speed={num(v, 'speed', 0.35)}
          scale={num(v, 'scale', 1.6)}
          contrast={num(v, 'contrast', 0.8)}
          sheen={num(v, 'sheen', 0.5)}
        />,
      ),
  },
  'background/molten-metal': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Un bain de metal chaud : la croute est le fond lui-même, elle se fend en veines claires, et la coulee s’enroule en bruit a double déplacement de domaine.',
    render: (v) =>
      fill(
        <MoltenMetal
          className="o-size-full"
          colors={list(v, 'colors', MOLTEN_METAL_TOKENS)}
          speed={num(v, 'speed', 0.08)}
          scale={num(v, 'scale', 1.8)}
          heat={num(v, 'heat', 0.6)}
        />,
      ),
  },
  'background/gradient-blinds': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Des lamelles devant un dégradé : leur ouverture suit une vague qui traverse le store d’un bord a l’autre, inclinee par une seconde onde.',
    render: (v) =>
      fill(
        <GradientBlinds
          className="o-size-full"
          colors={list(v, 'colors', GRADIENT_BLINDS_TOKENS)}
          count={num(v, 'count', 14)}
          speed={num(v, 'speed', 0.5)}
          open={num(v, 'open', 0.55)}
          tilt={num(v, 'tilt', 0.3)}
        />,
      ),
  },
  'background/grainient': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Des taches de couleur qui dérivent très lentement ; le grain est dans le dégradé, pas sur l’image : les transitions se dissolvent en points et le fond nu reste intact.',
    render: (v) =>
      fill(
        <Grainient
          className="o-size-full"
          colors={list(v, 'colors', GRAINIENT_TOKENS)}
          speed={num(v, 'speed', 0.15)}
          grain={num(v, 'grain', 0.6)}
          scale={num(v, 'scale', 1.2)}
        />,
      ),
  },
  'background/gradient-waves': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Un dégradé répète en bandes, déplace par une houle a frequences non multiples : ni trait ni marche, des nappes qui glissent l’une sur l’autre.',
    render: (v) =>
      fill(
        <GradientWaves
          className="o-size-full"
          colors={list(v, 'colors', GRADIENT_WAVES_TOKENS)}
          bands={num(v, 'bands', 4)}
          amplitude={num(v, 'amplitude', 0.12)}
          speed={num(v, 'speed', 0.4)}
          softness={num(v, 'softness', 0.6)}
        />,
      ),
  },
  'background/color-bends': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'formulaire',
    lead: 'Des nappes epaisses, chacune dans son repère tourne, qui se plient et se croisent ; là où elles se recouvrent, l’excès de couverture devient un éclat.',
    render: (v) =>
      fill(
        <ColorBends
          className="o-size-full"
          colors={list(v, 'colors', COLOR_BENDS_TOKENS)}
          sheets={num(v, 'sheets', 3)}
          thickness={num(v, 'thickness', 0.16)}
          bend={num(v, 'bend', 0.7)}
          speed={num(v, 'speed', 0.3)}
        />,
      ),
  },
  'loader/loading-dots-text': {
    height: 'o-h-64',
    lead: 'Le mot reste, les points s’ajoutent un a un puis disparaissent ensemble : une phrase qui se complète, pas un signal qui bat.',
    render: (v, frame) => (
      <Stage>
        <LoadingDotsText
          size={num(v, 'size', 16)}
          speed={num(v, 'speed', 1600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/text-shimmer-loader': {
    height: 'o-h-64',
    lead: 'Le texte est éteint a un tiers de son encre ; la seule chose pleine est la bande qui le traverse.',
    render: (v, frame) => (
      <Stage>
        <TextShimmerLoader
          size={num(v, 'size', 16)}
          speed={num(v, 'speed', 1800)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/letters-bounce': {
    height: 'o-h-64',
    lead: 'Chaque lettre s’ecrase, saute et retombe a son tour, puis le mot entier se pose avant de repartir.',
    render: (v, frame) => (
      <Stage>
        <LettersBounce
          size={num(v, 'size', 18)}
          speed={num(v, 'speed', 2000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/word-flip': {
    height: 'o-h-64',
    lead: 'Les mots sont les faces d’un prisme qui tourne par crans : le courant bascule vers le bas, le suivant descend a sa place.',
    render: (v, frame) => (
      <Stage>
        <WordFlip
          size={num(v, 'size', 18)}
          speed={num(v, 'speed', 1400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/typing-cursor': {
    height: 'o-h-64',
    lead: 'Une largeur qui grandit par paliers, un palier par caractère, et un curseur qui est la bordure du même élément : pas une ligne de JavaScript.',
    render: (v, frame) => (
      <Stage>
        <TypingCursor
          size={num(v, 'size', 16)}
          speed={num(v, 'speed', 3200)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/percent-counter': {
    height: 'o-h-64',
    lead: 'Sans valeur, le compteur boucle et repasse par zéro : il ne pretend pas mesurer. Le chiffre est écrit dans le DOM, jamais dans l’état.',
    render: (v, frame) => (
      <Stage>
        <PercentCounter
          size={num(v, 'size', 16)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/matrix-digits': {
    height: 'o-h-64',
    lead: 'Tout défile, puis les cases se verrouillent de gauche à droite : c’est le front des verrous que l œil suit, comme une barre.',
    render: (v, frame) => (
      <Stage>
        <MatrixDigits
          digits={num(v, 'digits', 6)}
          size={num(v, 'size', 16)}
          speed={num(v, 'speed', 2600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/counter-roll-loader': {
    height: 'o-h-64',
    lead: 'Un cran puis un arrêt, dix fois par tour, chaque rouleau a sa phase : un compteur qui ne s’arrête jamais.',
    render: (v, frame) => (
      <Stage>
        <CounterRollLoader
          digits={num(v, 'digits', 3)}
          size={num(v, 'size', 16)}
          speed={num(v, 'speed', 2000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/scramble-loader': {
    height: 'o-h-64',
    lead: 'La résolution se fait dans un ordre tire au sort, et le mot net n’est qu’un palier : un caractère tremble, puis tout se rebrouille.',
    render: (v, frame) => (
      <Stage>
        <ScrambleLoader
          size={num(v, 'size', 16)}
          speed={num(v, 'speed', 2200)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/dot-matrix-text': {
    height: 'o-h-64',
    lead: 'Une grille de points 5x7 ou seuls les points du mot s’allument, de gauche à droite, par une seule animation dont le delai vient de la colonne.',
    render: (v, frame) => (
      <Stage>
        <DotMatrixText
          size={num(v, 'size', 4)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/bouncing-ball': {
    height: 'o-h-64',
    lead: 'Chute en accelerant, ecrasement au sol, remontee en ralentissant : l’ombre se resserre quand la balle est loin et s’etale au contact.',
    render: (v, frame) => (
      <Stage>
        <BouncingBall
          size={num(v, 'size', 12)}
          speed={num(v, 'speed', 800)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/juggling': {
    height: 'o-h-64',
    lead: 'Une douche a trois balles : passe basse et rapide d’une main a l’autre, grand arc au retour, et un temps de prise dans chaque main.',
    render: (v, frame) => (
      <Stage>
        <Juggling
          size={num(v, 'size', 10)}
          speed={num(v, 'speed', 1800)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/pendulum': {
    height: 'o-h-64',
    lead: 'Un sinus en deux moities, lent aux extremes et rapide a la verticale ; l’arc en pointille a le rayon de la tige, la masse le parcourt exactement.',
    render: (v, frame) => (
      <Stage>
        <Pendulum
          size={num(v, 'size', 12)}
          speed={num(v, 'speed', 1600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/hourglass': {
    height: 'o-h-64',
    lead: 'Le sable coule a debit constant, le retournement est un geste de main ; le tas du bas retourne est le sable du haut, la boucle se referme sans saut.',
    render: (v, frame) => (
      <Stage>
        <Hourglass
          size={num(v, 'size', 48)}
          speed={num(v, 'speed', 3000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/clock-hands': {
    height: 'o-h-64',
    lead: 'La grande aiguille saute douze crans par tour et tremble en se posant ; la petite prend un cran a chaque tour de la grande.',
    render: (v, frame) => (
      <Stage>
        <ClockHands
          size={num(v, 'size', 48)}
          speed={num(v, 'speed', 3000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/heartbeat': {
    height: 'o-h-64',
    lead: 'Deux contractions, la seconde plus courte, puis un repos plus long que les deux : un boum-boum, pas une lampe qui pulse. Une onde part a chaque battement.',
    render: (v, frame) => (
      <Stage>
        <Heartbeat
          size={num(v, 'size', 40)}
          speed={num(v, 'speed', 1200)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/dna-loader': {
    height: 'o-h-64',
    lead: 'Deux brins qui tournent l’un autour de l’autre : grand et plein devant, petit et pale derrière, et un barreau aussi long que leur écart.',
    render: (v, frame) => (
      <Stage>
        <DnaLoader
          size={num(v, 'size', 6)}
          pairs={num(v, 'pairs', 8)}
          speed={num(v, 'speed', 1600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/infinity-loop': {
    height: 'o-h-64',
    lead: 'Un tiret sur un huit d’une seule courbe : il freine au bout de chaque boucle et file au croisement, comme une bille sur un rail.',
    render: (v, frame) => (
      <Stage>
        <InfinityLoop
          size={num(v, 'size', 64)}
          thickness={num(v, 'thickness', 4)}
          speed={num(v, 'speed', 2000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/yin-yang': {
    height: 'o-h-64',
    lead: 'Une toupie relancee d’une chiquenaude : deux tours qui s’éteignent, un arrêt, et on recommence. La moitie claire est le fond, vu à travers.',
    render: (v, frame) => (
      <Stage>
        <YinYang
          size={num(v, 'size', 44)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/windmill': {
    height: 'o-h-64',
    lead: 'Un vent par rafales : les ailes prennent de l’elan, tiennent, puis manquent de s’arrêter avant la bouffee suivante. La tour ne bouge pas.',
    render: (v, frame) => (
      <Stage>
        <Windmill
          size={num(v, 'size', 56)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'ui/specular-button': {
    height: 'o-h-64',
    lead: 'La lumière est un point que la main déplace : le reflet se pose sous le curseur, et le bord s’éclaire du côté de la lumière.',
    render: (v) => (
      <Stage>
        <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-3">
          <SpecularButton
            colors={list(v, 'colors', SPECULAR_TOKENS)}
            size={num(v, 'size', 120)}
            strength={num(v, 'strength', 0.55)}
            lag={num(v, 'lag', 180)}
          >
            Commander
          </SpecularButton>
          <SpecularButton
            colors={list(v, 'colors', SPECULAR_TOKENS)}
            size={num(v, 'size', 120)}
            strength={num(v, 'strength', 0.55)}
            lag={num(v, 'lag', 180)}
            disabled
          >
            Rupture de stock
          </SpecularButton>
        </div>
      </Stage>
    ),
  },
  'ui/liquid-glass-button': {
    height: 'o-h-72',
    lead: 'Le fond se devine à travers le verre, flou et sature ; un reflet coule au survol, et la pression ecrase la pastille avant le retour elastique.',
    render: (v, frame) => (
      <Stage>
        <div
          className="o-flex o-w-full o-max-w-md o-flex-wrap o-items-center o-justify-center o-gap-4 o-bg-gradient-to-br o-from-brand-400 o-via-fuchsia-500 o-to-sky-500 o-px-8 o-py-10 o-text-zinc-50"
          style={{ borderRadius: `${String(frame.radius)}px` }}
        >
          <LiquidGlassButton
            colors={list(v, 'colors', LIQUID_GLASS_TOKENS)}
            blur={num(v, 'blur', 14)}
            tint={num(v, 'tint', 0.18)}
            spring={num(v, 'spring', 600)}
          >
            Reserver une place
          </LiquidGlassButton>
          <LiquidGlassButton
            colors={list(v, 'colors', LIQUID_GLASS_TOKENS)}
            blur={num(v, 'blur', 14)}
            tint={num(v, 'tint', 0.18)}
            spring={num(v, 'spring', 600)}
          >
            Programme
          </LiquidGlassButton>
        </div>
      </Stage>
    ),
  },
  'ui/text-fall-button': {
    height: 'o-h-64',
    lead: 'Chaque lettre porte son index dans une variable : la feuille en fait un retard, et le survol ne change qu’un selecteur.',
    render: (v) => (
      <Stage>
        <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-3">
          <TextFallButton
            duration={num(v, 'duration', 380)}
            stagger={num(v, 'stagger', 22)}
            accent={Boolean(v['accent'] ?? true)}
          >
            Telecharger
          </TextFallButton>
          <TextFallButton
            duration={num(v, 'duration', 380)}
            stagger={num(v, 'stagger', 22)}
            accent={Boolean(v['accent'] ?? true)}
          >
            Lire le journal
          </TextFallButton>
        </div>
      </Stage>
    ),
  },
  'ui/star-border': {
    height: 'o-h-72',
    lead: 'Deux étoiles en ligne droite, chacune sur son bord et dans son sens : une trajectoire, pas une orbite. Le contenu porte le fond, le cadre ne laisse voir que le filet.',
    render: (v, frame) => (
      <Stage>
        <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-6">
          <StarBorder
            color={str(v, 'color', '--o-palette-brand-400')}
            speed={num(v, 'speed', 6000)}
            thickness={num(v, 'thickness', 1)}
            glow={num(v, 'glow', 0.7)}
            className="o-rounded-full"
          >
            <button type="button" className="o-px-6 o-py-3 o-font-medium">
              Commencer
            </button>
          </StarBorder>
          <StarBorder
            color={str(v, 'color', '--o-palette-brand-400')}
            speed={num(v, 'speed', 6000)}
            thickness={num(v, 'thickness', 1)}
            glow={num(v, 'glow', 0.7)}
            style={{ borderRadius: `${String(frame.radius)}px` }}
          >
            <div className="o-p-5 o-text-left">
              <p className="o-text-xs o-uppercase o-tracking-wide o-opacity-50">Offre</p>
              <p className="o-mt-1 o-font-semibold">Atelier du samedi</p>
            </div>
          </StarBorder>
        </div>
      </Stage>
    ),
  },
  'ui/electric-border': {
    height: 'o-h-72',
    lead: 'Aucune turbulence : deux rangees de tirets irreguliers défilent en sens inverse sur un cœur continu, et le halo vacille par paliers.',
    render: (v) => (
      <Stage>
        <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-6">
          <ElectricBorder
            colors={list(v, 'colors', ELECTRIC_TOKENS)}
            thickness={num(v, 'thickness', 2)}
            radius={num(v, 'radius', 16)}
            speed={num(v, 'speed', 1400)}
            intensity={num(v, 'intensity', 0.8)}
          >
            <div className="o-p-6 o-text-left">
              <p className="o-text-xs o-uppercase o-tracking-wide o-opacity-50">Accès anticipe</p>
              <p className="o-mt-1 o-text-lg o-font-semibold">Version 2 en avant-première</p>
              <p className="o-mt-2 o-text-sm o-opacity-70">Trois semaines avant tout le monde.</p>
            </div>
          </ElectricBorder>
          <ElectricBorder
            colors={list(v, 'colors', ELECTRIC_TOKENS)}
            thickness={num(v, 'thickness', 2)}
            radius={num(v, 'radius', 16)}
            speed={num(v, 'speed', 1400)}
            intensity={num(v, 'intensity', 0.8)}
          >
            <button type="button" className="o-px-6 o-py-3 o-font-medium">
              Activer
            </button>
          </ElectricBorder>
        </div>
      </Stage>
    ),
  },
  'ui/button-group-input': {
    height: 'o-h-64',
    lead: 'Pas de formulaire imbrique : Entrée fait ce que le bouton fait, et la confirmation glisse dans le bouton sans qu’il change de largeur.',
    render: (v) => (
      <Stage>
        <ButtonGroupInput
          label="Adresse de courriel"
          type={str(v, 'type', 'email') as 'text' | 'email' | 'url' | 'search'}
          placeholder="vous@exemple.fr"
          buttonLabel={str(v, 'buttonLabel', "S'inscrire")}
          doneLabel={str(v, 'doneLabel', 'Inscrit')}
          hold={num(v, 'hold', 1800)}
          disabled={Boolean(v['disabled'] ?? false)}
          onSubmit={() => new Promise((resolve) => setTimeout(resolve, 600))}
          className="o-w-full o-max-w-sm o-text-sm o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/tag-input': {
    height: 'o-h-64',
    lead: 'Retour efface en deux temps : le premier arme la dernière étiquette, le second la retire. Écrire une lettre desarme.',
    render: (v) => (
      <Stage>
        <TagInput
          label="Mots-cles"
          defaultValue={['design', 'motion', 'accessibilite']}
          placeholder={str(v, 'placeholder', 'Ajouter...')}
          max={num(v, 'max', 8)}
          duplicates={Boolean(v['duplicates'] ?? false)}
          disabled={Boolean(v['disabled'] ?? false)}
          className="o-w-full o-max-w-sm o-text-left o-text-sm o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/segmented-control': {
    height: 'o-h-64',
    lead: 'Des boutons radio, pas des onglets : les fleches déplacent le choix lui-même. La glissiere est un relief dans un creux, et son trajet depasse un peu sa cible.',
    render: (v) => (
      <Stage>
        <div className="o-flex o-flex-col o-items-center o-gap-4">
          <SegmentedControl
            label="Période"
            options={[
              { value: 'jour', label: 'Jour' },
              { value: 'semaine', label: 'Semaine' },
              { value: 'mois', label: 'Mois' },
              { value: 'annee', label: 'Annee', disabled: true },
            ]}
            defaultValue="semaine"
            full={Boolean(v['full'] ?? false)}
            disabled={Boolean(v['disabled'] ?? false)}
            className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50"
          />
          <SegmentedControl
            label="Affichage"
            options={[
              { value: 'liste', label: 'Liste' },
              { value: 'grille', label: 'Grille' },
            ]}
            defaultValue="grille"
            full={Boolean(v['full'] ?? false)}
            disabled={Boolean(v['disabled'] ?? false)}
            className="o-w-64 o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50"
          />
        </div>
      </Stage>
    ),
  },
  'background/code-rain': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Chaque colonne porte une goutte a sa propre vitesse ; les glyphes sont des masques de quinze bits dessines par le shader, sans police ni texture.',
    render: (v) =>
      fill(
        <CodeRain
          className="o-size-full"
          colors={list(v, 'colors', CODE_RAIN_TOKENS)}
          columns={num(v, 'columns', 40)}
          speed={num(v, 'speed', 1)}
          trail={num(v, 'trail', 8)}
          mutate={num(v, 'mutate', 3)}
        />,
      ),
  },
  'background/faulty-terminal': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Le texte se tape ligne par ligne, puis l’écran s’efface ; les pannes sont hachees par paliers — scintillement, bandes dechirees d’un nombre entier de colonnes, cellules corrompues.',
    render: (v) =>
      fill(
        <FaultyTerminal
          className="o-size-full"
          colors={list(v, 'colors', FAULTY_TERMINAL_TOKENS)}
          columns={num(v, 'columns', 48)}
          speed={num(v, 'speed', 1.5)}
          flicker={num(v, 'flicker', 0.5)}
          tearing={num(v, 'tearing', 0.5)}
        />,
      ),
  },
  'background/crt-warp': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Le bombement se lit a l’envers, par une seule formule ; les coins sortent du cadre, le verre écarte les teintes près des bords, et la vignette ramene vers le fond du thème, jamais vers le noir.',
    render: (v) =>
      fill(
        <CrtWarp
          className="o-size-full"
          colors={list(v, 'colors', CRT_WARP_TOKENS)}
          curve={num(v, 'curve', 0.25)}
          lines={num(v, 'lines', 160)}
          aberration={num(v, 'aberration', 0.6)}
          speed={num(v, 'speed', 0.5)}
        />,
      ),
  },
  'background/glitch-blocks': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Tout est hache par paliers : entre deux, rien ne bouge. A chaque palier, un tirage par bloc decide s’il saute, et des bandes entières sautent plus rarement, d’un seul tenant.',
    render: (v) =>
      fill(
        <GlitchBlocks
          className="o-size-full"
          colors={list(v, 'colors', GLITCH_BLOCKS_TOKENS)}
          blocks={num(v, 'blocks', 12)}
          rate={num(v, 'rate', 6)}
          amount={num(v, 'amount', 0.5)}
          speed={num(v, 'speed', 0.3)}
        />,
      ),
  },
  'background/pixel-sort': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Le tri est simule sans lire la colonne : des segments tires par rang, dont la luminance croit du haut vers le bas, ne sortent que là où l’image est assez claire.',
    render: (v) =>
      fill(
        <PixelSort
          className="o-size-full"
          colors={list(v, 'colors', PIXEL_SORT_TOKENS)}
          pixel={num(v, 'pixel', 3)}
          density={num(v, 'density', 5)}
          threshold={num(v, 'threshold', 0.45)}
          speed={num(v, 'speed', 0.3)}
        />,
      ),
  },
  'background/circuit': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Chaque tuile tire un trait ou un coude ; deux voisines qui s’ouvrent l’une vers l’autre se raccordent d’elles-mêmes, et un bord ouvert d’un seul côté porte une pastille.',
    render: (v) =>
      fill(
        <Circuit
          className="o-size-full"
          colors={list(v, 'colors', CIRCUIT_TOKENS)}
          cells={num(v, 'cells', 10)}
          width={num(v, 'width', 0.08)}
          speed={num(v, 'speed', 1)}
          pulses={num(v, 'pulses', 0.5)}
        />,
      ),
  },
  'background/data-stream': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'formulaire',
    lead: 'Des couloirs independants, chacun avec son sens et sa vitesse ; le bout qui avance est releve, et c’est ce qui donne le sens de la marche sans fleche.',
    render: (v) =>
      fill(
        <DataStream
          className="o-size-full"
          colors={list(v, 'colors', DATA_STREAM_TOKENS)}
          lanes={num(v, 'lanes', 24)}
          speed={num(v, 'speed', 1)}
          density={num(v, 'density', 6)}
          thickness={num(v, 'thickness', 0.35)}
        />,
      ),
  },
  'background/hologram': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Une sphere en meridiens et paralleles au-dessus d’un socle : la face arriere s’efface, une bande la balaie, et le scintillement est hache par paliers — un hologramme tremble, il ne respire pas.',
    render: (v) =>
      fill(
        <Hologram
          className="o-size-full"
          colors={list(v, 'colors', HOLOGRAM_TOKENS)}
          meridians={num(v, 'meridians', 12)}
          parallels={num(v, 'parallels', 7)}
          rpm={num(v, 'rpm', 4)}
          flicker={num(v, 'flicker', 0.5)}
        />,
      ),
  },
  'background/ascii-field': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Le champ est lu au centre de chaque cellule et quantifie en dix niveaux, chacun choisissant un caractère de la rampe classique : de loin un dégradé, de près du texte.',
    render: (v) =>
      fill(
        <AsciiField
          className="o-size-full"
          colors={list(v, 'colors', ASCII_FIELD_TOKENS)}
          cells={num(v, 'cells', 80)}
          speed={num(v, 'speed', 0.25)}
          scale={num(v, 'scale', 3)}
          contrast={num(v, 'contrast', 1.4)}
        />,
      ),
  },
  'background/vhs-tracking': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'La bande de tracking roule et décale les lignes qu’elle traverse ; les deux teintes sont lues a des positions ecartees, beaucoup plus pendant les rafales.',
    render: (v) =>
      fill(
        <VhsTracking
          className="o-size-full"
          colors={list(v, 'colors', VHS_TRACKING_TOKENS)}
          speed={num(v, 'speed', 1)}
          band={num(v, 'band', 0.14)}
          split={num(v, 'split', 0.6)}
          noise={num(v, 'noise', 0.5)}
        />,
      ),
  },
  'loader/liquid-fill': {
    height: 'o-h-64',
    lead: 'Deux nappes de même période dérivent en sens contraires : leur somme n’a plus de motif, et la surface se met a ressembler a de l’eau. Cochez « indeterminate » pour la maree.',
    render: (v, frame) => (
      <Stage>
        <LiquidFill
          value={num(v, 'value', 62)}
          indeterminate={v['indeterminate'] === true}
          size={num(v, 'size', 88)}
          speed={num(v, 'speed', 2600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/battery-fill': {
    height: 'o-h-64',
    lead: 'Le niveau est une échelle, jamais une largeur animee : rien ne recalcule la géométrie. En charge, il balaye le boitier sous un eclair reste lisible.',
    render: (v, frame) => (
      <Stage>
        <BatteryFill
          value={num(v, 'value', 58)}
          indeterminate={v['indeterminate'] === true}
          size={num(v, 'size', 96)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/water-drop': {
    height: 'o-h-64',
    lead: 'Ce qui dit « liquide », c’est la deformation : la goutte s’affine en prenant de la vitesse, s’aplatit d’un coup, et une seule onde part de l’impact.',
    render: (v, frame) => (
      <Stage>
        <WaterDrop
          size={num(v, 'size', 64)}
          speed={num(v, 'speed', 2000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/blob-loader': {
    height: 'o-h-64',
    lead: 'Deux cercles seulement : un flou seuille les soude, et le cou qui s’etire puis casse n’est qu’un effet de bord de leur distance.',
    render: (v, frame) => (
      <Stage>
        <BlobLoader
          size={num(v, 'size', 56)}
          speed={num(v, 'speed', 2800)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/jelly-loader': {
    height: 'o-h-64',
    lead: 'Chaque rebond est plus faible que le précédent, et ce sont les rayons de coin, pas l’échelle, qui font la matière molle.',
    render: (v, frame) => (
      <Stage>
        <JellyLoader
          size={num(v, 'size', 40)}
          speed={num(v, 'speed', 1600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/moon-phases': {
    height: 'o-h-64',
    lead: 'Le terminateur est une demi-ellipse écrite en cubiques, pour qu’aucun drapeau d’arc ne bascule ; le retournement de la decroissance a lieu a la pleine lune, quand il ne se voit pas.',
    render: (v, frame) => (
      <Stage>
        <MoonPhases
          size={num(v, 'size', 48)}
          speed={num(v, 'speed', 3600)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/sun-rays': {
    height: 'o-h-64',
    lead: 'Un rayon sur deux est en avance d’une demi-période : la couronne scintille au lieu de clignoter, et la rotation, huit fois plus lente, se pose dessus sans rivaliser.',
    render: (v, frame) => (
      <Stage>
        <SunRays
          size={num(v, 'size', 56)}
          speed={num(v, 'speed', 1800)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/eclipse': {
    height: 'o-h-64',
    lead: 'Rien n’est masque : le rayon et l’épaisseur d’un seul cercle trace bougent ensemble, si bien que le bord exterieur ne change jamais et que le fond reste ce qu’il est.',
    render: (v, frame) => (
      <Stage>
        <Eclipse
          size={num(v, 'size', 64)}
          speed={num(v, 'speed', 3000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/ripple-loader': {
    height: 'o-h-64',
    lead: 'Les quatre anneaux ne bougent pas : c’est la crete qui les traverse. Un anneau qui grandit dit « quelque chose part d’ici » ; une crete dit « quelque chose parcourt ».',
    render: (v, frame) => (
      <Stage>
        <RippleLoader
          size={num(v, 'size', 56)}
          speed={num(v, 'speed', 2000)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/sonar-loader': {
    height: 'o-h-64',
    lead: 'Le SVG ne connaît pas le dégradé conique : la traine est faite de huit secteurs empiles, et chaque frontière ne fait entrer ou sortir qu’une couche. Les echos s’allument quand le faisceau les atteint.',
    render: (v, frame) => (
      <Stage>
        <SonarLoader
          size={num(v, 'size', 72)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'background/dark-veil': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Le voile est un bruit deforme par lui-même ; la lueur ne passe que par ses trouees, et le voile se pose par melange, jamais par assombrissement.',
    render: (v) =>
      fill(
        <DarkVeil
          className="o-size-full"
          speed={num(v, 'speed', 0.5)}
          scale={num(v, 'scale', 1.8)}
          opacity={num(v, 'opacity', 0.8)}
          colors={list(v, 'colors', DARK_VEIL_TOKENS)}
        />,
      ),
  },
  'background/lightfall': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Une goutte par colonne, tête nette et traînée exponentielle : trois profondeurs tombent sous un rideau qui descend du haut.',
    render: (v) =>
      fill(
        <Lightfall
          className="o-size-full"
          speed={num(v, 'speed', 1)}
          density={num(v, 'density', 9)}
          length={num(v, 'length', 0.25)}
          colors={list(v, 'colors', LIGHTFALL_TOKENS)}
        />,
      ),
  },
  'background/volumetric-rays': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'La lumière est intégrée le long du rai à travers la brume : un banc épais l’éteint, la brume locale la diffuse.',
    render: (v) =>
      fill(
        <VolumetricRays
          className="o-size-full"
          x={num(v, 'x', 0.5)}
          y={num(v, 'y', 1)}
          count={num(v, 'count', 10)}
          strength={num(v, 'strength', 1)}
          colors={list(v, 'colors', VOLUMETRIC_RAYS_TOKENS)}
        />,
      ),
  },
  'background/lens-flare': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deplacez le curseur : la source le suit avec retard, et la chaîne de fantomes se reordonne sur l’axe qui la joint au centre.',
    render: (v) =>
      fill(
        <LensFlare
          className="o-size-full"
          intensity={num(v, 'intensity', 1)}
          ghosts={num(v, 'ghosts', 4)}
          streak={num(v, 'streak', 0.5)}
          colors={list(v, 'colors', LENS_FLARE_TOKENS)}
        />,
      ),
  },
  'background/neon-grid': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Le sol est projete en z = 1/y et défile vers vous ; au-dessus, un soleil raye et une ligne d’horizon en neon.',
    render: (v) =>
      fill(
        <NeonGrid
          className="o-size-full"
          speed={num(v, 'speed', 1)}
          horizon={num(v, 'horizon', 0.5)}
          density={num(v, 'density', 8)}
          glow={num(v, 'glow', 0.06)}
          colors={list(v, 'colors', NEON_GRID_TOKENS)}
        />,
      ),
  },
  'background/halo-pulse': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'formulaire',
    lead: 'Le cœur respire et émet un anneau a chaque période ; les anneaux s’elargissent et palissent en s’eloignant.',
    render: (v) =>
      fill(
        <HaloPulse
          className="o-size-full"
          period={num(v, 'period', 4000)}
          rings={num(v, 'rings', 3)}
          size={num(v, 'size', 0.8)}
          x={num(v, 'x', 0.5)}
          y={num(v, 'y', 0.5)}
          colors={list(v, 'colors', HALO_PULSE_TOKENS)}
        />,
      ),
  },
  'background/cloud-layer': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Trois couches en parallaxe ; une lecture du bruit décalée vers la lumière éclaire les sommets et laisse les dessous dans l’ombre.',
    render: (v) =>
      fill(
        <CloudLayer
          className="o-size-full"
          speed={num(v, 'speed', 0.08)}
          scale={num(v, 'scale', 2)}
          coverage={num(v, 'coverage', 0.55)}
          colors={list(v, 'colors', CLOUD_LAYER_TOKENS)}
        />,
      ),
  },
  'background/fog-drift': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Deux nappes qui glissent en sens contraires : c’est leur parallaxe qui fait la profondeur, pas leur teinte.',
    render: (v) =>
      fill(
        <FogDrift
          className="o-size-full"
          speed={num(v, 'speed', 0.5)}
          height={num(v, 'height', 0.45)}
          density={num(v, 'density', 0.8)}
          colors={list(v, 'colors', FOG_DRIFT_TOKENS)}
        />,
      ),
  },
  'background/underwater': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Les rais convergent vers la surface au-dessus du cadre et se balancent ; les bulles montent par colonnes, chacune avec son reflet.',
    render: (v) =>
      fill(
        <Underwater
          className="o-size-full"
          speed={num(v, 'speed', 1)}
          rays={num(v, 'rays', 6)}
          bubbles={num(v, 'bubbles', 8)}
          colors={list(v, 'colors', UNDERWATER_TOKENS)}
        />,
      ),
  },
  'background/fire': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Le domaine du bruit descend, donc les flammes montent en continu ; la chaleur est ce bruit moins une rampe de la hauteur.',
    render: (v) =>
      fill(
        <Fire
          className="o-size-full"
          speed={num(v, 'speed', 1)}
          height={num(v, 'height', 0.5)}
          scale={num(v, 'scale', 3)}
          colors={list(v, 'colors', FIRE_TOKENS)}
        />,
      ),
  },
  'background/flow-field': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Des particules naissent, courent le long d’un champ de bruit et s’éteignent ; chaque pixel remonte le champ a contre-courant, rien n’est stocke.',
    render: (v) =>
      fill(
        <FlowField
          className="o-size-full"
          colors={list(v, 'colors', FLOW_FIELD_TOKENS)}
          scale={num(v, 'scale', 2.5)}
          speed={num(v, 'speed', 1)}
          density={num(v, 'density', 0.25)}
          trail={num(v, 'trail', 8)}
        />,
      ),
  },
  'background/magnetic-lines': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'Deplacez le curseur : le second pole le suit, et les cercles du dipole se redessinent autour de lui en glissant d’un pole a l’autre.',
    render: (v) =>
      fill(
        <MagneticLines
          className="o-size-full"
          colors={list(v, 'colors', MAGNETIC_LINES_TOKENS)}
          lines={num(v, 'lines', 16)}
          spread={num(v, 'spread', 0.35)}
          speed={num(v, 'speed', 0.15)}
          potential={v['potential'] !== false}
        />,
      ),
  },
  'background/electric-field': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Une échelle de Jacob : l’arc s’amorce en bas entre les electrodes, monte en crepitant et se rompt en haut avant de repartir.',
    render: (v) =>
      fill(
        <ElectricField
          className="o-size-full"
          colors={list(v, 'colors', ELECTRIC_FIELD_TOKENS)}
          speed={num(v, 'speed', 0.35)}
          jitter={num(v, 'jitter', 0.5)}
          glow={num(v, 'glow', 0.5)}
          branches={num(v, 'branches', 3)}
        />,
      ),
  },
  'background/plasma-ball': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Approchez le curseur du globe : le filament principal se tend vers lui comme vers un doigt sur le verre, et les autres palissent.',
    render: (v) =>
      fill(
        <PlasmaBall
          className="o-size-full"
          colors={list(v, 'colors', PLASMA_BALL_TOKENS)}
          filaments={num(v, 'filaments', 7)}
          radius={num(v, 'radius', 0.38)}
          speed={num(v, 'speed', 1)}
          pull={num(v, 'pull', 0.8)}
        />,
      ),
  },
  'background/water-surface': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Des vagues de Gerstner vues en rasant : de face l’eau, au ras le ciel, et le soleil qui scintille sur les ridules. Le curseur fait glisser la camera.',
    render: (v) =>
      fill(
        <WaterSurface
          className="o-size-full"
          colors={list(v, 'colors', WATER_SURFACE_TOKENS)}
          amplitude={num(v, 'amplitude', 0.12)}
          wavelength={num(v, 'wavelength', 1.6)}
          choppiness={num(v, 'choppiness', 0.6)}
          speed={num(v, 'speed', 1)}
          sun={num(v, 'sun', 1)}
          parallax={num(v, 'parallax', 0.15)}
        />,
      ),
  },
  'background/sand-flow': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'Des filets de grains tombent sur un tas qui s’élève sous chacun d’eux ; les bords des filets s’effilochent grain par grain.',
    render: (v) =>
      fill(
        <SandFlow
          className="o-size-full"
          colors={list(v, 'colors', SAND_FLOW_TOKENS)}
          streams={num(v, 'streams', 3)}
          grain={num(v, 'grain', 110)}
          speed={num(v, 'speed', 1)}
          heap={num(v, 'heap', 0.22)}
        />,
      ),
  },
  'background/wind-field': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Un trait par cellule, oriente par le vent et long comme sa force ; les rafales balaient le cadre et changent la teinte des traits au passage.',
    render: (v) =>
      fill(
        <WindField
          className="o-size-full"
          colors={list(v, 'colors', WIND_FIELD_TOKENS)}
          cells={num(v, 'cells', 22)}
          scale={num(v, 'scale', 1.6)}
          speed={num(v, 'speed', 1)}
          gusts={num(v, 'gusts', 0.7)}
        />,
      ),
  },
  'background/particle-sphere': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Un nuage de points spherique qui tourne ; passez le curseur dessus, la surface se souleve sous lui et les points souleves changent de teinte.',
    render: (v) =>
      fill(
        <ParticleSphere
          className="o-size-full"
          colors={list(v, 'colors', PARTICLE_SPHERE_TOKENS)}
          points={num(v, 'points', 3000)}
          size={num(v, 'size', 2.5)}
          pull={num(v, 'pull', 0.35)}
          reach={num(v, 'reach', 0.45)}
          rpm={num(v, 'rpm', 1.5)}
        />,
      ),
  },
  'background/jelly': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Cliquez n’importe ou : la gelee se creuse a l’impact, une onde court sur sa surface et toute la masse balance avant de se calmer.',
    render: (v) =>
      fill(
        <Jelly
          className="o-size-full"
          colors={list(v, 'colors', JELLY_TOKENS)}
          wobble={num(v, 'wobble', 0.22)}
          stiffness={num(v, 'stiffness', 9)}
          damping={num(v, 'damping', 1.6)}
          rpm={num(v, 'rpm', 1)}
        />,
      ),
  },
  'background/crystal': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Un prisme a facettes qui tourne et s’incline vers le curseur ; chaque facette prend sa teinte de la direction refractee, et les aretes separent les couleurs.',
    render: (v) =>
      fill(
        <Crystal
          className="o-size-full"
          colors={list(v, 'colors', CRYSTAL_TOKENS)}
          facets={num(v, 'facets', 6)}
          rpm={num(v, 'rpm', 3)}
          dispersion={num(v, 'dispersion', 0.6)}
          parallax={num(v, 'parallax', 0.25)}
        />,
      ),
  },
  'loader/route-path': {
    height: 'o-h-64',
    lead: 'Une tête avance du départ vers la destination, qui se plante a l’arrivee ; le trace s’efface ensuite au lieu de se rembobiner, parce qu’un itineraire ne se defait pas.',
    render: (v, frame) => (
      <Stage>
        <RoutePath
          size={num(v, 'size', 72)}
          thickness={num(v, 'thickness', 4)}
          speed={num(v, 'speed', 2400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/logo-draw': {
    height: 'o-h-64',
    lead: 'D’abord le trait, d’un seul geste, puis la matière une fois la forme fermee ; l’effacement suit le même sens que le trace, le crayon ne revient jamais sur ses pas.',
    render: (v, frame) => (
      <Stage>
        <LogoDraw
          size={num(v, 'size', 64)}
          thickness={num(v, 'thickness', 4)}
          speed={num(v, 'speed', 2800)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/checkmark-success': {
    height: 'o-h-64',
    lead: 'La même coche s’ebauche pendant l’attente et se pose pour de bon au succès : on voit dès la première seconde ce que l’on attend. A l’échec, une croix, et la tête qui se secoue.',
    render: (v, frame) => (
      <Stage>
        <CheckmarkSuccess
          size={num(v, 'size', 56)}
          thickness={num(v, 'thickness', 6)}
          speed={num(v, 'speed', 900)}
          state={str(v, 'state', 'chargement') as 'chargement' | 'succes' | 'echec'}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/spinner-to-check': {
    height: 'o-h-64',
    lead: 'L’arc ne saute pas a zéro quand la réponse arrive : sa rotation est mise en pause a l’angle courant, puis le tiret s’allonge jusqu au tour complet avant que la marque ne se trace.',
    render: (v, frame) => (
      <Stage>
        <SpinnerToCheck
          size={num(v, 'size', 56)}
          thickness={num(v, 'thickness', 6)}
          speed={num(v, 'speed', 1000)}
          state={str(v, 'state', 'chargement') as 'chargement' | 'succes' | 'echec'}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/envelope': {
    height: 'o-h-64',
    lead: 'Un rabat vu de face qui bascule, c’est le même triangle retourne autour de sa charniere : une symetrie verticale suffit, sans perspective. La lettre est découpée sur cette ligne.',
    render: (v, frame) => (
      <Stage>
        <Envelope size={num(v, 'size', 64)} speed={num(v, 'speed', 2600)} color={frame.color} />
      </Stage>
    ),
  },
  'loader/paper-plane': {
    height: 'o-h-64',
    lead: 'L’avion et sa traînée sortent de la même table d’echantillons : l’un avance en paramètre, l’autre en longueur d’arc, et les deux ne peuvent plus deriver. Le cap vient de la dérivée.',
    render: (v, frame) => (
      <Stage>
        <PaperPlane size={num(v, 'size', 80)} speed={num(v, 'speed', 2600)} color={frame.color} />
      </Stage>
    ),
  },
  'loader/rocket': {
    height: 'o-h-64',
    lead: 'Arrivee en freinant, appui, puis départ en accelerant jusqu’à sortir du cadre : deux gestes distincts, pas un yo-yo. La flamme s’allonge au rythme du cycle et vacille quatorze fois plus vite.',
    render: (v, frame) => (
      <Stage>
        <Rocket size={num(v, 'size', 72)} speed={num(v, 'speed', 2200)} color={frame.color} />
      </Stage>
    ),
  },
  'loader/scanner-line': {
    height: 'o-h-64',
    lead: 'Un faisceau a cœur net et halo symetrique, avec un temps d’arrêt a chaque extremite : sans cet arrêt il rebondirait, et un rebond raconte une balle, pas une lecture.',
    render: (v, frame) => (
      <Stage>
        <ScannerLine
          size={num(v, 'size', 160)}
          height={num(v, 'height', 96)}
          speed={num(v, 'speed', 2200)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/signal-bars': {
    height: 'o-h-64',
    lead: 'Une seule animation pour toutes les barres : la vague nait du retard entre elles, pas d’images cles recopiees. Éteinte, une barre reste courte et attenuee, jamais absente.',
    render: (v, frame) => (
      <Stage>
        <SignalBars
          size={num(v, 'size', 32)}
          count={num(v, 'count', 4)}
          speed={num(v, 'speed', 1400)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'loader/wifi-pulse': {
    height: 'o-h-64',
    lead: 'Chaque arc se trace par son milieu au lieu d’apparaître en fondu : une onde a une direction. Ils partent du plus proche au plus lointain, et le point donne une seule impulsion par cycle.',
    render: (v, frame) => (
      <Stage>
        <WifiPulse
          size={num(v, 'size', 56)}
          thickness={num(v, 'thickness', 6)}
          speed={num(v, 'speed', 1800)}
          color={frame.color}
        />
      </Stage>
    ),
  },
  'ui/animated-list': {
    height: 'o-h-96',
    lead: 'La cascade attend que la liste soit vue : chaque ligne porte son index, la feuille en fait un retard. Le survol allume un filet de marque à gauche, les fleches font le tour.',
    render: (v) => (
      <Stage>
        <AnimatedList
          label="Activite du compte"
          items={[
            { id: 'virement', label: 'Virement reçu', hint: '1 240 EUR' },
            { id: 'loyer', label: 'Loyer de mars', hint: '- 780 EUR' },
            { id: 'abonnement', label: 'Abonnement musique', hint: '- 11 EUR' },
            { id: 'remboursement', label: 'Remboursement sante', hint: '64 EUR' },
            { id: 'courses', label: 'Courses du samedi', hint: '- 92 EUR' },
            { id: 'essence', label: 'Station Vitry-sur-Seine', hint: '- 58 EUR' },
          ]}
          defaultValue="loyer"
          stagger={num(v, 'stagger', 60)}
          fade={Boolean(v['fade'] ?? true)}
          className="o-h-56 o-w-full o-max-w-sm o-text-left o-text-sm o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/sortable-list': {
    height: 'o-h-96',
    lead: 'A la souris par la poignee ; au clavier, Espace saisit, les fleches déplacent, Espace depose, Echap annule. Chaque étape est écrite sous la liste, dans une zone d’état.',
    render: (v) => (
      <Stage>
        <SortableList
          label="Ordre des étapes du projet"
          items={[
            { id: 'cadrage', label: 'Cadrage', hint: '2 jours' },
            { id: 'maquette', label: 'Maquette', hint: '5 jours' },
            { id: 'integration', label: 'Integration', hint: '8 jours' },
            { id: 'recette', label: 'Recette', hint: '3 jours' },
            { id: 'mise-en-ligne', label: 'Mise en ligne', hint: '1 jour' },
          ]}
          disabled={Boolean(v['disabled'] ?? false)}
          className="o-w-full o-max-w-sm o-text-left o-text-sm o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/tree-view': {
    height: 'o-h-96',
    lead: 'Droite ouvre puis descend, gauche referme puis remonte : les quatre fleches ne font pas la même chose. Une branche fermee n’est pas dans le document.',
    render: (v) => (
      <Stage>
        <TreeView
          label="Fichiers du projet"
          nodes={[
            {
              id: 'client',
              label: 'Client',
              children: [
                { id: 'contrat', label: 'Contrat signe.pdf', hint: '240 ko' },
                { id: 'devis', label: 'Devis 2026-03.pdf', hint: '86 ko' },
                {
                  id: 'echanges',
                  label: 'Echanges',
                  children: [
                    { id: 'reunion', label: 'Compte rendu reunion.md' },
                    { id: 'brief', label: 'Brief initial.md' },
                  ],
                },
              ],
            },
            {
              id: 'production',
              label: 'Production',
              children: [
                { id: 'maquettes', label: 'Maquettes.fig', hint: '12 Mo' },
                { id: 'photos', label: 'Photos retouchees', hint: '48 fichiers' },
              ],
            },
            { id: 'facture', label: 'Facture 2026-041.pdf', hint: '92 ko' },
          ]}
          defaultOpen={['client']}
          defaultValue="contrat"
          stagger={num(v, 'stagger', 30)}
          className="o-w-full o-max-w-sm o-text-left o-text-sm o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/stepper': {
    height: 'o-h-80',
    lead: 'Le trait se remplit derrière l’avancee et le panneau entre du côté d’où l’on vient. Les fleches promenent le focus, Entrée change d’étape : quatre panneaux ne défilent pas pour en regarder un.',
    render: (v, frame) => (
      <Stage>
        <Stepper
          label="Commande"
          steps={[
            { id: 'panier', label: 'Panier', hint: '3 articles' },
            { id: 'livraison', label: 'Livraison', hint: 'Point relais' },
            { id: 'paiement', label: 'Paiement' },
          ]}
          defaultValue={1}
          orientation={str(v, 'orientation', 'horizontal') as 'horizontal' | 'vertical'}
          reach={str(v, 'reach', 'all') as 'done' | 'all' | 'none'}
          className="o-w-full o-max-w-md o-text-left o-text-sm o-text-zinc-900 dark:o-text-zinc-50"
        >
          <div
            className="o-border-w-1 o-border-zinc-200 o-p-4 dark:o-border-zinc-800"
            style={{ borderRadius: `${String(frame.radius)}px` }}
          >
            Retrait au point relais Rue des Lilas, ouvert du mardi au samedi.
          </div>
        </Stepper>
      </Stage>
    ),
  },
  'ui/elastic-slider': {
    height: 'o-h-64',
    lead: 'Le contrôle est un champ de plage natif, rendu transparent par-dessus le décor : fleches, Origine, Fin et molette sont ceux du navigateur. Tirer au-delà de la butee etire le rail, qui revient en depassant.',
    render: (v) => (
      <Stage>
        <div className="o-flex o-w-full o-max-w-sm o-flex-col o-gap-6 o-text-sm o-text-zinc-900 dark:o-text-zinc-50">
          <ElasticSlider
            label="Volume"
            defaultValue={64}
            stretch={num(v, 'stretch', 0.12)}
            showValue={Boolean(v['showValue'] ?? true)}
            leading={<span aria-hidden="true">Vol</span>}
          />
          <ElasticSlider
            label="Durée de la seance"
            min={5}
            max={45}
            step={5}
            defaultValue={20}
            stretch={num(v, 'stretch', 0.12)}
            showValue={Boolean(v['showValue'] ?? true)}
            leading={<span aria-hidden="true">Min</span>}
          />
        </div>
      </Stage>
    ),
  },
  'ui/option-wheel': {
    height: 'o-h-80',
    lead: 'Le défilement, l’inertie et le calage sont ceux du navigateur ; seule l’inclinaison des lignes est peinte, une fois par image. La valeur n’est publiee qu’a l’arrêt.',
    render: (v) => (
      <Stage>
        <OptionWheel
          label="Heure du rendez-vous"
          options={[
            { value: '09', label: '09 h 00' },
            { value: '09-30', label: '09 h 30' },
            { value: '10', label: '10 h 00' },
            { value: '10-30', label: '10 h 30' },
            { value: '11', label: '11 h 00' },
            { value: '14', label: '14 h 00' },
            { value: '14-30', label: '14 h 30' },
            { value: '15', label: '15 h 00' },
            { value: '16', label: '16 h 00' },
          ]}
          defaultValue="10-30"
          visible={num(v, 'visible', 5)}
          curve={num(v, 'curve', 18)}
          className="o-w-64 o-text-sm o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/toast-stack': {
    height: 'o-h-96',
    lead: 'Les cartes s’empilent l’une devant l’autre ; la main posee dessus etale le paquet et met les minuteries en pause en même temps. Le delai est a zéro pour l’aperçu.',
    controls: [
      {
        kind: 'range',
        name: 'duration',
        label: 'Delai',
        min: 0,
        max: 10000,
        step: 500,
        value: 0,
        unit: 'ms',
      },
      { kind: 'range', name: 'max', label: 'Visibles', min: 1, max: 6, step: 1, value: 3 },
      {
        kind: 'choice',
        name: 'side',
        label: 'Ancrage',
        options: ['bottom', 'top'],
        value: 'bottom',
      },
    ],
    render: (v) => (
      <Stage>
        <ToastStack
          toasts={[
            {
              id: 'sauvegarde',
              title: 'Brouillon enregistre',
              description: 'Il y a quelques secondes.',
              tone: 'succes',
            },
            {
              id: 'envoi',
              title: 'Devis envoye a Martin Leroy',
              description: 'Une copie part sur votre adresse.',
              tone: 'info',
            },
            {
              id: 'quota',
              title: 'Espace bientôt plein',
              description: 'Il reste 380 Mo sur 5 Go.',
              tone: 'alerte',
            },
            {
              id: 'export',
              title: 'Export interrompu',
              description: 'Le fichier depasse la taille permise.',
              tone: 'erreur',
            },
          ]}
          duration={num(v, 'duration', 0)}
          max={num(v, 'max', 3)}
          side={str(v, 'side', 'bottom') === 'top' ? 'top' : 'bottom'}
          className="o-text-left o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/command-palette': {
    height: 'o-h-96',
    lead: 'L’ouverture appartient a la page : ici elle reste ouverte pour l’aperçu. Écrire filtre, les fleches parcourent sans quitter le champ, Entrée lance, Echap ferme.',
    render: () => (
      <Stage>
        <CommandPalette
          open
          label="Commandes"
          commands={[
            { id: 'nouveau', label: 'Nouveau document', group: 'Fichier', hint: 'Ctrl N' },
            { id: 'ouvrir', label: 'Ouvrir un projet', group: 'Fichier', hint: 'Ctrl O' },
            { id: 'exporter', label: 'Exporter en PDF', group: 'Fichier' },
            { id: 'renommer', label: 'Renommer la page', group: 'Edition', hint: 'F2' },
            { id: 'dupliquer', label: 'Dupliquer la section', group: 'Edition' },
            { id: 'theme', label: 'Basculer le thème sombre', group: 'Affichage' },
            { id: 'raccourcis', label: 'Voir les raccourcis', group: 'Affichage', hint: '?' },
          ]}
          className="o-text-left o-text-zinc-900 dark:o-text-zinc-50"
          style={{ position: 'absolute', padding: '2rem 1rem 1rem' }}
        />
      </Stage>
    ),
  },
  'loader/skeleton-lines': {
    height: 'o-h-64',
    lead: 'La dernière ligne s’arrête avant le bord : c’est ce raccourci qui fait lire un paragraphe et non une grille.',
    render: (v) => (
      <Stage>
        <div className="o-w-full o-max-w-md">
          <SkeletonLines
            lines={num(v, 'lines', 3)}
            height={num(v, 'height', 12)}
            radius={num(v, 'radius', 6)}
            shimmer={v['shimmer'] !== false}
            speed={num(v, 'speed', 1600)}
          />
        </div>
      </Stage>
    ),
  },
  'loader/skeleton-card': {
    height: 'o-h-96',
    lead: 'La carte est déjà dessinee, filet compris ; seuls son image, son titre et ses lignes restent vides.',
    render: (v) => (
      <Stage>
        <div className="o-w-72">
          <SkeletonCard
            lines={num(v, 'lines', 2)}
            media={v['media'] !== false}
            footer={v['footer'] !== false}
            radius={num(v, 'radius', 14)}
            shimmer={v['shimmer'] !== false}
            speed={num(v, 'speed', 1600)}
          />
        </div>
      </Stage>
    ),
  },
  'loader/skeleton-avatar': {
    height: 'o-h-80',
    lead: 'Un rond suivi de deux lignes se lit « quelqu un » avant qu’aucun nom ne soit la ; répète, c’est une liste de membres.',
    render: (v) => (
      <Stage>
        <div className="o-w-full o-max-w-md">
          <SkeletonAvatar
            rows={num(v, 'rows', 1)}
            lines={num(v, 'lines', 2)}
            size={num(v, 'size', 44)}
            radius={num(v, 'radius', 6)}
            shimmer={v['shimmer'] !== false}
            speed={num(v, 'speed', 1600)}
          />
        </div>
      </Stage>
    ),
  },
  'loader/skeleton-table': {
    height: 'o-h-96',
    lead: 'Les filets, une première colonne large et des longueurs inegales : trois indices, et la table se lit avant ses données.',
    render: (v) => (
      <Stage>
        <div className="o-w-full o-max-w-md">
          <SkeletonTable
            rows={num(v, 'rows', 4)}
            columns={num(v, 'columns', 4)}
            header={v['header'] !== false}
            height={num(v, 'height', 10)}
            radius={num(v, 'radius', 5)}
            shimmer={v['shimmer'] !== false}
            speed={num(v, 'speed', 1600)}
          />
        </div>
      </Stage>
    ),
  },
  'loader/skeleton-grid': {
    height: 'o-h-96',
    lead: 'Le rapport de chaque vignette réserve la hauteur exacte des images ; le reflet traverse la grille en biais.',
    render: (v) => (
      <Stage>
        <div className="o-w-full o-max-w-md">
          <SkeletonGrid
            rows={num(v, 'rows', 2)}
            columns={num(v, 'columns', 3)}
            ratio={str(v, 'ratio', '4/3')}
            caption={v['caption'] !== false}
            gap={num(v, 'gap', 14)}
            radius={num(v, 'radius', 10)}
            shimmer={v['shimmer'] !== false}
            speed={num(v, 'speed', 1600)}
          />
        </div>
      </Stage>
    ),
  },
  'loader/shimmer-block': {
    height: 'o-h-64',
    lead: 'La bande est le fond du bloc, pas une couche posee dessus : elle suit les angles arrondis sans redire le rayon.',
    render: (v) => (
      <Stage>
        <div className="o-w-72">
          <ShimmerBlock
            height={num(v, 'height', 96)}
            radius={num(v, 'radius', 12)}
            angle={num(v, 'angle', 110)}
            band={num(v, 'band', 14)}
            speed={num(v, 'speed', 1800)}
          />
        </div>
      </Stage>
    ),
  },
  'loader/pulse-block': {
    height: 'o-h-64',
    lead: 'C’est la teinte qui respire, pas l’opacité : au creux du cycle, le bloc reste opaque et ne laisse rien transparaitre.',
    render: (v) => (
      <Stage>
        <div className="o-w-72">
          <PulseBlock
            height={num(v, 'height', 96)}
            radius={num(v, 'radius', 12)}
            depth={num(v, 'depth', 0.55)}
            speed={num(v, 'speed', 1400)}
          />
        </div>
      </Stage>
    ),
  },
  'loader/placeholder-image': {
    height: 'o-h-64',
    lead: 'Un filet pointille et un pictogramme : le cadre dit « une image va ici », même quand rien ne charge.',
    render: (v) => (
      <Stage>
        <div className="o-w-72">
          <PlaceholderImage
            ratio={str(v, 'ratio', '16/9')}
            icon={num(v, 'icon', 40)}
            radius={num(v, 'radius', 12)}
            shimmer={v['shimmer'] === true}
            speed={num(v, 'speed', 2000)}
          />
        </div>
      </Stage>
    ),
  },
  'loader/content-fade': {
    height: 'o-h-80',
    lead: 'L’autre moitie du squelette : le contenu reel, déjà dans le document, révèle section par section.',
    render: (v) => (
      <Stage>
        <div className="o-w-full o-max-w-md o-text-left">
          <ContentFade
            // Le fondu ne se joue qu une fois : la cle le rejoue a chaque
            // reglage, sans quoi la demo serait immobile apres le premier
            // affichage.
            key={`${String(num(v, 'speed', 650))}-${String(num(v, 'stagger', 140))}-${String(num(v, 'delay', 0))}-${String(num(v, 'shift', 14))}`}
            speed={num(v, 'speed', 650)}
            stagger={num(v, 'stagger', 140)}
            delay={num(v, 'delay', 0)}
            shift={num(v, 'shift', 14)}
          >
            <p className="o-text-xs o-uppercase o-tracking-wide o-opacity-70">Journal</p>
            <p className="o-text-lg o-font-semibold">Trois pieces arrivent dans l’ordre</p>
            <p className="o-text-sm o-leading-relaxed o-opacity-70">
              Chaque section paraît un peu après la précédente : le fondu se joue une
              fois, puis se tient. Rien n’est simule, le texte est la dès le départ.
            </p>
          </ContentFade>
        </div>
      </Stage>
    ),
  },
  'loader/lazy-block': {
    height: 'o-h-80',
    lead: 'Le substitut couvre un contenu déjà présent, respire, puis s’efface : la mise en page ne saute jamais.',
    render: (v) => (
      <Stage>
        <div className="o-w-full o-max-w-md o-text-left">
          <LazyBlock
            delay={num(v, 'delay', 1400)}
            speed={num(v, 'speed', 500)}
            loop={v['loop'] !== false}
            hold={num(v, 'hold', 2400)}
            height={num(v, 'height', 96)}
            radius={num(v, 'radius', 12)}
          >
            <div className="o-flex o-flex-col o-gap-3 o-p-4">
              <p className="o-text-lg o-font-semibold">Le contenu etait déjà la</p>
              <p className="o-text-sm o-leading-relaxed o-opacity-70">
                Il attendait derrière le substitut, avec sa hauteur reelle. La demo
                rejoue le cycle en boucle pour montrer le passage.
              </p>
            </div>
          </LazyBlock>
        </div>
      </Stage>
    ),
  },
  'text/ascii-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'La couverture des glyphes est mesuree une fois hors document ; chaque image ne fait que relire cette trame à travers une vague.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <AsciiText
            key={JSON.stringify(v)}
            rows={num(v, 'rows', 8)}
            speed={num(v, 'speed', 2600)}
            waves={num(v, 'waves', 1.5)}
          >
            Un titre qui accroche
          </AsciiText>
        }
      />
    ),
  },
  'text/curved-loop': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Un seul attribut déplace par image — le point de départ sur le chemin — et la phrase court sans fin sur son arc.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <CurvedLoop
            key={JSON.stringify(v)}
            as="span"
            className="o-w-full"
            courbure={num(v, 'courbure', 0.5)}
            taille={num(v, 'taille', 96)}
            speed={num(v, 'speed', 60)}
            sens={str(v, 'sens', 'gauche') as 'gauche' | 'droite'}
          >
            Un titre qui accroche
          </CurvedLoop>
        }
      />
    ),
  },
  'text/depth-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Les copies sont reculees en profondeur, pas decalees a plat : c’est la rotation lente qui découvre la tranche du bloc.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <DepthText
            depth={num(v, 'depth', 8)}
            step={num(v, 'step', 2)}
            angle={num(v, 'angle', 16)}
            speed={num(v, 'speed', 6000)}
            perspective={num(v, 'perspective', 600)}
          >
            Un titre qui accroche
          </DepthText>
        }
      />
    ),
  },
  'text/fold-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Chaque lettre est un volet articule sur son bord supérieur : rien ne se déplace, tout pivote sous une perspective courte.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <FoldText
            key={JSON.stringify(v)}
            duration={num(v, 'duration', 620)}
            step={num(v, 'step', 40)}
            perspective={num(v, 'perspective', 420)}
            declenchement={
              str(v, 'declenchement', 'vue') as 'montage' | 'vue' | 'survol'
            }
          >
            Un titre qui accroche
          </FoldText>
        }
      />
    ),
  },
  'text/fuzzy-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Le flou est l’apparence du texte, pas une étape : deux calques dephases fabriquent le grain, et le survol remet au point.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <FuzzyText
            blur={num(v, 'blur', 1.4)}
            amplitude={num(v, 'amplitude', 1.6)}
            period={num(v, 'period', 160)}
          >
            Un titre qui accroche
          </FuzzyText>
        }
      />
    ),
  },
  'text/masked-heading': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Un seul élément : le fond est découpe a la forme des glyphes, et le titre reste un titre — selectionnable, cherchable, annonce tel quel.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <MaskedHeading
            src={SAMPLE}
            zoom={num(v, 'zoom', 220)}
            speed={num(v, 'speed', 14000)}
          >
            Un titre qui accroche
          </MaskedHeading>
        }
      />
    ),
  },
  'text/particle-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Les cibles sont echantillonnees sur les glyphes eux-mêmes ; le canevas s’efface des l’assemblage fini et le texte reel reprend sa place.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <ParticleText
            key={JSON.stringify(v)}
            step={num(v, 'step', 5)}
            duration={num(v, 'duration', 1400)}
            spread={num(v, 'spread', 600)}
            declenchement={
              str(v, 'declenchement', 'vue') as 'montage' | 'vue' | 'survol'
            }
          >
            Un titre qui accroche
          </ParticleText>
        }
      />
    ),
  },
  'text/shuffle': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Ce sont les places qui sont melangees, pas les caractères : chaque lettre part de la place d’une autre, relevee sur le rendu.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <Shuffle
            key={JSON.stringify(v)}
            duration={num(v, 'duration', 800)}
            step={num(v, 'step', 35)}
            tilt={num(v, 'tilt', 20)}
            declenchement={
              str(v, 'declenchement', 'vue') as 'montage' | 'vue' | 'survol'
            }
          >
            Un titre qui accroche
          </Shuffle>
        }
      />
    ),
  },
  'text/scroll-float': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Le défilement ne commande pas la position des mots mais l’amplitude de leur dérive : au repos, ils se posent.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <ScrollFloat
            as="span"
            lift={num(v, 'lift', 26)}
            period={num(v, 'period', 3200)}
            course={num(v, 'course', 0.6)}
          >
            Un titre qui accroche
          </ScrollFloat>
        }
      />
    ),
  },
  'text/scroll-reveal': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Une seule variable écrite par image ; chaque mot y lit son propre cran, si bien que deux cents mots coûtent autant que cinq.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <ScrollReveal
            as="span"
            dim={num(v, 'dim', 0.18)}
            blur={num(v, 'blur', 4)}
            course={num(v, 'course', 0.7)}
          >
            Un titre qui accroche
          </ScrollReveal>
        }
      />
    ),
  },
  'effect/blob-cursor': {
    height: 'o-h-72',
    lead: 'La chaîne de boules est recollee par un filtre : elle s’etire quand le pointeur file, et se fond en une seule goutte des qu’il s’arrête.',
    render: (v, frame) => (
      <BlobCursor
        count={num(v, 'count', 4)}
        size={num(v, 'size', 48)}
        speed={num(v, 'speed', 14)}
        color={frame.color}
        className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-2 o-text-center"
      >
        <p className="o-text-xs o-uppercase o-tracking-wide o-opacity-70">Studio Odoro</p>
        <h4 className="o-text-lg o-font-semibold">Promenez le pointeur, puis arretez-vous</h4>
        <p className="o-max-w-sm o-text-sm o-opacity-70">
          La queue traine moins fort que la tête : c’est tout l’etirement.
        </p>
      </BlobCursor>
    ),
  },
  'effect/crosshair': {
    height: 'o-h-72',
    lead: 'Un viseur d’instrument : les traits collent au pointeur, laissent un vide au croisement, et relevent les coordonnees en pixels.',
    render: (v, frame) => (
      <Crosshair
        thickness={num(v, 'thickness', 1)}
        speed={num(v, 'speed', 20)}
        gap={num(v, 'gap', 16)}
        coords={v['coords'] !== false}
        color={frame.color}
        className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-2 o-text-center"
      >
        <h4 className="o-text-lg o-font-semibold">Plan de la salle B</h4>
        <p className="o-max-w-sm o-text-sm o-opacity-70">
          Pointez une rangee : le releve donne sa position dans le cadre.
        </p>
      </Crosshair>
    ),
  },
  'effect/ghost-cursor': {
    height: 'o-h-72',
    lead: 'La traînée relit un anneau de positions passees : elle epouse le trace exact, boucles comprises, au lieu de couper les virages.',
    render: (v, frame) => (
      <GhostCursor
        count={num(v, 'count', 10)}
        size={num(v, 'size', 14)}
        gap={num(v, 'gap', 3)}
        shape={str(v, 'shape', 'point') as 'point' | 'anneau' | 'carre'}
        color={frame.color}
        className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-2 o-text-center"
      >
        <h4 className="o-text-lg o-font-semibold">Dessinez une boucle</h4>
        <p className="o-max-w-sm o-text-sm o-opacity-70">
          Les fantomes passent là où le pointeur est passe, pas par le plus
          court chemin.
        </p>
      </GhostCursor>
    ),
  },
  'effect/glow-cursor': {
    height: 'o-h-80',
    lead: 'Une lumière, pas un contour : elle traine derrière le pointeur et s’allonge dans le sens du déplacement quand la main file.',
    render: (v) => (
      <GlowCursor
        size={num(v, 'size', 320)}
        speed={num(v, 'speed', 6)}
        intensity={num(v, 'intensity', 0.55)}
        trail={num(v, 'trail', 0.5)}
        color={str(v, 'color', GLOW_CURSOR_COLOR)}
        className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-3 o-text-center"
      >
        <p className="o-text-xs o-uppercase o-tracking-wide o-opacity-70">Sortie de version</p>
        <h4 className="o-text-lg o-font-semibold">Odoro 2.0 arrive en janvier</h4>
        <p className="o-max-w-md o-text-sm o-leading-relaxed o-opacity-70">
          Balayez vite le cadre : la lueur s’etire, et retrouve son rond dès que
          la main ralentit.
        </p>
      </GlowCursor>
    ),
  },
  'effect/splash-pointer': {
    height: 'o-h-72',
    lead: 'Chaque clic envoie des gouttes qui montent, ralentissent et retombent : la courbe est echantillonnee une fois et confiee au navigateur.',
    render: (v, frame) => (
      <Stage>
        <SplashPointer
          drops={num(v, 'drops', 14)}
          spread={num(v, 'spread', 90)}
          duration={num(v, 'duration', 700)}
          gravity={num(v, 'gravity', 1.4)}
          color={frame.color}
          className="o-w-full o-max-w-sm o-rounded-xl o-border-w-1 o-border-current o-p-8 o-text-center"
        >
          <h4 className="o-text-lg o-font-semibold">Cliquez n’importe ou ici</h4>
          <p className="o-mt-2 o-text-sm o-opacity-70">
            La couronne part du point touche, les gouttes retombent selon leur
            poids. Rien ne part sous mouvement réduit.
          </p>
        </SplashPointer>
      </Stage>
    ),
  },
  'effect/swarm-cursor': {
    height: 'o-h-72',
    lead: 'Chaque point a sa propre prise sur le pointeur : au repos ils forment un anneau qui tourne, dès que la main file la nuee s’etire en comete.',
    render: (v, frame) => (
      <SwarmCursor
        count={num(v, 'count', 12)}
        radius={num(v, 'radius', 40)}
        speed={num(v, 'speed', 0.4)}
        spread={num(v, 'spread', 0.65)}
        dotSize={num(v, 'dotSize', 6)}
        color={frame.color}
        className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-2 o-text-center"
      >
        <h4 className="o-text-lg o-font-semibold">Traversez le cadre, puis posez-vous</h4>
        <p className="o-max-w-sm o-text-sm o-opacity-70">
          La dispersion n’est pas animee : c’est la vitesse de la main qui la
          produit.
        </p>
      </SwarmCursor>
    ),
  },
  'effect/target-cursor': {
    height: 'o-h-80',
    lead: 'Au repos, quatre crochets tournent autour du pointeur ; sur une carte, ils s’écartent jusqu’à ses coins et la rotation s’annule.',
    render: (v, frame) => (
      <TargetCursor
        size={num(v, 'size', 32)}
        corner={num(v, 'corner', 12)}
        padding={num(v, 'padding', 8)}
        speed={num(v, 'speed', 14)}
        spin={num(v, 'spin', 0.12)}
        color={frame.color}
        className="o-absolute o-inset-0 o-grid o-grid-cols-3 o-gap-4 o-p-6"
      >
        {[
          ['Moteur', 'Une boucle unique, partagee par toute la page.'],
          ['Registre', 'Des composants copies, jamais lies.'],
          ['Styles', 'Une feuille generee depuis les tokens.'],
        ].map(([titre, texte]) => (
          <button
            key={titre}
            type="button"
            className="o-flex o-flex-col o-justify-center o-rounded-xl o-border-w-1 o-border-current o-p-5 o-text-left"
          >
            <span className="o-text-sm o-font-semibold">{titre}</span>
            <span className="o-mt-1 o-text-xs o-opacity-70">{texte}</span>
          </button>
        ))}
      </TargetCursor>
    ),
  },
  'effect/sticky-cursor': {
    height: 'o-h-64',
    lead: 'Une barre de navigation ou un seul jeton glisse d’un onglet a l’autre : la pastille prend la taille et l’arrondi du bouton survole.',
    render: (v, frame) => (
      <StickyCursor
        size={num(v, 'size', 20)}
        stick={num(v, 'stick', 0.3)}
        padding={num(v, 'padding', 6)}
        speed={num(v, 'speed', 16)}
        stretch={num(v, 'stretch', 0.45)}
        color={frame.color}
        className="o-absolute o-inset-0 o-flex o-items-center o-justify-center"
      >
        <nav className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-2 o-rounded-full o-border-w-1 o-border-current o-p-2">
          {['Apercu', 'Tarifs', 'Journal', 'Nous ecrire'].map((mot) => (
            <button
              key={mot}
              type="button"
              className="o-rounded-full o-px-5 o-py-2 o-text-sm o-font-medium"
            >
              {mot}
            </button>
          ))}
        </nav>
      </StickyCursor>
    ),
  },
  'effect/magnet-lines': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Chaque aiguille calcule l’angle qui la sépare du pointeur et le rejoint par le plus court chemin ; au-delà de la portée, elle revient a son angle de repos.',
    render: (v, frame) =>
      fill(
        <MagnetLines
          className="o-size-full"
          rows={num(v, 'rows', 9)}
          columns={num(v, 'columns', 9)}
          length={num(v, 'length', 26)}
          thickness={num(v, 'thickness', 2)}
          reach={num(v, 'reach', 260)}
          speed={num(v, 'speed', 10)}
          idle={num(v, 'idle', 0)}
          color={frame.color}
        />,
      ),
  },
  'effect/cursor-grid-dom': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'La grille magnetique en éléments du document : le pas commande le nombre de points, et chacun s’écarte du pointeur en s’allumant. Au-delà de neuf cents points, c’est le fond en shader qu’il faut poser.',
    render: (v, frame) =>
      fill(
        <CursorGridDom
          className="o-size-full"
          spacing={num(v, 'spacing', 28)}
          radius={num(v, 'radius', 140)}
          force={num(v, 'force', 12)}
          attract={v['attract'] === true}
          dotSize={num(v, 'dotSize', 3)}
          color={frame.color}
        />,
      ),
  },
  'background/splash-cursor': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'Promenez le curseur : chaque dépôt est une tache au contour bosselle par deux harmoniques basses de l’angle — plus hautes, elle tournerait a l’étoile — et deux taches qui se recouvrent melangent leurs teintes.',
    render: (v) =>
      fill(
        <SplashCursor
          className="o-size-full"
          colors={list(v, 'colors', SPLASH_CURSOR_TOKENS)}
          life={num(v, 'life', 1.8)}
          size={num(v, 'size', 0.16)}
          lobes={num(v, 'lobes', 0.6)}
        />,
      ),
  },
  'background/cursor-grid': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    lead: 'Deux positions du pointeur au lieu d’une : la vive allume les paves proches, la retardee laisse une traînée plus large derrière le geste — et chaque pave respire a sa propre phase.',
    render: (v) =>
      fill(
        <CursorGrid
          className="o-size-full"
          colors={list(v, 'colors', CURSOR_GRID_TOKENS)}
          cells={num(v, 'cells', 14)}
          radius={num(v, 'radius', 0.28)}
          trail={num(v, 'trail', 0.7)}
        />,
      ),
  },
  'background/pixel-trail': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    lead: 'C’est le centre du pixel qui est teste contre les dépôts, pas le fragment : toute la cellule prend la même valeur, et l’extinction descend par crans au lieu de se faner.',
    render: (v) =>
      fill(
        <PixelTrail
          className="o-size-full"
          colors={list(v, 'colors', PIXEL_TRAIL_TOKENS)}
          pixel={num(v, 'pixel', 26)}
          life={num(v, 'life', 1)}
          levels={num(v, 'levels', 4)}
        />,
      ),
  },
  'background/ghost-fibers': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    lead: 'L’attraction est une interpolation, pas une force : au droit du curseur la fibre est tiree vers son ordonnee, et elle retrouve son trace plus loin sans ressort ni mémoire.',
    render: (v) =>
      fill(
        <GhostFibers
          className="o-size-full"
          colors={list(v, 'colors', GHOST_FIBERS_TOKENS)}
          fibers={num(v, 'fibers', 9)}
          bend={num(v, 'bend', 0.7)}
          speed={num(v, 'speed', 0.6)}
        />,
      ),
  },
  'background/eye-follow': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    lead: 'La forme de l œil est l’intersection de deux disques — un max de deux distances signees, et les coins pointus viennent seuls ; le clignement ecrase le repère local, si bien que la paupiere n’a pas a être dessinee.',
    render: (v) =>
      fill(
        <EyeFollow
          className="o-size-full"
          colors={list(v, 'colors', EYE_FOLLOW_TOKENS)}
          eyes={num(v, 'eyes', 3)}
          gaze={num(v, 'gaze', 0.9)}
          blink={num(v, 'blink', 1)}
        />,
      ),
  },
  'background/metallic-paint': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'formulaire',
    lead: 'La lampe est au curseur : bouger le pointeur revient a incliner la plaque. Les stries sont un bruit lu sur un domaine etire, la normale en vient par differences finies, et les paillettes ne s’allument que là où le halo porte déjà.',
    render: (v) =>
      fill(
        <MetallicPaint
          className="o-size-full"
          colors={list(v, 'colors', METALLIC_PAINT_TOKENS)}
          relief={num(v, 'relief', 8)}
          sheen={num(v, 'sheen', 0.55)}
          flakes={num(v, 'flakes', 0.5)}
        />,
      ),
  },
  'background/elastic-mesh': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'hero',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Chaque nœud garde une vitesse : le laplacien de ses quatre voisins propage l’onde, un rappel la ramene a plat, et le pointeur la tire. Sans curseur, une goutte tombe de temps en temps.',
    render: (v) =>
      fill(
        <ElasticMesh
          className="o-size-full"
          colors={list(v, 'colors', ELASTIC_MESH_TOKENS)}
          density={num(v, 'density', 26)}
          pull={num(v, 'pull', 1)}
          springiness={num(v, 'springiness', 1)}
          drops={num(v, 'drops', 12)}
        />,
      ),
  },
  'background/floating-shapes': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'cartes',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'La parallaxe n’est pas un mouvement de camera : chaque solide se décale d’une part qui depend de sa profondeur, les proches beaucoup, les lointains à peine — c’est le seul indice qui sépare les plans.',
    render: (v) =>
      fill(
        <FloatingShapes
          className="o-size-full"
          colors={list(v, 'colors', FLOATING_SHAPES_TOKENS)}
          shapes={num(v, 'shapes', 18)}
          speed={num(v, 'speed', 1)}
          parallax={num(v, 'parallax', 1)}
        />,
      ),
  },
  'background/torus-knot': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'stats',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Le même solide est dessine dessous, opaque et de la couleur du fond : il masque les arretes de dos, et le nœud se lit en lignes cachees sans qu’aucune ligne soit calculee.',
    render: (v) =>
      fill(
        <TorusKnot
          className="o-size-full"
          colors={list(v, 'colors', TORUS_KNOT_TOKENS)}
          p={num(v, 'p', 2)}
          q={num(v, 'q', 3)}
          tube={num(v, 'tube', 0.3)}
          rpm={num(v, 'rpm', 3)}
          pulses={num(v, 'pulses', 4)}
        />,
      ),
  },
  'background/dna-helix': {
    height: 'o-h-96',
    demoByDefault: true,
    demoVariant: 'article',
    deferred: {
      label: 'Scene',
      hint: 'Cette scène télécharge environ 130 Ko compresses. L’interrupteur la monte quand vous le decidez.',
    },
    lead: 'Deux nuages de points opposes d’un demi-tour, et des barreaux un point sur six : des points plutôt qu’un tube, sans quoi le brin de devant cacherait celui de derrière et l’helice se lirait comme un ruban.',
    render: (v) =>
      fill(
        <DnaHelix
          className="o-size-full"
          colors={list(v, 'colors', DNA_HELIX_TOKENS)}
          turns={num(v, 'turns', 4)}
          points={num(v, 'points', 220)}
          rpm={num(v, 'rpm', 3)}
          rungs={num(v, 'rungs', 6)}
        />,
      ),
  },
  'loader/split-curtain': {
    height: 'o-h-96',
    lead: 'La couture au milieu dit ou l’ouverture va se produire avant qu’elle commence ; les deux pans partent alors en sens opposes, et la page entre dans l’écart.',
    render: (v, frame) => (
      <CadreRideau>
        <SplitCurtain
          contained
          ink={frame.color}
          axis={str(v, 'axis', 'horizontal') as 'horizontal' | 'vertical'}
          holdMs={num(v, 'holdMs', 1200)}
          exitMs={num(v, 'exitMs', 900)}
          label={<span className="o-text-2xl o-font-semibold o-tracking-tight">Odoro</span>}
        />
      </CadreRideau>
    ),
  },
  'loader/iris-open': {
    height: 'o-h-96',
    lead: 'Ce ne sont pas des formes decoupees mais des lames : elles glissent vers l’exterieur pendant que l’ensemble tourne, et l’ouverture est un polygone qui grandit en tournant.',
    render: (v, frame) => (
      <CadreRideau>
        <IrisOpen
          contained
          ink={frame.color}
          blades={num(v, 'blades', 6)}
          turn={num(v, 'turn', 26)}
          holdMs={num(v, 'holdMs', 1200)}
          exitMs={num(v, 'exitMs', 1000)}
          label={<span className="o-text-2xl o-font-semibold o-tracking-tight">Odoro</span>}
        />
      </CadreRideau>
    ),
  },
  'loader/wipe-diagonal': {
    height: 'o-h-96',
    lead: 'Une seule arete, inclinee, et un filet qui la souligne : la course est mesuree sur le format du cadre, donc le balayage occupe exactement la durée annoncee.',
    render: (v, frame) => (
      <CadreRideau>
        <WipeDiagonal
          contained
          ink={frame.color}
          direction={str(v, 'direction', 'left') as 'left' | 'right'}
          slant={num(v, 'slant', 14)}
          holdMs={num(v, 'holdMs', 1200)}
          exitMs={num(v, 'exitMs', 800)}
          label={<span className="o-text-2xl o-font-semibold o-tracking-tight">Odoro</span>}
        />
      </CadreRideau>
    ),
  },
  'loader/blinds': {
    height: 'o-h-96',
    lead: 'Les lames basculent de chant sous un point de fuite commun, de haut en bas : la sortie dure la bascule d’une lame plus le décalage de toutes les autres.',
    render: (v, frame) => (
      <CadreRideau>
        <Blinds
          contained
          ink={frame.color}
          slats={num(v, 'slats', 10)}
          stagger={num(v, 'stagger', 55)}
          holdMs={num(v, 'holdMs', 1200)}
          exitMs={num(v, 'exitMs', 700)}
          label={<span className="o-text-2xl o-font-semibold o-tracking-tight">Odoro</span>}
        />
      </CadreRideau>
    ),
  },
  'loader/pixel-dissolve': {
    height: 'o-h-96',
    lead: 'L’ordre de disparition vient d’un pas d’or, pas d’un tirage au sort : deux carreaux voisins partent loin l’un de l’autre, et la dissolution n’a pas de grumeaux.',
    render: (v, frame) => (
      <CadreRideau>
        <PixelDissolve
          contained
          ink={frame.color}
          columns={num(v, 'columns', 20)}
          rows={num(v, 'rows', 12)}
          spreadMs={num(v, 'spreadMs', 700)}
          holdMs={num(v, 'holdMs', 1200)}
          exitMs={num(v, 'exitMs', 420)}
          label={<span className="o-text-2xl o-font-semibold o-tracking-tight">Odoro</span>}
        />
      </CadreRideau>
    ),
  },
  'loader/bar-gate': {
    height: 'o-h-96',
    lead: 'Une barre sans chiffre, avancee par l’horloge du moteur : elle mesure une durée et ne pretend pas mesurer autre chose. Le rideau s’ecrase ensuite dans la ligne qui l’a mesure.',
    render: (v, frame) => (
      <CadreRideau>
        <BarGate
          contained
          ink={frame.color}
          segments={num(v, 'segments', 20)}
          holdMs={num(v, 'holdMs', 1600)}
          exitMs={num(v, 'exitMs', 850)}
          label={<span className="o-text-2xl o-font-semibold o-tracking-tight">Odoro</span>}
        />
      </CadreRideau>
    ),
  },
  'loader/shutter': {
    height: 'o-h-96',
    lead: 'Une lamelle sur deux monte, l’autre descend : c’est l’alternance qui rend le geste lisible, là où une translation commune se lirait comme un simple fondu vers le haut.',
    render: (v, frame) => (
      <CadreRideau>
        <Shutter
          contained
          ink={frame.color}
          blades={num(v, 'blades', 12)}
          stagger={num(v, 'stagger', 32)}
          holdMs={num(v, 'holdMs', 1200)}
          exitMs={num(v, 'exitMs', 750)}
          label={<span className="o-text-2xl o-font-semibold o-tracking-tight">Odoro</span>}
        />
      </CadreRideau>
    ),
  },
  'loader/zoom-gate': {
    height: 'o-h-96',
    lead: 'La marque vient vers l œil pendant que la plaque recule dans la perspective ; l’opacité n’arrive qu’a la moitie de la course, pour que le rideau reste un objet jusque-la.',
    render: (v, frame) => (
      <CadreRideau>
        <ZoomGate
          contained
          ink={frame.color}
          punch={num(v, 'punch', 3.2)}
          depth={num(v, 'depth', 900)}
          holdMs={num(v, 'holdMs', 1200)}
          exitMs={num(v, 'exitMs', 900)}
          label={<span className="o-text-2xl o-font-semibold o-tracking-tight">Odoro</span>}
        />
      </CadreRideau>
    ),
  },
  'loader/fade-gate': {
    height: 'o-h-96',
    lead: 'Le seul du lot qui assume d’être un voile, et le moins cher. Montez le flou : il devient depoli, et la page se met au point derrière lui.',
    render: (v, frame) => (
      <CadreRideau>
        <FadeGate
          contained
          ink={frame.color}
          blurPx={num(v, 'blurPx', 0)}
          holdMs={num(v, 'holdMs', 1000)}
          exitMs={num(v, 'exitMs', 700)}
          label={<span className="o-text-2xl o-font-semibold o-tracking-tight">Odoro</span>}
        />
      </CadreRideau>
    ),
  },
  'loader/letters-gate': {
    height: 'o-h-96',
    lead: 'Le mot s’assemble caractère par caractère sur l’horloge du moteur — une écriture par lettre, aucun rendu par image — puis la plaque se rabat comme un couvercle.',
    render: (v, frame) => (
      <CadreRideau>
        <LettersGate
          contained
          ink={frame.color}
          word={str(v, 'word', 'ODORO')}
          letterMs={num(v, 'letterMs', 130)}
          holdMs={num(v, 'holdMs', 650)}
          exitMs={num(v, 'exitMs', 900)}
        />
      </CadreRideau>
    ),
  },
  'effect/glare-hover': {
    height: 'o-h-80',
    lead: 'Survolez une carte : une bande de lumière la traverse une fois, puis attend le survol suivant. Le declenchement est dans la feuille, pas dans un état React.',
    render: (v, frame) => (
      <div className="o-absolute o-inset-0 o-grid o-grid-cols-2 o-gap-4 o-p-6">
        {[
          ['Carte plastifiee', 'Le reflet part du bord et sort par l autre.'],
          ['Au clavier aussi', 'Le focus dans la carte declenche la meme chose.'],
          ['Sans rendu', 'Aucun etat React ne bouge pendant la traversee.'],
          ['Cumulable', 'Le halo de pointeur peut se poser par-dessus.'],
        ].map(([titre, texte]) => (
          <GlareHover
            key={titre}
            duration={num(v, 'duration', 700)}
            angle={num(v, 'angle', 115)}
            width={num(v, 'width', 14)}
            color={frame.color}
            loop={Boolean(v['loop'] ?? false)}
            className="o-flex o-flex-col o-justify-center o-rounded-xl o-border-w-1 o-border-current o-p-5"
          >
            <h4 className="o-text-sm o-font-semibold">{titre}</h4>
            <p className="o-mt-1 o-text-xs o-opacity-70">{texte}</p>
          </GlareHover>
        ))}
      </div>
    ),
  },
  'effect/gradual-blur': {
    height: 'o-h-96',
    lead: 'Faites defiler la liste : le bas se voile d’un flou qui s’epaissit vers le bord, et s’efface tout seul quand la fin est atteinte.',
    render: (v) => (
      <Stage>
        <GradualBlur
          key={JSON.stringify(v)}
          side={str(v, 'side', 'bottom') as 'bottom' | 'top' | 'left' | 'right'}
          size={num(v, 'size', 96)}
          strength={num(v, 'strength', 10)}
          layers={num(v, 'layers', 5)}
          className="o-h-64 o-w-full o-max-w-sm o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800"
        >
          <ul className="o-p-4 o-text-left o-text-sm">
            {[
              'Cadrage du projet',
              'Entretiens avec les equipes',
              'Inventaire des composants',
              'Maquette de la page de garde',
              'Passage en revue des tokens',
              'Integration du registre',
              'Recette sur trois navigateurs',
              'Mise en ligne',
              'Retour des premiers usages',
              'Correctifs et derniers reglages',
            ].map((ligne) => (
              <li key={ligne} className="o-py-2">
                {ligne}
              </li>
            ))}
          </ul>
        </GradualBlur>
      </Stage>
    ),
  },
  'effect/halftone-reveal': {
    height: 'o-h-96',
    lead: 'Defilez dans le cadre : la trame s’allege point par point, puis quitte le DOM. Sous mouvement réduit, le contenu est visible d’emblee.',
    render: (v) => (
      <Scroller hauteur="230%">
        <div className="o-flex o-h-full o-flex-col o-justify-center o-gap-6 o-p-8">
          <p className="o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Defilez vers le bas
          </p>
          <HalftoneReveal
            key={JSON.stringify(v)}
            cell={num(v, 'cell', 16)}
            travel={num(v, 'travel', 0.55)}
            offset={num(v, 'offset', 0.15)}
            className="o-rounded-xl"
          >
            <Frame src={SAMPLE} alt="" ratio={16 / 9} className="o-w-full o-rounded-xl" />
          </HalftoneReveal>
          <p className="o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            La trame se retire au fil de la remontee dans le champ.
          </p>
        </div>
      </Scroller>
    ),
  },
  'effect/laser-flow': {
    height: 'o-h-72',
    lead: 'Un faisceau traverse le cadre en boucle : un cœur net de deux pixels, et une nappe cent fois plus large qui l’accompagne.',
    render: (v, frame) => (
      <Stage>
        <LaserFlow
          duration={num(v, 'duration', 3200)}
          angle={num(v, 'angle', 14)}
          width={num(v, 'width', 2)}
          glow={num(v, 'glow', 90)}
          color={frame.color}
          frame={v['frame'] !== false}
          className="o-w-full o-max-w-sm o-rounded-xl o-border-w-1 o-border-current o-p-8"
        >
          <h4 className="o-text-sm o-font-semibold">Analyse en cours</h4>
          <p className="o-mt-1 o-text-xs o-opacity-70">
            Quatre cent douze fichiers relus, trois écarts de contrat trouves.
          </p>
        </LaserFlow>
      </Stage>
    ),
  },
  'effect/magic-rings': {
    height: 'o-h-80',
    lead: 'Cliquez n’importe ou dans le cadre : une salve d’anneaux part du point touche, dates par l’horloge du moteur — la même que celle du dessin.',
    render: (v, frame) => (
      <MagicRings
        rings={num(v, 'rings', 3)}
        duration={num(v, 'duration', 1200)}
        size={num(v, 'size', 260)}
        thickness={num(v, 'thickness', 2)}
        gap={num(v, 'gap', 130)}
        color={frame.color}
        className="o-absolute o-inset-0 o-flex o-items-center o-justify-center"
      >
        <p className="o-text-sm o-opacity-60">Cliquez ici</p>
      </MagicRings>
    ),
  },
  'effect/pixel-swap': {
    height: 'o-h-80',
    lead: 'Deux photos se disputent la même grille : une part réglée des cellules montre la seconde, et ce ne sont jamais les mêmes. Rien n’arrive jamais a son terme.',
    render: (v) => (
      <Stage>
        <PixelSwap
          key={JSON.stringify(v)}
          from={TRAIL_SOURCES[0]?.src ?? SAMPLE}
          to={TRAIL_SOURCES[1]?.src ?? SAMPLE}
          alt="Première planche de la série"
          cells={num(v, 'cells', 14)}
          rate={num(v, 'rate', 12)}
          mix={num(v, 'mix', 0.16)}
          fade={num(v, 'fade', 240)}
          className="o-aspect-video o-w-full o-max-w-md o-rounded-xl"
        />
      </Stage>
    ),
  },
  'effect/pixel-transition': {
    height: 'o-h-80',
    lead: 'Le damier couvre le premier contenu en deux vagues entrelacees, l’échange a lieu derrière lui, puis il se retire dans l’ordre inverse.',
    render: (v, frame) => (
      <Stage>
        <PixelTransition
          key={JSON.stringify(v)}
          cells={num(v, 'cells', 12)}
          duration={num(v, 'duration', 520)}
          trigger={str(v, 'trigger', 'hover') as 'hover' | 'click' | 'view'}
          color={frame.color}
          className="o-aspect-video o-w-full o-max-w-md o-rounded-xl"
          from={
            <img
              src={TRAIL_SOURCES[0]?.src ?? SAMPLE}
              alt="La pochette de l’album"
              className="o-size-full o-object-cover"
            />
          }
          to={
            <img
              src={TRAIL_SOURCES[2]?.src ?? SAMPLE}
              alt="Le verso, avec la liste des titres"
              className="o-size-full o-object-cover"
            />
          }
        />
      </Stage>
    ),
  },
  'effect/ripple-distortion': {
    height: 'o-h-96',
    lead: 'Promenez le pointeur : les ondes naissent sous lui et deforment les bandes qu’elles portent. Le texte, lui, reste net — c’est le sol qui ondule.',
    render: (v) => (
      <div className="o-absolute o-inset-0">
        <RippleDistortion
          speed={num(v, 'speed', 1)}
          scale={num(v, 'scale', 26)}
          amount={num(v, 'amount', 0.5)}
          damping={num(v, 'damping', 3)}
          colors={list(v, 'colors', RIPPLE_TOKENS)}
          className="o-flex o-size-full o-items-center o-justify-center o-p-8"
        >
          <h3 className="o-text-lg o-font-semibold">Le texte ne bouge pas</h3>
        </RippleDistortion>
      </div>
    ),
  },
  'effect/shape-blur': {
    height: 'o-h-80',
    lead: 'Une silhouette floue dérive derrière le contenu, en retard sur le pointeur. On reconnait une forme, pas une lampe.',
    render: (v) => (
      <div className="o-absolute o-inset-0">
        <ShapeBlur
          shape={
            str(v, 'shape', 'hexagon') as 'circle' | 'square' | 'triangle' | 'hexagon'
          }
          size={num(v, 'size', 240)}
          blur={num(v, 'blur', 44)}
          speed={num(v, 'speed', 2)}
          className="o-flex o-size-full o-flex-col o-items-center o-justify-center o-gap-2 o-p-8"
        >
          <h3 className="o-text-lg o-font-semibold">Une section ordinaire</h3>
          <p className="o-text-sm o-opacity-70">Le décor traine derrière la main.</p>
        </ShapeBlur>
      </div>
    ),
  },
  'effect/sticker-peel': {
    height: 'o-h-80',
    lead: 'Le coin est retire au contenu par une découpe, puis repose a côté dans la couleur du dos : la matière passe de l’un a l’autre au lieu de se dedoubler.',
    render: (v) => (
      <Stage>
        <StickerPeel
          corner={
            str(v, 'corner', 'top-right') as
              | 'top-right'
              | 'top-left'
              | 'bottom-right'
              | 'bottom-left'
          }
          size={num(v, 'size', 72)}
          duration={num(v, 'duration', 420)}
          peeled={Boolean(v['peeled'] ?? false)}
          className="o-w-64"
        >
          <div className="o-rounded-xl o-bg-brand-500 o-p-6 o-text-zinc-50">
            <h4 className="o-text-sm o-font-semibold">Offre de lancement</h4>
            <p className="o-mt-1 o-text-xs o-opacity-80">
              Survolez la carte : le coin se souleve, et son ombre avec.
            </p>
          </div>
        </StickerPeel>
      </Stage>
    ),
  },
  'ui/masonry': {
    height: 'o-h-96',
    lead: 'Les colonnes sont celles du navigateur : rien n’est mesure, rien n’est pose en absolu. Descendez dans le cadre — chaque vignette est liberee a son entrée par un attribut, jamais par un rendu React.',
    render: (v) => (
      <Scroller>
        <div className="o-p-6">
          <Masonry
            label="Planches du dossier de presse"
            items={PLANCHES}
            columns={num(v, 'columns', 3)}
            minWidth={num(v, 'minWidth', 200)}
            gap={num(v, 'gap', 16)}
            stagger={num(v, 'stagger', 90)}
            className="o-text-left o-text-zinc-900 dark:o-text-zinc-50"
          />
        </div>
      </Scroller>
    ),
  },
  'ui/circular-gallery': {
    height: 'o-h-96',
    lead: 'Poussez le ruban au doigt ou a la molette : le glisser, l’inertie et le calage sont ceux du navigateur, seule la courbe du cylindre est peinte. Les fleches avancent d’une image, et seule celle du centre porte sa legende.',
    controls: [
      { kind: 'range', name: 'width', label: 'Largeur', min: 120, max: 480, step: 10, value: 220, unit: 'px' },
      { kind: 'range', name: 'height', label: 'Hauteur', min: 140, max: 560, step: 10, value: 240, unit: 'px' },
      { kind: 'range', name: 'gap', label: 'Ecart', min: 0, max: 80, step: 4, value: 24, unit: 'px' },
      { kind: 'range', name: 'curve', label: 'Courbure', min: 0, max: 60, step: 1, value: 26, unit: 'deg' },
      { kind: 'range', name: 'depth', label: 'Recul', min: 0, max: 400, step: 10, value: 120, unit: 'px' },
    ],
    render: (v) => (
      <div className="o-absolute o-inset-0 o-flex o-items-center">
        <CircularGallery
          label="Collection printemps"
          items={PLANCHES}
          width={num(v, 'width', 220)}
          height={num(v, 'height', 240)}
          gap={num(v, 'gap', 24)}
          curve={num(v, 'curve', 26)}
          depth={num(v, 'depth', 120)}
          className="o-w-full o-text-zinc-900 dark:o-text-zinc-50"
        />
      </div>
    ),
  },
  'ui/dome-gallery': {
    height: 'o-h-96',
    lead: 'Tirez dans le cadre, ou tournez aux fleches : chaque image porte une transformation fixe, et la boucle n’écrit que la rotation du dome entier. Ce qui passe derrière disparaît par sa face cachee, sans un calcul.',
    controls: [
      { kind: 'range', name: 'radius', label: 'Rayon', min: 220, max: 900, step: 20, value: 300, unit: 'px' },
      { kind: 'range', name: 'columns', label: 'Par rangee', min: 3, max: 12, step: 1, value: 6 },
      { kind: 'range', name: 'pitch', label: 'Entre rangees', min: 10, max: 60, step: 2, value: 34, unit: 'deg' },
      { kind: 'range', name: 'tile', label: 'Image', min: 100, max: 320, step: 10, value: 130, unit: 'px' },
    ],
    render: (v) =>
      fill(
        <DomeGallery
          label="Panorama de l’atelier"
          items={PLANCHES}
          radius={num(v, 'radius', 300)}
          columns={num(v, 'columns', 6)}
          pitch={num(v, 'pitch', 34)}
          tile={num(v, 'tile', 130)}
          className="o-size-full"
        />,
      ),
  },
  'ui/depth-carousel': {
    height: 'o-h-96',
    lead: 'Une affiche de devant, les autres rangees derrière elle. Les boutons, les fleches et le glisser changent de cran ; pendant le geste, c’est le plateau entier qui suit le doigt, une transformation et pas une par affiche.',
    controls: [
      { kind: 'range', name: 'width', label: 'Largeur', min: 120, max: 520, step: 10, value: 160, unit: 'px' },
      { kind: 'range', name: 'spread', label: 'Ecart', min: 0, max: 200, step: 2, value: 70, unit: 'px' },
      { kind: 'range', name: 'depth', label: 'Recul', min: 0, max: 400, step: 10, value: 120, unit: 'px' },
      { kind: 'range', name: 'tilt', label: 'Trois quarts', min: 0, max: 70, step: 1, value: 32, unit: 'deg' },
      { kind: 'range', name: 'visible', label: 'Visibles', min: 1, max: 6, step: 1, value: 3 },
    ],
    render: (v) => (
      <Stage>
        <DepthCarousel
          label="Affiches du festival"
          items={PLANCHES}
          defaultIndex={2}
          width={num(v, 'width', 160)}
          spread={num(v, 'spread', 70)}
          depth={num(v, 'depth', 120)}
          tilt={num(v, 'tilt', 32)}
          visible={num(v, 'visible', 3)}
          className="o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'ui/flying-posters': {
    height: 'o-h-96',
    lead: 'Faites defiler dans le cadre : l’affiche arrive du fond en s’inclinant, se pose de face au milieu, puis file vers vous en s’effacant. La lucarne qui défile sert de référence, pas la fenêtre.',
    controls: [
      { kind: 'range', name: 'width', label: 'Affiche', min: 160, max: 600, step: 10, value: 190, unit: 'px' },
      { kind: 'range', name: 'depth', label: 'Fond', min: 0, max: 900, step: 20, value: 420, unit: 'px' },
      { kind: 'range', name: 'tilt', label: 'Inclinaison', min: 0, max: 60, step: 1, value: 22, unit: 'deg' },
      { kind: 'range', name: 'drift', label: 'Écart lateral', min: 0, max: 240, step: 10, value: 60, unit: 'px' },
      { kind: 'range', name: 'gap', label: 'Espacement', min: 0, max: 320, step: 8, value: 56, unit: 'px' },
    ],
    render: (v) => (
      <Scroller>
        <div className="o-p-8">
          <FlyingPosters
            label="Affiches de la saison"
            items={PLANCHES}
            width={num(v, 'width', 190)}
            depth={num(v, 'depth', 420)}
            tilt={num(v, 'tilt', 22)}
            drift={num(v, 'drift', 60)}
            gap={num(v, 'gap', 56)}
          />
        </div>
      </Scroller>
    ),
  },
  'ui/glass-surface': {
    height: 'o-h-80',
    lead: 'Le panneau est pose sur une image, parce que du verre pose sur un aplat ne montre rien. L’épaisseur se lit sur les aretes, pas dans le flou ; sans flou de fond, la plaque se ferme et redevient lisible.',
    render: (v, frame) => (
      <div className="o-absolute o-inset-0">
        <img src={SAMPLE} alt="" className="o-size-full o-object-cover" />
        <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-p-8">
          <GlassSurface
            colors={list(v, 'colors', GLASS_SURFACE_TOKENS)}
            blur={num(v, 'blur', 16)}
            tint={num(v, 'tint', 0.14)}
            thickness={num(v, 'thickness', 1)}
            sheen={Boolean(v['sheen'] ?? true)}
            className="o-max-w-sm o-text-left o-text-zinc-50"
            style={{ borderRadius: `${String(frame.radius)}px` }}
          >
            <p className="o-text-base o-font-medium">Prochaine seance</p>
            <p className="o-mt-1 o-text-sm o-opacity-80">
              Jeudi 12 mars, vingt heures, grande salle.
            </p>
          </GlassSurface>
        </div>
      </div>
    ),
  },
  'ui/glass-icons': {
    height: 'o-h-80',
    lead: 'La lueur est peinte avant la pastille, donc dans son arriere-plan : c’est le verre qui l’etale. Survolez, ou tabulez — le pivot est le même état pour la souris et pour le clavier.',
    render: (v) => (
      <div className="o-absolute o-inset-0">
        <img src={SAMPLE} alt="" className="o-size-full o-object-cover" />
        <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-p-8">
          <GlassIcons
            label="Raccourcis"
            onSelect={() => undefined}
            items={[
              { id: 'agenda', label: 'Agenda', icon: <Icon icon={Calendar} /> },
              { id: 'messages', label: 'Messages', icon: <Icon icon={Mail} /> },
              { id: 'photos', label: 'Photos', icon: <Icon icon={Camera} /> },
              { id: 'trajets', label: 'Trajets', icon: <Icon icon={MapPin} /> },
            ]}
            colors={list(v, 'colors', GLASS_ICONS_TOKENS)}
            size={num(v, 'size', 76)}
            blur={num(v, 'blur', 10)}
            tilt={num(v, 'tilt', 16)}
            className="o-text-zinc-50"
          />
        </div>
      </div>
    ),
  },
  'ui/folder': {
    height: 'o-h-96',
    lead: 'Le rabat est un bouton : il porte aria-expanded et ouvre la liste des fiches. Fermees, les fiches sont hors de l’ordre de tabulation — un contenu replie ne doit pas garder le focus derrière le carton.',
    render: (v) => (
      <Stage>
        <Folder
          label="Dossier client"
          items={[
            { id: 'contrat', label: 'Contrat signe', hint: 'PDF' },
            { id: 'devis', label: 'Devis de mars', hint: 'PDF' },
            { id: 'photos', label: 'Photos du chantier', hint: '48' },
          ]}
          colors={list(v, 'colors', FOLDER_TOKENS)}
          width={num(v, 'width', 220)}
          spread={num(v, 'spread', 8)}
          rise={num(v, 'rise', 62)}
          className="o-text-left o-text-zinc-900 dark:o-text-zinc-50"
        />
      </Stage>
    ),
  },
  'image/image-mask-text': {
    height: 'o-h-96',
    lead: 'Le mot est du vrai texte, rempli par la photo ; promenez le pointeur, le halo ouvre le voile autour de lui.',
    render: (v) => (
      <Stage>
        <ImageMaskText
          src={SAMPLE}
          alt="Image de démonstration"
          text="ODORO"
          ratio={num(v, 'ratio', 1.777)}
          size={num(v, 'size', 18)}
          veil={num(v, 'veil', 0.92)}
          halo={num(v, 'halo', 190)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/lens-zoom': {
    height: 'o-h-96',
    lead: 'Le disque montre la même image agrandie a l’endroit survole : le cadre, lui, garde sa vue d’ensemble.',
    render: (v) => (
      <Stage>
        <LensZoom
          src={SAMPLE}
          alt="Image de démonstration"
          ratio={num(v, 'ratio', 1.777)}
          zoom={num(v, 'zoom', 2.5)}
          size={num(v, 'size', 180)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/color-shift': {
    height: 'o-h-96',
    lead: 'Le cadre est une table de réglage : à gauche et à droite les teintes tournent, en haut et en bas la saturation monte et tombe.',
    render: (v) => (
      <Stage>
        <ColorShift
          src={SAMPLE}
          alt="Image de démonstration"
          ratio={num(v, 'ratio', 1.777)}
          shift={num(v, 'shift', 140)}
          saturate={num(v, 'saturate', 1.6)}
          duration={num(v, 'duration', 220)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/ascii-image': {
    height: 'o-h-96',
    lead: 'La photo est lue une fois dans un canevas hors du document et rendue en caractères ; survolez, elle revient.',
    render: (v) => (
      <Stage>
        <AsciiImage
          key={JSON.stringify(v)}
          src={SAMPLE}
          alt="Image de démonstration"
          ratio={num(v, 'ratio', 1.777)}
          columns={num(v, 'columns', 90)}
          contrast={num(v, 'contrast', 1.3)}
          invert={v['invert'] === true}
          hover={v['hover'] !== false}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/image-particles': {
    height: 'o-h-96',
    lead: 'Les points partent disperses et rejoignent leur place : chacun porte la couleur de sa cellule dans l’image.',
    render: (v) => (
      <Stage>
        <ImageParticles
          key={JSON.stringify(v)}
          src={SAMPLE}
          alt="Image de démonstration"
          ratio={num(v, 'ratio', 1.777)}
          density={num(v, 'density', 140)}
          size={num(v, 'size', 1.1)}
          scatter={num(v, 'scatter', 0.7)}
          duration={num(v, 'duration', 1600)}
          speed={num(v, 'speed', 0.6)}
          parallax={num(v, 'parallax', 0.16)}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/image-stack-swipe': {
    height: 'o-h-96',
    lead: 'Glissez la carte du dessus vers un bord, ou donnez le focus a la pile et employez les fleches : l’image arrivee est annoncee.',
    render: (v) => (
      <Stage>
        <ImageStackSwipe
          key={JSON.stringify(v)}
          images={TRAIL_SOURCES}
          ratio={num(v, 'ratio', 1.4)}
          threshold={num(v, 'threshold', 90)}
          depth={num(v, 'depth', 2)}
          offset={num(v, 'offset', 16)}
          className="o-h-64 o-rounded-lg"
        />
      </Stage>
    ),
  },
  'image/scroll-reveal-image': {
    height: 'o-h-96',
    lead: 'Defilez dans le cadre : le rideau suit la position, s’arrête au milieu et se referme si vous remontez.',
    render: (v) => (
      <Scroller hauteur="240%">
        <div className="o-flex o-h-full o-flex-col o-justify-center o-gap-6 o-p-8">
          <p className="o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Defilez vers le bas
          </p>
          <ScrollRevealImage
            key={JSON.stringify(v)}
            src={SAMPLE}
            alt="Image de démonstration"
            ratio={num(v, 'ratio', 1.777)}
            direction={
              ['up', 'down', 'left', 'right'].includes(str(v, 'direction', 'up'))
                ? (str(v, 'direction', 'up') as 'up' | 'down' | 'left' | 'right')
                : 'up'
            }
            span={num(v, 'span', 0.55)}
            edge={v['edge'] !== false}
            className="o-mx-auto o-w-full o-max-w-md o-rounded-lg"
          />
          <p className="o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            et remontez : le rideau se referme.
          </p>
        </div>
      </Scroller>
    ),
  },
  'image/image-glitch': {
    height: 'o-h-96',
    lead: 'Survolez : deux fantomes teintes se decalent par tranches, en paliers, tant que le pointeur reste.',
    render: (v) => (
      <Stage>
        <ImageGlitch
          src={SAMPLE}
          alt="Image de démonstration"
          ratio={num(v, 'ratio', 1.777)}
          intensity={num(v, 'intensity', 10)}
          duration={num(v, 'duration', 1400)}
          hover={v['hover'] !== false}
          className="o-w-full o-max-w-md o-rounded-lg"
        />
      </Stage>
    ),
  },
  'section/testimonials-columns': {
    height: 'o-h-[34rem]',
    lead: 'Deux sens opposes retirent au mur son sens de lecture ; le survol et le focus arrêtent la colonne qu’on lit.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-p-6">
        <TestimonialsColumns
          key={JSON.stringify(v)}
          label="Ce qu’on en dit"
          columns={num(v, 'columns', 3)}
          duration={num(v, 'duration', 40000)}
          height={num(v, 'height', 480)}
          items={SC1_TEMOIGNAGES}
        />
      </div>
    ),
  },
  'section/bento-grid': {
    height: 'o-h-[34rem]',
    lead: 'Des tuiles inegales retablissent une hiérarchie ; la largeur est bornee par la grille, jamais laissee deborder.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-6">
        <BentoGrid
          key={JSON.stringify(v)}
          label="Ce que le registre garantit"
          columns={num(v, 'columns', 4)}
          rowHeight={num(v, 'rowHeight', 180)}
          stagger={num(v, 'stagger', 60)}
          items={[
            {
              id: 'copie',
              title: 'Le code vous appartient',
              cols: 2,
              featured: true,
              body: <p>Les fichiers sont copies dans le projet, jamais liés a un paquet.</p>,
            },
            {
              id: 'repli',
              title: 'Un repli toujours prevu',
              body: <p>Sans WebGL, la scène montre son dégradé.</p>,
            },
            {
              id: 'contrat',
              title: 'Cinq niveaux de réglage',
              body: <p>Du token a l’echappatoire imperative.</p>,
            },
            {
              id: 'schema',
              title: 'Le schema refuse l’invalide',
              cols: 2,
              body: <p>Un coût élève sans repli déclare ne se publie pas.</p>,
            },
            {
              id: 'theme',
              title: 'Clair et sombre',
              body: <p>Les neutres passent par les variables de thème.</p>,
            },
            {
              id: 'diff',
              title: 'Vos retouches sont suivies',
              body: <p>La commande de comparaison les signale.</p>,
            },
          ]}
        />
      </div>
    ),
  },
  'section/feature-tabs': {
    height: 'o-h-[30rem]',
    lead: 'Un seul arrêt de tabulation pour toute la liste, les fleches bouclent, et le panneau inactif n’est pas dans le document.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-6">
        <FeatureTabs
          label="Ce que fait la commande"
          initial={num(v, 'initial', 0)}
          features={[
            {
              title: 'Ajouter',
              hint: 'odoro add',
              body: (
                <p>
                  Les fichiers de l’entrée sont copies dans votre dossier de composants,
                  avec ses dependances de registre. Rien n’est ajoute a vos dependances.
                </p>
              ),
            },
            {
              title: 'Comparer',
              hint: 'odoro diff',
              body: (
                <p>
                  Chaque retouche locale est signalee ligne a ligne, pour que la mise a
                  jour d’amont ne l’efface pas sans le dire.
                </p>
              ),
            },
            {
              title: 'Vérifier',
              hint: 'odoro doctor',
              body: (
                <p>
                  Les tokens manquants, les classes inexistantes et les couleurs écrites
                  en dur sont refuses avant qu’ils n’atteignent une page.
                </p>
              ),
            },
          ]}
          render={(index) => (
            <div className="o-flex o-aspect-video o-items-center o-justify-center o-bg-gradient-to-br o-from-brand-600 o-to-fuchsia-600 o-text-5xl o-font-bold o-text-white">
              {index + 1}
            </div>
          )}
        />
      </div>
    ),
  },
  'section/timeline': {
    height: 'o-h-96',
    lead: 'Le trait suit le milieu du champ : le jalon s’allume au moment ou le trait l’atteint, par construction.',
    render: () => (
      <Scroller hauteur="200%">
        <div className="o-p-6">
          <Timeline
            label="Histoire du registre"
            title="Ce qui s’est passe"
            events={[
              {
                date: 'Janvier 2024',
                dateTime: '2024-01',
                title: 'Première entrée',
                body: <p>Un dossier, un meta, une source. Le format ne bougera plus.</p>,
              },
              {
                date: 'Juin 2024',
                dateTime: '2024-06',
                title: 'Le contrat prend cinq niveaux',
                body: <p>Du token a l’echappatoire, chacun avec sa distance.</p>,
              },
              {
                date: 'Novembre 2024',
                dateTime: '2024-11',
                title: 'La validation devient un script',
                body: <p>Elle tourne avant chaque publication, pas seulement en test.</p>,
              },
              {
                date: 'Mars 2025',
                dateTime: '2025-03',
                title: 'Le moteur passe a une boucle unique',
                body: <p>Deux boucles rendaient dans un ordre non deterministe.</p>,
              },
              {
                date: 'Septembre 2025',
                dateTime: '2025-09',
                title: 'Trois cents entrées',
                body: <p>Et pas une couleur écrite en dur.</p>,
              },
            ]}
          />
        </div>
      </Scroller>
    ),
  },
  'section/hero-scroll-morph': {
    height: 'o-h-96',
    lead: 'Defilez : c’est la fenêtre sur le media qui s’ouvre, pas sa largeur. Rien n’est recalcule autour.',
    render: (v) => (
      <Scroller hauteur="260%">
        <HeroScrollMorph
          key={JSON.stringify(v)}
          label="Le registre en clair"
          title="Le registre, en clair"
          subtitle="Trois cents entrees copiees chez vous, jamais liees a un paquet."
          caption="Aperçu de l’atelier de réglages"
          startWidth={num(v, 'startWidth', 62)}
          travel={num(v, 'travel', 0.6)}
        >
          <img src={SAMPLE} alt="" className="o-h-56 o-w-full o-object-cover" />
        </HeroScrollMorph>
      </Scroller>
    ),
  },
  'section/container-scroll': {
    height: 'o-h-96',
    lead: 'Le cadre arrive de biais et se redresse : l’inclinaison finit, ce qui en fait une présentation et non une décoration.',
    render: (v) => (
      <Scroller hauteur="240%">
        <ContainerScroll
          key={JSON.stringify(v)}
          label="L’atelier"
          title="L’atelier"
          subtitle="Chaque reglage du panneau est une prop declaree dans le meta."
          rotation={num(v, 'rotation', 22)}
          scale={num(v, 'scale', 0.86)}
        >
          <img src={SAMPLE} alt="" className="o-h-52 o-w-full o-object-cover o-rounded-xl" />
        </ContainerScroll>
      </Scroller>
    ),
  },
  'section/coming-soon': {
    height: 'o-h-[32rem]',
    lead: 'Les chiffres sont masques aux technologies d’assistance : c’est la date, juste dessous, qui porte l’information.',
    render: () => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark">
        <ComingSoon
          label="Ouverture du registre public"
          date="2026-12-24T09:00:00Z"
          title="Le registre public ouvre bientôt"
          message="Trois cents entrées, un index servi a la racine, et la commande qui les installe en une ligne."
          locale="fr-FR"
        />
      </div>
    ),
  },
  'section/team-grid': {
    height: 'o-h-[34rem]',
    lead: 'Le portrait est decoratif, le nom est écrit dessous, et les liens restent dans le document même au repos.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-6">
        <TeamGrid
          key={JSON.stringify(v)}
          label="L’équipe"
          title="Qui tient le registre"
          columns={num(v, 'columns', 4)}
          stagger={num(v, 'stagger', 70)}
          members={[
            {
              name: 'Camille Roy',
              role: 'Direction artistique',
              bio: 'Dessine les entrees et tranche ce qui reste dehors.',
              links: [{ label: 'Fiches', href: '#camille' }],
            },
            {
              name: 'Sami Belkacem',
              role: 'Moteur',
              bio: 'Une boucle de rendu, un arbitre de surfaces.',
              links: [{ label: 'Journal', href: '#sami' }],
            },
            {
              name: 'Nour Haddad',
              role: 'Accessibilite',
              bio: 'Relit chaque entree au clavier avant publication.',
            },
            {
              name: 'Elias Fontaine',
              role: 'Outils',
              bio: 'La commande, le schema, et ce qui refuse.',
            },
          ]}
        />
      </div>
    ),
  },
  'section/cta-band': {
    height: 'o-h-80',
    lead: 'Un appel principal, une action discrète, et un reflet qui passe une seule fois a l’entrée dans le champ.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-flex o-items-center o-p-8">
        <CtaBand
          key={JSON.stringify(v)}
          className="o-w-full"
          title="Installez la première entrée en une commande"
          body="Le code est copie chez vous : il vous appartient des la premiere seconde, et la commande de comparaison suivra vos retouches."
          primary={{ label: 'Commencer', href: '#installation' }}
          secondary={{ label: 'Lire le contrat', href: '#contrat' }}
        />
      </div>
    ),
  },
  'section/newsletter': {
    height: 'o-h-96',
    lead: 'Quatre états reels : une adresse en .fr reussit, toute autre echoue. La region d’annonce existe avant son message.',
    render: () => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-8">
        <Newsletter
          label="Lettre du registre"
          title="La lettre du registre"
          body="Une fois par mois : les entrees ajoutees, et ce qu elles ont appris en chemin."
          note="Une adresse en .fr reussit, toute autre echoue — de quoi voir les quatre états."
          onSubmit={async (email) => {
            await new Promise((resolve) => {
              setTimeout(resolve, 900)
            })
            if (!email.endsWith('.fr')) {
              throw new Error('Le service n a pas repondu. Reessayez dans un instant.')
            }
          }}
        />
      </div>
    ),
  },
  'section/changelog': {
    height: 'o-h-[34rem]',
    lead: 'Une liste de définitions : la version est le terme, ses changements la description. Le filtre retire des lignes, jamais une version.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-6">
        <Changelog
          label="Journal des versions"
          title="Journal"
          filterable={v['filterable'] !== false}
          releases={[
            {
              version: '2.4.0',
              date: '12 mars 2026',
              dateTime: '2026-03-12',
              summary: 'Douze sections entrent au registre.',
              notes: [
                { kind: 'ajout', text: 'Mur de temoignages, grille bento, onglets de fonctionnalites.' },
                { kind: 'ajout', text: 'Frise verticale dont le trait suit le defilement.' },
                { kind: 'evolution', text: 'Les sections prennent leurs neutres dans les variables de theme.' },
                { kind: 'correction', text: 'La boucle du mur ne saute plus d un demi-espace par tour.' },
              ],
            },
            {
              version: '2.3.1',
              date: '2 fevrier 2026',
              dateTime: '2026-02-02',
              notes: [
                { kind: 'correction', text: 'La barre de progression retrouve sa cible posee plus loin dans l arbre.' },
                { kind: 'correction', text: 'Le compteur formate a nouveau selon la langue du navigateur.' },
              ],
            },
            {
              version: '2.3.0',
              date: '14 janvier 2026',
              dateTime: '2026-01-14',
              summary: 'La validation devient un script, et non plus seulement un test.',
              notes: [
                { kind: 'ajout', text: 'Un cout eleve sans repli declare est desormais refuse.' },
                { kind: 'evolution', text: 'Les messages de refus disent quoi corriger, pas seulement quoi est faux.' },
                { kind: 'retrait', text: 'L ancien format d index, remplace par la version 1.' },
              ],
            },
          ]}
        />
      </div>
    ),
  },
  'section/comparison-table': {
    height: 'o-h-[34rem]',
    lead: 'La zone qui défile reçoit le focus : sans cela, les colonnes de droite sont hors d’atteinte au clavier.',
    render: (v) => (
      <div className="o-absolute o-inset-0 o-p-6">
        <ComparisonTable
          key={JSON.stringify(v)}
          caption="Ce que chaque offre comprend"
          maxHeight={num(v, 'maxHeight', 480)}
          columns={SC1_COMPARATIF_COLONNES}
          rows={SC1_COMPARATIF_LIGNES}
        />
      </div>
    ),
  },
  'hooks/use-scroll-progress': {
    height: 'o-h-96',
    lead: 'La barre est écrite dans la boucle, sans un seul rendu React ; le pourcentage passe par l’abonnement, qui ne publie qu’aux paliers.',
    render: (v) => (
      <ScrollProgressDemo
        range={str(v, 'range', 'traversee') === 'ancrage' ? 'ancrage' : 'traversee'}
      />
    ),
  },
  'hooks/use-media-query': {
    height: 'o-h-96',
    lead: 'Une requête de media n’est pas une largeur : orientation, pointeur, préférence de mouvement basculent sans que la fenêtre change de taille.',
    render: (v) => <MediaQueryDemo query={str(v, 'query', '(min-width: 60rem)')} />,
  },
  'hooks/use-measure': {
    height: 'o-h-96',
    lead: 'Tirez le coin : la mesure ne se reveille qu’au changement, et l’arrondi decide combien de rendus elle provoque.',
    render: (v) => <MeasureDemo arrondi={v.arrondi !== false} />,
  },
  'hooks/use-interval-clock': {
    height: 'o-h-96',
    lead: 'Deux compteurs a la même cadence : changez d’onglet dix secondes, seul celui de setInterval aura compte dans le vide.',
    render: (v) => <IntervalClockDemo interval={num(v, 'interval', 1000)} />,
  },
  'hooks/use-keyboard-list': {
    height: 'o-h-96',
    lead: 'Une seule tabulation entre dans la liste, les fleches la parcourent, et le focus reel suit l’élément actif.',
    render: (v) => (
      <KeyboardListDemo
        count={num(v, 'count', 5)}
        orientation={
          str(v, 'orientation', 'verticale') === 'horizontale'
            ? 'horizontale'
            : 'verticale'
        }
      />
    ),
  },
  'hooks/use-copy': {
    height: 'o-h-96',
    lead: 'Copier ne produit aucun retour visible : l’état est la seule preuve que l’action a eu lieu, et il retombe seul.',
    render: (v) => <CopyDemo delai={num(v, 'delai', 1600)} />,
  },
  'text/split-flap': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'A aucun moment un caractère ne se substitue a un autre : deux volets tombent, et la moitie basse ne prend la nouvelle lettre qu’a la toute fin.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <SplitFlap
            key={JSON.stringify(v)}
            className="o-block"
            interval={num(v, 'interval', 90)}
            step={num(v, 'step', 60)}
            largeur={num(v, 'largeur', 0.72)}
            declenchement={
              str(v, 'declenchement', 'vue') as 'montage' | 'vue' | 'survol'
            }
          >
            Un titre qui accroche
          </SplitFlap>
        }
      />
    ),
  },
  'text/text-cursor': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Chaque lettre ne vise que sa voisine : le fouet, l’etirement et le retour en ligne sortent de cette seule règle, sans trajectoire calculee.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <TextCursor
            className="o-block"
            amplitude={num(v, 'amplitude', 26)}
            raideur={num(v, 'raideur', 9)}
            inclinaison={num(v, 'inclinaison', 0.4)}
            speed={num(v, 'speed', 4)}
          >
            Un titre qui accroche
          </TextCursor>
        }
      />
    ),
  },
  'text/text-loop': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Trois états et non deux : la phrase qui part monte, celle qui vient arrive par le bas, et la boîte ne bouge jamais.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <span className="o-block">
            Odoro, c’est{' '}
            <TextLoop
              hold={num(v, 'hold', 2400)}
              fade={num(v, 'fade', 600)}
              lift={num(v, 'lift', 14)}
              phrases={[
                'un systeme de style',
                'un moteur d animation',
                'un registre de composants',
              ]}
            />
          </span>
        }
      />
    ),
  },
  'text/text-pressure': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Deux axes de la police branches sur deux distances : monter epaissit la ligne, aller vers la droite etire les lettres qu’on approche.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <TextPressure
            className="o-block"
            graisseBasse={num(v, 'graisseBasse', 200)}
            graisseHaute={num(v, 'graisseHaute', 900)}
            chasse={num(v, 'chasse', 25)}
            rayon={num(v, 'rayon', 260)}
            speed={num(v, 'speed', 6)}
          >
            Un titre qui accroche
          </TextPressure>
        }
      />
    ),
  },
  'text/true-focus': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Le flou est l’état normal du texte et un seul mot en sort à la fois ; pointer un mot le met au point et suspend le cycle.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <TrueFocus
            as="span"
            className="o-block"
            blur={num(v, 'blur', 5)}
            attenue={num(v, 'attenue', 0.55)}
            hold={num(v, 'hold', 1400)}
            course={num(v, 'course', 600)}
          >
            Un titre qui accroche
          </TrueFocus>
        }
      />
    ),
  },
  'text/variable-proximity': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Le point suivi n’est pas amorti : c’est chaque lettre qui rejoint sa graisse a son rythme, et la traine reste derrière le geste.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <VariableProximity
            as="span"
            className="o-block"
            rayon={num(v, 'rayon', 180)}
            graisseBasse={num(v, 'graisseBasse', 300)}
            graisseHaute={num(v, 'graisseHaute', 800)}
            speed={num(v, 'speed', 10)}
          >
            Un titre qui accroche
          </VariableProximity>
        }
      />
    ),
  },
  'text/warp-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Le défilement ne commande pas la place de la ligne mais sa forme : droite au centre de l’écran, pliee aux deux bords du champ.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <WarpText
            className="o-block"
            amplitude={num(v, 'amplitude', 28)}
            inclinaison={num(v, 'inclinaison', 6)}
            course={num(v, 'course', 1)}
          >
            Un titre qui accroche
          </WarpText>
        }
      />
    ),
  },
  'text/morph-text': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Un seuil de contraste pose sur un flou soude les deux mots : au milieu du chemin on ne lit plus deux textes, mais une seule forme qui se defait.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <span className="o-block">
            Il faut{' '}
            <MorphText
              hold={num(v, 'hold', 1400)}
              morph={num(v, 'morph', 900)}
              flou={num(v, 'flou', 12)}
              fusion={num(v, 'fusion', 4)}
              mots={['penser', 'ecrire', 'livrer']}
            />
          </span>
        }
      />
    ),
  },
  'text/hand-written': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'Un tiret aussi long que le chemin, déplace par son décalage : le crayon suit les boucles, ce qu’aucun masque rectangulaire ne saurait faire.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <HandWritten
            key={JSON.stringify(v)}
            width={num(v, 'width', 280)}
            thickness={num(v, 'thickness', 5)}
            duration={num(v, 'duration', 1800)}
            declenchement={
              str(v, 'declenchement', 'vue') as 'montage' | 'vue' | 'survol'
            }
          >
            Odoro
          </HandWritten>
        }
      />
    ),
  },
  'text/blur-words': {
    height: 'o-h-96',
    demoByDefault: false,
    lead: 'L’ordre du tirage est cuit dans les images cles : un cycle entier tient dans une seule animation par mot, sans un octet de JavaScript pendant qu’il tourne.',
    render: (v, frame) => (
      <DemoContent
        variant="hero"
        color={frame.color}
        radius={frame.radius}
        headline={
          <BlurWords
            key={JSON.stringify(v)}
            as="span"
            className="o-block"
            blur={num(v, 'blur', 6)}
            dim={num(v, 'dim', 0.25)}
            duration={num(v, 'duration', 520)}
            step={num(v, 'step', 200)}
            pause={num(v, 'pause', 1600)}
          >
            Un titre qui accroche
          </BlurWords>
        }
      />
    ),
  },
}

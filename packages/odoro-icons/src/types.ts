/**
 * The contract of an icon.
 *
 * ## Why data and not one component per icon
 *
 * One component per icon is the most widespread solution, and the most
 * expensive: eleven thousand components means eleven thousand closures, eleven
 * thousand entries in the bundler graph, and a compilation time measured in
 * tens of seconds even when only three of them are used.
 *
 * An icon is a **piece of data** here: its box, its mode, its nodes. A single
 * component renders them all. Pruning works just as well — an unreferenced
 * constant export disappears exactly like an unreferenced component — and the
 * compilation cost collapses.
 *
 * @module
 */

/** A node of the drawing: an SVG tag and its attributes. */
export type IconNode = readonly [string, Readonly<Record<string, string>>]

/** An icon. */
export interface IconData {
  /**
   * Box of the drawing, as the original pack defines it.
   *
   * It is not brought back to a common grid: redrawing a shape to make it fit
   * elsewhere is deforming it. The requested size holds for every icon,
   * whatever its box.
   */
  readonly box: string
  /**
   * Render mode.
   *
   * - `outline` — the drawing is a line: the color goes to the stroke, the
   *   fill stays empty.
   * - `solid` — the drawing is a surface: the color goes to the fill.
   *
   * Confusing the two does not produce an ugly icon but an invisible one, or a
   * black blot.
   */
  readonly mode: 'outline' | 'solid'
  /** Stroke weight, in the units of the box. Absent in solid mode. */
  readonly stroke?: number
  /** Nodes of the drawing. */
  readonly nodes: readonly IconNode[]
}

/** What a pack module declares about itself. */
export interface PackInfo {
  /** Name of the submodule. */
  readonly module: string
  /** Displayed title. */
  readonly title: string
  /** One sentence on the character of the drawing. */
  readonly summary: string
  /** Render mode shared by the whole pack. */
  readonly mode: 'outline' | 'solid'
  /** Stroke weight, if the pack is stroked. */
  readonly stroke?: number
  /** Number of icons. */
  readonly count: number
}

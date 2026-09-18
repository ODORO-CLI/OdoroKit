/**
 * Content shape for the manifesto — GetLayers composition `artist-statement`:
 * an eyebrow, one passage promoted to display size, a signature. No heading.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */
export interface ManifestoContent {
  eyebrow: string;
  /** One paragraph, set at display scale across a narrowed measure. */
  passage: string;
  /** The em-dashed sign-off, in the italic cut. */
  signature: string;
}

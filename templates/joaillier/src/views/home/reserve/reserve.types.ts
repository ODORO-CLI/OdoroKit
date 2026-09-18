/**
 * Content shape for the reserve block — GetLayers composition `altitude-cta`:
 * one rounded translucent capsule holding two unlabelled fields and a filled
 * action pill flush against its own right edge, under a display heading.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */
export interface ReserveContent {
  /** Heading lines, each its own line box. */
  heading: string[];
  sub: string;
  /** Placeholders. The labels exist for assistive tech but are not drawn. */
  fields: { name: string; email: string };
  action: string;
  /** What the capsule says once a request has been received. */
  success: string;
  error: string;
}

// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Type that leans toward the pointer inside a control that stays put.
 *
 * **Two elements, two jobs.** The element it wraps is what *moves*; the
 * element that contains it is the area that is *felt*. A magnetic control that
 * slides the plate as well as the label stops reading as a plate, and drags its
 * own hover area out from under the cursor. So the listeners go on the parent
 * and the transform goes on the child. Wrap the label; the button around it is
 * what the reader is pointing at.
 *
 * **Bare `SpringValue`s whose `onChange` writes the transform**: a pointer
 * crossing a control is a hundred updates a second, and none of them is a
 * reason to re-render React.
 *
 * **Nothing is attached without a fine pointer.** On a touch device there is
 * no hover to answer, so the listeners are never bound.
 */

import { SpringValue } from "@react-spring/web";
import type { AnimationResult } from "@react-spring/web";
import { useEffect, useRef } from "react";

import { magneticConfig } from "@/lib/magnetic/magnetic.config";

const { pull, config } = magneticConfig;

export interface MagneticProps {
  children: React.ReactNode;
  className?: string;
}

export const Magnetic = ({ children, className }: MagneticProps) => {
  const hostRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    // The control, not the label. Falls back to the label itself so a
    // `<Magnetic>` with no wrapper still does something sensible.
    const area = host.parentElement ?? host;

    const x = new SpringValue(0);
    const y = new SpringValue(0);
    const paint = () => {
      host.style.transform = `translate3d(${x.get()}px, ${y.get()}px, 0)`;
    };
    // **Both** springs repaint: hung on one of them, a move along that axis's
    // own centre line leaves the other travelling with nothing to write it out.
    const onChange = (_result: AnimationResult<SpringValue<number>>) => paint();

    const onMove = (event: PointerEvent) => {
      // Measured per move, not cached: the control may be carried by a rising
      // block, so a remembered rect would aim at where it used to be.
      const box = area.getBoundingClientRect();
      const toX = (event.clientX - (box.left + box.width / 2)) * pull;
      const toY = (event.clientY - (box.top + box.height / 2)) * pull;
      void x.start({ to: toX, config, onChange });
      void y.start({ to: toY, config, onChange });
    };

    const onLeave = () => {
      void x.start({ to: 0, config, onChange });
      void y.start({ to: 0, config, onChange });
    };

    // `pointerleave` rather than `pointerout`: `out` fires when the pointer
    // crosses onto a child, and the area always has one — the label.
    area.addEventListener("pointermove", onMove, { passive: true });
    area.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      x.stop();
      y.stop();
      host.style.transform = "";
    };
  }, []);

  return (
    <span ref={hostRef} className={className}>
      {children}
    </span>
  );
};

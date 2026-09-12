import { ImageResponse } from "next/og";

/**
 * Favicon, generated from the brand mark rather than shipped as a binary — the
 * logo lives in exactly one place (`components/ui/icons/brand-mark.tsx`), so a
 * change to it cannot leave a stale `.ico` behind.
 *
 * The starter's `favicon.ico` still covers browsers that ask for the legacy
 * path; Next serves this for everything that understands `icon`.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          borderRadius: 7,
        }}
      >
        <svg width="21" height="21" viewBox="0 0 100 100" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 0H50A50 50 0 1 1 0 50Z M15 15H50A35 35 0 1 1 15 50Z"
            fill="#f97316"
          />
        </svg>
      </div>
    ),
    size,
  );
}

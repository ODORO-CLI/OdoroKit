import { ImageResponse } from "next/og";

/**
 * Home-screen icon for iOS. Same mark as `icon.tsx`, drawn at the size Apple
 * asks for and without a transparent background — iOS composites a black
 * square behind transparency, which would eat the logo.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <svg width="103" height="103" viewBox="0 0 100 100" fill="none">
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

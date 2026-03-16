import { ImageResponse } from "next/og";

export const alt = "TrackMate — Your Workout Companion";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 16 }}>TrackMate</div>
        <div style={{ fontSize: 28, opacity: 0.95 }}>
          Your Workout Companion — Track splits, log progress, hit PRs
        </div>
      </div>
    ),
    { ...size }
  );
}

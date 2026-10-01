import { ImageResponse } from "next/og"

export const alt = "Sepehr · Synthwave Arcade portfolio"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Latin-only text: the built-in OG font can't shape Persian, so both locales share this card.
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(180deg, #140b2c 0%, #2a0f3a 60%, #ff2d95 160%)",
        color: "#ff2d95",
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          width: 260,
          height: 260,
          borderRadius: 999,
          background: "linear-gradient(180deg, #ffe14d, #ff2d95)",
          marginBottom: 40,
          display: "flex",
        }}
      />
      <div
        style={{
          fontSize: 120,
          letterSpacing: 24,
          textShadow: "0 0 24px #ff2d95",
        }}
      >
        SEPEHR
      </div>
      <div style={{ fontSize: 40, color: "#22e5ff", marginTop: 12 }}>
        Frontend / Fullstack Developer
      </div>
    </div>,
    size
  )
}

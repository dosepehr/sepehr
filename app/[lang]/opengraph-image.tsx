import { ImageResponse } from "next/og"

export const alt = "Sepehr · Arcade portfolio"
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
        background: "#faf6ee",
        color: "#261d16",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 220,
          height: 220,
          borderRadius: 999,
          background: "#e45e4d",
          marginBottom: 40,
        }}
      />
      <div style={{ fontSize: 120, fontWeight: 700 }}>Sepehr</div>
      <div style={{ fontSize: 40, color: "#005b5c", marginTop: 12 }}>
        Frontend / Fullstack Developer
      </div>
    </div>,
    size
  )
}

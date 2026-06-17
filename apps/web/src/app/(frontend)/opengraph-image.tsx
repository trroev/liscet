import { ImageResponse } from "next/og"

export const alt = "Liscet — Professional License & CEU Renewal Tracker"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/**
 * Light-theme semantic token values from
 * `packages/tailwind/src/tailwind.theme.css`, resolved to sRGB hex because
 * Satori (the engine behind `next/og`) cannot read CSS custom properties or
 * Tailwind classes. Keys mirror the `--color-*` semantic token names so each
 * value stays traceable to its source token.
 */
const OG_COLORS = {
  background: "#fbfaf8",
  surface: "#ffffff",
  textPrimary: "#0f0d0b",
  textSecondary: "#403c39",
  textMuted: "#75716c",
  border: "#e7e4e0",
  accent: "#2258e5",
  accentForeground: "#fbfaf8",
} as const satisfies Record<string, string>

export default function OpengraphImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "80px",
        backgroundColor: OG_COLORS.background,
        color: OG_COLORS.textPrimary,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "72px",
            height: "72px",
            borderRadius: "18px",
            backgroundColor: OG_COLORS.accent,
            color: OG_COLORS.accentForeground,
            fontSize: "44px",
            fontWeight: 700,
          }}
        >
          L
        </div>
        <div style={{ fontSize: "46px", fontWeight: 700 }}>Liscet</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        <div
          style={{
            display: "flex",
            fontSize: "68px",
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: "920px",
          }}
        >
          Every professional license & CEU in one place
        </div>
        <div
          style={{
            width: "140px",
            height: "12px",
            borderRadius: "999px",
            backgroundColor: OG_COLORS.accent,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: "30px",
            color: OG_COLORS.textMuted,
            lineHeight: 1.4,
            maxWidth: "860px",
          }}
        >
          Know exactly how many credits stand between you and your next renewal.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "32px",
          borderTop: `1px solid ${OG_COLORS.border}`,
          fontSize: "26px",
          color: OG_COLORS.textSecondary,
        }}
      >
        <div style={{ display: "flex" }}>liscet.com</div>
        <div style={{ display: "flex" }}>License &amp; CEU renewal tracker</div>
      </div>
    </div>,
    { ...size }
  )
}

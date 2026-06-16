import { Img } from "@react-email/components"
import { render } from "@react-email/render"
import { BaseLayout } from "@repo/emails/layouts/BaseLayout"
import { preview } from "@repo/storybook-config/preview"
import { type ReactElement, useEffect, useState } from "react"

// Self-contained wordmark so the logo slot renders without a network fetch in
// the Storybook iframe. Real emails point `logo` at a hosted image.
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="32" viewBox="0 0 120 32"><rect width="32" height="32" rx="8" fill="#2258e5"/><text x="16" y="22" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">L</text><text x="42" y="22" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#2258e5">Liscet</text></svg>`
const logoDataUri = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`

const frameStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  height: "640px",
  width: "640px",
} as const

const headingStyle = { fontSize: "20px", margin: "0 0 16px" } as const

const bodyStyle = {
  color: "#374151",
  fontSize: "14px",
  margin: "0",
} as const

/**
 * Renders an email element to its final HTML string and isolates it in an
 * iframe. Email layouts emit a full `<html>` document, so mounting them
 * directly in the Storybook canvas would nest documents; the iframe keeps the
 * preview faithful to what a recipient's client receives.
 */
const EmailFrame = ({ email }: { email: ReactElement }): ReactElement => {
  const [markup, setMarkup] = useState("")

  useEffect(() => {
    let active = true
    render(email).then((html) => {
      if (active) {
        setMarkup(html)
      }
    })
    return () => {
      active = false
    }
  }, [email])

  return <iframe srcDoc={markup} style={frameStyle} title="Email preview" />
}

type BaseLayoutPreviewProps = {
  readonly heading: string
  readonly logoUrl?: string
  readonly previewText: string
  readonly unsubscribeUrl?: string
}

const BaseLayoutPreview = ({
  heading,
  logoUrl,
  previewText,
  unsubscribeUrl,
}: BaseLayoutPreviewProps): ReactElement => (
  <EmailFrame
    email={
      <BaseLayout
        logo={
          logoUrl ? (
            <Img alt="Liscet" height={32} src={logoUrl} width={120} />
          ) : undefined
        }
        previewText={previewText}
        unsubscribeUrl={unsubscribeUrl}
      >
        <h1 style={headingStyle}>{heading}</h1>
        <p style={bodyStyle}>
          Body content slots in here. The wordmark header and the
          compliance-disclaimer footer with its unsubscribe link come from the
          shared layout.
        </p>
      </BaseLayout>
    }
  />
)

const meta = preview.meta({
  args: {
    heading: "Welcome to Liscet",
    previewText: "Your continuing-education summary is ready",
  },
  component: BaseLayoutPreview,
  parameters: { layout: "fullscreen" },
  title: "Emails/BaseLayout",
})

export const Default = meta.story({})

export const CustomUnsubscribe = meta.story({
  args: {
    heading: "Renewal reminder",
    previewText: "A reminder about your upcoming renewal",
    unsubscribeUrl: "https://liscet.com/u/abc123/unsubscribe",
  },
})

export const WithLogo = meta.story({
  args: {
    logoUrl: logoDataUri,
  },
})

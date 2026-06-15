import { render } from "@react-email/render"
import { BaseLayout } from "@repo/emails/layouts/BaseLayout"
import { preview } from "@repo/storybook-config/preview"
import { type ReactElement, useEffect, useState } from "react"

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
  readonly previewText: string
  readonly unsubscribeUrl?: string
}

const BaseLayoutPreview = ({
  heading,
  previewText,
  unsubscribeUrl,
}: BaseLayoutPreviewProps): ReactElement => (
  <EmailFrame
    email={
      <BaseLayout previewText={previewText} unsubscribeUrl={unsubscribeUrl}>
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

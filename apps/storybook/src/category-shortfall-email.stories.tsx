import { render } from "@react-email/render"
import {
  type CategoryShortfall,
  CategoryShortfallEmail,
} from "@repo/emails/templates/CategoryShortfall"
import { preview } from "@repo/storybook-config/preview"
import { type ReactElement, useEffect, useState } from "react"

const frameStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  height: "640px",
  width: "640px",
} as const

/**
 * Renders an email element to its final HTML string and isolates it in an
 * iframe. Email templates emit a full `<html>` document, so mounting them
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

type CategoryShortfallPreviewProps = {
  readonly practitionerName: string
  readonly licenseType: string
  readonly state: string
  readonly renewalDate: string
  readonly shortfalls: Array<CategoryShortfall>
}

const CategoryShortfallPreview = ({
  practitionerName,
  licenseType,
  state,
  renewalDate,
  shortfalls,
}: CategoryShortfallPreviewProps): ReactElement => (
  <EmailFrame
    email={
      <CategoryShortfallEmail
        licenseType={licenseType}
        practitionerName={practitionerName}
        renewalDate={renewalDate}
        shortfalls={shortfalls}
        state={state}
      />
    }
  />
)

const meta = preview.meta({
  args: {
    licenseType: "LCSW",
    practitionerName: "Jordan Rivera",
    renewalDate: "2026-07-15T12:00:00Z",
    shortfalls: [
      { category: "law-and-ethics", credited: 2, required: 6 },
      { category: "suicide-risk", credited: 0, required: 1 },
    ],
    state: "CA",
  },
  component: CategoryShortfallPreview,
  parameters: { layout: "fullscreen" },
  title: "Emails/CategoryShortfall",
})

export const Default = meta.story({})

export const SingleCategory = meta.story({
  args: {
    shortfalls: [{ category: "cultural-competency", credited: 4, required: 6 }],
  },
})

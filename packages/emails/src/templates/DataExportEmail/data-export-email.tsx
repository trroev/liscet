import { Button, Heading, Text } from "@react-email/components"
import type { CSSProperties, ReactElement } from "react"
import { BaseLayout } from "../../layouts/BaseLayout"

type DataExportEmailProps = {
  readonly downloadUrl: string
  readonly expiresAt: Date
}

const headingStyle = {
  color: "#111111",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
} as const satisfies CSSProperties

const textStyle = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 16px",
} as const satisfies CSSProperties

const buttonStyle = {
  backgroundColor: "#4f39f6",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  padding: "10px 20px",
} as const satisfies CSSProperties

const footnoteStyle = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "24px 0 0",
} as const satisfies CSSProperties

const expiryFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "long",
  timeZone: "UTC",
  timeZoneName: "short",
  year: "numeric",
})

const DataExportEmail = ({
  downloadUrl,
  expiresAt,
}: DataExportEmailProps): ReactElement => (
  <BaseLayout previewText="Your Liscet data export is ready">
    <Heading as="h1" style={headingStyle}>
      Your data export is ready
    </Heading>
    <Text style={textStyle}>
      The export of your Liscet data — your profile, licenses, courses, and
      credits — is ready to download as a JSON file.
    </Text>
    <Button href={downloadUrl} style={buttonStyle}>
      Download your data
    </Button>
    <Text style={footnoteStyle}>
      This link expires on {expiryFormatter.format(expiresAt)}. If you did not
      request this export, you can safely ignore this email.
    </Text>
  </BaseLayout>
)

// Default export consumed only by React Email's preview server (`email dev`).
// Application code imports the named `DataExportEmail` via the package barrel.
const DataExportEmailPreview = (): ReactElement => (
  <DataExportEmail
    downloadUrl="https://liscet.com/api/data-export?token=preview"
    expiresAt={new Date("2026-01-02T12:00:00Z")}
  />
)

export type { DataExportEmailProps }
export { DataExportEmail }
export default DataExportEmailPreview

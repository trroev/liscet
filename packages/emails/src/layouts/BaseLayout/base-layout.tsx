import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { CSSProperties, ReactElement, ReactNode } from "react"

const DEFAULT_UNSUBSCRIBE_URL =
  "https://liscet.com/settings/notifications" as const

const LEGAL_DISCLAIMER =
  "You are responsible for verifying compliance with your state board." as const

type BaseLayoutProps = {
  readonly children: ReactNode
  readonly logo?: ReactNode
  readonly previewText: string
  readonly unsubscribeUrl?: string
}

const bodyStyle = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: "0",
  padding: "0",
} as const satisfies CSSProperties

const containerStyle = {
  margin: "0 auto",
  maxWidth: "600px",
  padding: "24px",
} as const satisfies CSSProperties

const headerStyle = {
  padding: "0 0 16px",
} as const satisfies CSSProperties

const wordmarkStyle = {
  color: "#4f39f6",
  fontSize: "20px",
  fontWeight: "700",
  letterSpacing: "-0.01em",
  margin: "0",
} as const satisfies CSSProperties

const sectionStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "32px",
} as const satisfies CSSProperties

const footerStyle = {
  padding: "24px 8px 0",
} as const satisfies CSSProperties

const dividerStyle = {
  borderColor: "#e5e7eb",
  margin: "0 0 16px",
} as const satisfies CSSProperties

const disclaimerStyle = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 8px",
} as const satisfies CSSProperties

const unsubscribeStyle = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
} as const satisfies CSSProperties

const unsubscribeLinkStyle = {
  color: "#4f39f6",
  textDecoration: "underline",
} as const satisfies CSSProperties

const BaseLayout = ({
  children,
  logo,
  previewText,
  unsubscribeUrl = DEFAULT_UNSUBSCRIBE_URL,
}: BaseLayoutProps): ReactElement => (
  <Html lang="en">
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={bodyStyle}>
      <Container style={containerStyle}>
        <Section style={headerStyle}>
          {logo ?? <Text style={wordmarkStyle}>Liscet</Text>}
        </Section>
        <Section style={sectionStyle}>{children}</Section>
        <Section style={footerStyle}>
          <Hr style={dividerStyle} />
          <Text style={disclaimerStyle}>{LEGAL_DISCLAIMER}</Text>
          <Text style={unsubscribeStyle}>
            <Link href={unsubscribeUrl} style={unsubscribeLinkStyle}>
              Unsubscribe
            </Link>{" "}
            from these notifications.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

// Default export consumed only by React Email's preview server (`email dev`),
// which discovers previewable emails by their default export. Application code
// imports the named `BaseLayout` via the package barrel.
const BaseLayoutPreview = (): ReactElement => (
  <BaseLayout previewText="A preview of the base email layout">
    <Text>Hello from the base email layout.</Text>
  </BaseLayout>
)

export type { BaseLayoutProps }
export { BaseLayout }
export default BaseLayoutPreview

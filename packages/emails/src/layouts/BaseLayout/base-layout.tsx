import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import type { CSSProperties, ReactElement, ReactNode } from "react"

type BaseLayoutProps = {
  readonly children: ReactNode
  readonly previewText: string
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

const sectionStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "32px",
} as const satisfies CSSProperties

const BaseLayout = ({
  children,
  previewText,
}: BaseLayoutProps): ReactElement => (
  <Html lang="en">
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={bodyStyle}>
      <Container style={containerStyle}>
        <Section style={sectionStyle}>{children}</Section>
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

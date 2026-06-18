import type React from "react"

export type LegalDocumentProps = {
  html: string
}

export const LegalDocument = ({
  html,
}: LegalDocumentProps): React.JSX.Element => (
  // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, build-time static Termly policy export — not user input
  <div className="legal-document" dangerouslySetInnerHTML={{ __html: html }} />
)

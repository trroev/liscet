import type React from "react"

export type LegalDocumentProps = {
  html: string
}

export function LegalDocument({ html }: LegalDocumentProps): React.JSX.Element {
  return (
    <div
      className="legal-document"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted, build-time static Termly policy export — not user input
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

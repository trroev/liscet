"use client"

import Script from "next/script"
import { useEffect } from "react"

const TERMLY_EMBED_SRC = "https://app.termly.io/embed-policy.min.js"

type TermlyWindow = Window & {
  Termly?: { initialize?: () => void }
}

export type TermlyEmbedProps = {
  dataId?: string
}

export const TermlyEmbed = ({
  dataId,
}: TermlyEmbedProps): React.JSX.Element => {
  useEffect(() => {
    if (!dataId) {
      return
    }
    const termlyWindow = window as TermlyWindow
    termlyWindow.Termly?.initialize?.()
  }, [dataId])

  if (!dataId) {
    return (
      <p className="font-sans text-body-sm text-text-muted">
        This policy will be published before launch.
      </p>
    )
  }

  return (
    <>
      <div data-id={dataId} data-type="iframe" {...{ name: "termly-embed" }} />
      <Script src={TERMLY_EMBED_SRC} strategy="afterInteractive" />
    </>
  )
}

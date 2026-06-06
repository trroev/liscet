import type { JSXConverter } from "@payloadcms/richtext-lexical/react"
import { createLogger } from "@repo/logger"
import type { SerializedLexicalNode } from "lexical"
import Image from "next/image"

const log = createLogger({ name: "payload.rich-text.upload" })

type SerializedUploadNode = SerializedLexicalNode & {
  type: "upload"
  relationTo: string
  value: unknown
  fields?: Record<string, unknown>
  id?: string
}

type MediaDoc = {
  id?: string | number
  url?: string | null
  alt?: string | null
  filename?: string | null
  width?: number | null
  height?: number | null
  mimeType?: string | null
}

const isPopulatedMediaDoc = (value: unknown): value is MediaDoc =>
  typeof value === "object" && value !== null && "url" in value

export const uploadConverter: JSXConverter<SerializedUploadNode> = ({
  node,
}) => {
  const value: unknown = node.value
  if (!isPopulatedMediaDoc(value)) {
    log
      .withMetadata({ relationTo: node.relationTo })
      .warn(
        "rich-text upload value is not a populated media doc; rendering nothing"
      )
    return null
  }
  const { url, width, height, alt, filename, id } = value
  if (!url) {
    log
      .withMetadata({ id, relationTo: node.relationTo })
      .warn("rich-text upload media doc has no url; rendering nothing")
    return null
  }
  const isImage = typeof width === "number" && typeof height === "number"
  if (!isImage) {
    return <a href={url}>{filename ?? url}</a>
  }
  if (alt === undefined || alt === null || alt === "") {
    log
      .withMetadata({ id, relationTo: node.relationTo })
      .warn(
        "rich-text upload image is missing alt text; rendering decorative image"
      )
  }
  return <Image alt={alt ?? ""} height={height} src={url} width={width} />
}

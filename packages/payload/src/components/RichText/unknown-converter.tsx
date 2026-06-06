import type { JSXConverter } from "@payloadcms/richtext-lexical/react"
import { createLogger } from "@repo/logger"
import type { SerializedLexicalNode } from "lexical"

const log = createLogger({ name: "payload.rich-text.unknown" })

export const unknownConverter: JSXConverter<SerializedLexicalNode> = ({
  node,
}) => {
  log
    .withMetadata({ type: node.type })
    .warn("rich-text encountered unknown node type; rendering nothing")
  return null
}

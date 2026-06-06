import type { JSXConverter } from "@payloadcms/richtext-lexical/react"
import type { SerializedElementNode } from "lexical"
import { richText } from "./rich-text.variants"

type QuoteNode = SerializedElementNode & {
  type: "quote"
}

const styles = richText()

export const quoteConverter: JSXConverter<QuoteNode> = ({
  node,
  nodesToJSX,
}) => {
  const children = nodesToJSX({ nodes: node.children })
  return <blockquote className={styles.blockquote()}>{children}</blockquote>
}

import type { JSXConverter } from "@payloadcms/richtext-lexical/react"
import type { SerializedElementNode } from "lexical"
import { match } from "ts-pattern"
import { richText } from "./rich-text.variants"

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

type HeadingNode = SerializedElementNode & {
  type: "heading"
  tag: HeadingTag
}

const styles = richText()

const classForTag = (tag: HeadingTag): string =>
  match(tag)
    .with("h1", () => styles.heading1())
    .with("h2", () => styles.heading2())
    .with("h3", () => styles.heading3())
    .with("h4", () => styles.heading4())
    .with("h5", () => styles.heading5())
    .with("h6", () => styles.heading6())
    .exhaustive()

export const headingConverter: JSXConverter<HeadingNode> = ({
  node,
  nodesToJSX,
}) => {
  const children = nodesToJSX({ nodes: node.children })
  const Tag = node.tag
  return <Tag className={classForTag(Tag)}>{children}</Tag>
}

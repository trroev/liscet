import type { JSXConverter } from "@payloadcms/richtext-lexical/react"
import type { SerializedElementNode } from "lexical"
import { match } from "ts-pattern"
import { CheckListItem } from "./check-list-item"
import { richText } from "./rich-text.variants"

type ListType = "bullet" | "check" | "number"

type ListNode = SerializedElementNode & {
  type: "list"
  tag: "ol" | "ul"
  listType: ListType
  start: number
}

type ListItemNode = SerializedElementNode & {
  type: "listitem"
  value: number
  checked?: boolean
}

const styles = richText()

export const listConverter: JSXConverter<ListNode> = ({ node, nodesToJSX }) => {
  const children = nodesToJSX({ nodes: node.children })
  return match(node.listType)
    .with("number", () => (
      <ol className={styles.orderedList()} start={node.start}>
        {children}
      </ol>
    ))
    .with("bullet", () => (
      <ul className={styles.unorderedList()}>{children}</ul>
    ))
    .with("check", () => <ul className={styles.checkList()}>{children}</ul>)
    .exhaustive()
}

export const listItemConverter: JSXConverter<ListItemNode> = ({
  node,
  nodesToJSX,
}) => {
  const children = nodesToJSX({ nodes: node.children })
  if (typeof node.checked === "boolean") {
    return <CheckListItem checked={node.checked}>{children}</CheckListItem>
  }
  return <li>{children}</li>
}

/**
 * Server-component Lexical rich-text renderer.
 *
 * Walks the Lexical JSON AST and emits React directly via
 * @payloadcms/richtext-lexical/react's per-node converter API.
 *
 * No HTML intermediate, no dangerouslySetInnerHTML, no DOMPurify,
 * no html-react-parser. Allow-listing happens at the node / attribute
 * level inside the converters.
 *
 * Default-handled node types (via Payload's defaultConverters):
 *   paragraph, code, horizontalrule, relationship, linebreak, tab,
 *   text (bold, italic, underline, strikethrough, code, subscript,
 *   superscript).
 *
 * Overridden / additional converters:
 *   heading        — h1–h6 styled via the project's `text-heading-*`
 *                    and `text-body-*` design tokens through
 *                    `tailwind-variants`.
 *   list, listitem — bullet/number/check lists styled via
 *                    `tailwind-variants`; check items render the
 *                    `@repo/ui` Checkbox paired with a `<Label>` via
 *                    `useId`.
 *   quote          — blockquote styled via `tailwind-variants`.
 *   link, autolink — scheme allow-list (http, https, mailto, tel,
 *                    same-origin paths); internal → next/link;
 *                    external → <a target="_blank" rel="noopener noreferrer">;
 *                    Payload internal-doc links resolved via the
 *                    internalDocResolvers prop keyed by collection slug.
 *   upload         — populated media doc with width+height → next/image;
 *                    otherwise → download link; missing alt warns and
 *                    renders alt="".
 *   unknown        — logs a warn and renders nothing.
 */

import {
  type JSXConverters,
  type JSXConvertersFunction,
  RichText as LexicalRichText,
} from "@payloadcms/richtext-lexical/react"
import { env as appEnv } from "@repo/env/app"
import type { SerializedEditorState } from "lexical"
import type { ReactNode } from "react"
import { headingConverter } from "./heading-converter"
import {
  createLinkConverter,
  type InternalDocResolvers,
} from "./link-converter"
import { listConverter, listItemConverter } from "./list-converter"
import { quoteConverter } from "./quote-converter"
import { unknownConverter } from "./unknown-converter"
import { uploadConverter } from "./upload-converter"

export type RichTextProps = {
  data: SerializedEditorState
  internalDocResolvers?: InternalDocResolvers
  converters?: JSXConverters
}

const EMPTY_RESOLVERS: InternalDocResolvers = {}

export const RichText = ({
  data,
  internalDocResolvers = EMPTY_RESOLVERS,
  converters: callerConverters,
}: RichTextProps): ReactNode => {
  const linkConverter = createLinkConverter({
    baseUrl: appEnv.BASE_URL,
    internalDocResolvers,
  })

  const convertersFn: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    autolink: linkConverter,
    heading: headingConverter,
    link: linkConverter,
    list: listConverter,
    listitem: listItemConverter,
    quote: quoteConverter,
    unknown: unknownConverter,
    upload: uploadConverter,
    ...callerConverters,
  })

  return <LexicalRichText converters={convertersFn} data={data} />
}

import type { LinkFields } from "@payloadcms/richtext-lexical"
import type { JSXConverter } from "@payloadcms/richtext-lexical/react"
import { createLogger } from "@repo/logger"
import type { SerializedElementNode } from "lexical"
import Link from "next/link"
import type { ReactNode } from "react"
import { match, P } from "ts-pattern"
import { ALLOWED_LINK_SCHEMES, type AllowedLinkScheme } from "./allowed-schemes"

type LinkLikeNode = SerializedElementNode & {
  type: "autolink" | "link"
  fields: LinkFields
}

const log = createLogger({ name: "payload.rich-text.link" })

export type InternalDocResolver = (doc: unknown) => string | undefined

export type InternalDocResolvers = Readonly<Record<string, InternalDocResolver>>

type ResolveHrefArgs = {
  fields: LinkFields
  internalDocResolvers: InternalDocResolvers
}

const resolveHref = ({
  fields,
  internalDocResolvers,
}: ResolveHrefArgs): string | undefined =>
  match(fields)
    .with({ linkType: "internal", doc: P.nonNullable }, ({ doc }) => {
      const resolver = internalDocResolvers[doc.relationTo]
      if (!resolver) {
        log
          .withMetadata({ collection: doc.relationTo })
          .warn(
            "rich-text link references collection without a resolver; rendering text"
          )
        return
      }
      return resolver(doc.value)
    })
    .with({ linkType: "custom", url: P.string }, ({ url }) => url)
    .otherwise(() => undefined)

const isSameOriginPath = (href: string): boolean => href.startsWith("/")

type ClassifyArgs = {
  href: string
  baseUrl: string
}

type Classification =
  | { kind: "disallowed" }
  | { kind: "internal"; path: string }
  | { kind: "external"; href: string; scheme: AllowedLinkScheme }
  | { kind: "mail-or-tel"; href: string; scheme: "mailto:" | "tel:" }

const classify = ({ href, baseUrl }: ClassifyArgs): Classification => {
  if (isSameOriginPath(href)) {
    return { kind: "internal", path: href }
  }
  const parsed = (() => {
    try {
      return new URL(href)
    } catch {
      return
    }
  })()
  if (!parsed) {
    return { kind: "disallowed" }
  }
  const scheme = parsed.protocol
  if (!(ALLOWED_LINK_SCHEMES as ReadonlyArray<string>).includes(scheme)) {
    return { kind: "disallowed" }
  }
  if (scheme === "mailto:" || scheme === "tel:") {
    return { kind: "mail-or-tel", href, scheme }
  }
  const base = (() => {
    try {
      return new URL(baseUrl)
    } catch {
      return
    }
  })()
  if (base && parsed.origin === base.origin) {
    return {
      kind: "internal",
      path: `${parsed.pathname}${parsed.search}${parsed.hash}`,
    }
  }
  return { kind: "external", href, scheme: scheme as AllowedLinkScheme }
}

type CreateLinkConverterArgs = {
  baseUrl: string
  internalDocResolvers: InternalDocResolvers
}

export const createLinkConverter = ({
  baseUrl,
  internalDocResolvers,
}: CreateLinkConverterArgs): JSXConverter<LinkLikeNode> => {
  const converter: JSXConverter<LinkLikeNode> = ({ node, nodesToJSX }) => {
    const children: ReadonlyArray<ReactNode> = nodesToJSX({
      nodes: node.children,
    })
    const href = resolveHref({
      fields: node.fields,
      internalDocResolvers,
    })
    if (!href) {
      return <>{children}</>
    }
    const classification = classify({ href, baseUrl })
    return match(classification)
      .with({ kind: "disallowed" }, () => <>{children}</>)
      .with({ kind: "internal" }, ({ path }) => (
        <Link href={path}>{children}</Link>
      ))
      .with({ kind: "mail-or-tel" }, ({ href: mailto }) => (
        <a href={mailto}>{children}</a>
      ))
      .with({ kind: "external" }, ({ href: external }) => {
        const newTab = node.fields.newTab !== false
        return (
          <a
            href={external}
            rel="noopener noreferrer"
            target={newTab ? "_blank" : "_self"}
          >
            {children}
          </a>
        )
      })
      .exhaustive()
  }
  return converter
}

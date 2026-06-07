import { render, screen } from "@testing-library/react"
import type { SerializedEditorState } from "lexical"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { type InternalDocResolvers, RichText } from "./index"

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // biome-ignore lint/a11y/useAltText: alt threads through props from RichText
    // biome-ignore lint/performance/noImgElement: test mock substitutes the real next/image
    // biome-ignore lint/correctness/useImageSize: width/height threads through props from RichText
    return <img {...props} />
  },
}))

vi.mock("next/link", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a data-next-link="true" href={href} {...rest}>
      {children}
    </a>
  ),
}))

const warnSpy = vi.fn()
vi.mock("@repo/logger", () => ({
  createLogger: () => ({
    withMetadata: () => ({
      warn: (msg: string) => warnSpy(msg),
    }),
  }),
}))

vi.mock("@repo/env/app", () => ({
  env: { BASE_URL: "http://localhost:3000" },
}))

beforeEach(() => {
  warnSpy.mockClear()
})

const text = (value: string) => ({
  type: "text" as const,
  version: 1,
  detail: 0,
  format: 0,
  mode: "normal" as const,
  style: "",
  text: value,
})

const textBold = (value: string) => ({ ...text(value), format: 1 })
const textItalic = (value: string) => ({ ...text(value), format: 2 })

type LexicalChild = ReturnType<typeof text> | Record<string, unknown>

const paragraph = (children: ReadonlyArray<LexicalChild>) => ({
  type: "paragraph" as const,
  version: 1,
  direction: "ltr" as const,
  format: "" as const,
  indent: 0,
  textFormat: 0,
  textStyle: "",
  children,
})

const editorState = (
  children: ReadonlyArray<Record<string, unknown>>
): SerializedEditorState =>
  ({
    root: {
      type: "root",
      version: 1,
      direction: "ltr",
      format: "",
      indent: 0,
      children,
    },
  }) as unknown as SerializedEditorState

const linkNode = ({
  url,
  newTab = true,
  children,
}: {
  url: string
  newTab?: boolean
  children: ReadonlyArray<LexicalChild>
}) => ({
  type: "link" as const,
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  fields: { linkType: "custom" as const, newTab, url },
  children,
})

const internalLinkNode = ({
  relationTo,
  value,
  children,
}: {
  relationTo: string
  value: unknown
  children: ReadonlyArray<LexicalChild>
}) => ({
  type: "link" as const,
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  fields: {
    linkType: "internal" as const,
    newTab: false,
    doc: { relationTo, value },
  },
  children,
})

const headingNode = (tag: string, value: string) => ({
  type: "heading" as const,
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  tag,
  children: [text(value)],
})

const listNode = (items: ReadonlyArray<string>) => ({
  type: "list" as const,
  version: 1,
  direction: "ltr",
  format: "",
  indent: 0,
  tag: "ul",
  listType: "bullet",
  start: 1,
  children: items.map((item, i) => ({
    type: "listitem" as const,
    version: 1,
    direction: "ltr",
    format: "",
    indent: 0,
    value: i + 1,
    children: [text(item)],
  })),
})

const uploadNode = (overrides: Record<string, unknown>) => ({
  type: "upload" as const,
  version: 3,
  format: "",
  relationTo: "media",
  ...overrides,
})

describe("RichText renderer", () => {
  describe("formatted render", () => {
    it("renders bold, italic, heading, list, link, upload", () => {
      const data = editorState([
        headingNode("h2", "Hello"),
        paragraph([textBold("bold"), text(" "), textItalic("italic")]),
        listNode(["one", "two"]),
        paragraph([
          linkNode({
            url: "https://example.com",
            children: [text("external")],
          }),
        ]),
        uploadNode({
          id: "u1",
          value: {
            id: "m1",
            url: "/uploads/img.png",
            alt: "Cover",
            width: 800,
            height: 600,
          },
        }),
      ])

      render(<RichText data={data} />)

      expect(
        screen.getByRole("heading", { level: 2, name: "Hello" })
      ).toBeInTheDocument()
      expect(screen.getByText("bold").tagName).toBe("STRONG")
      expect(screen.getByText("italic").tagName).toBe("EM")
      expect(screen.getAllByRole("listitem")).toHaveLength(2)
      expect(screen.getByRole("link", { name: "external" })).toHaveAttribute(
        "href",
        "https://example.com"
      )
      const img = screen.getByAltText("Cover") as HTMLImageElement
      expect(img.src).toContain("/uploads/img.png")
    })
  })

  describe("scheme allow-list", () => {
    it.each([
      ["javascript:alert(1)"],
      ["data:text/html;base64,PHN2Zz4="],
      ["vbscript:msgbox"],
      ["file:///etc/passwd"],
    ])("renders %s as plain text with no anchor", (url) => {
      const data = editorState([
        paragraph([
          linkNode({
            url,
            children: [text("payload")],
          }),
        ]),
      ])
      render(<RichText data={data} />)
      expect(screen.queryByRole("link")).toBeNull()
      expect(screen.getByText("payload")).toBeInTheDocument()
    })
  })

  describe("internal vs external link routing", () => {
    it("renders same-origin path via next/link", () => {
      const data = editorState([
        paragraph([
          linkNode({
            url: "/about",
            children: [text("about")],
          }),
        ]),
      ])
      render(<RichText data={data} />)
      const link = screen.getByRole("link", { name: "about" })
      expect(link).toHaveAttribute("data-next-link", "true")
      expect(link).toHaveAttribute("href", "/about")
    })

    it("renders origin matching BASE_URL via next/link with path only", () => {
      const data = editorState([
        paragraph([
          linkNode({
            url: "http://localhost:3000/contact",
            children: [text("contact")],
          }),
        ]),
      ])
      render(<RichText data={data} />)
      const link = screen.getByRole("link", { name: "contact" })
      expect(link).toHaveAttribute("data-next-link", "true")
      expect(link).toHaveAttribute("href", "/contact")
    })

    it("renders foreign origin as <a target=_blank rel=noopener noreferrer>", () => {
      const data = editorState([
        paragraph([
          linkNode({
            url: "https://example.com/x",
            children: [text("ex")],
          }),
        ]),
      ])
      render(<RichText data={data} />)
      const link = screen.getByRole("link", { name: "ex" })
      expect(link).not.toHaveAttribute("data-next-link")
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", "noopener noreferrer")
    })

    it("respects newTab=false on external links", () => {
      const data = editorState([
        paragraph([
          linkNode({
            url: "https://example.com/x",
            newTab: false,
            children: [text("ex")],
          }),
        ]),
      ])
      render(<RichText data={data} />)
      expect(screen.getByRole("link", { name: "ex" })).toHaveAttribute(
        "target",
        "_self"
      )
    })

    it("resolves internal-doc links via the registry", () => {
      const internalDocResolvers: InternalDocResolvers = {
        articles: (doc) => {
          if (typeof doc === "object" && doc !== null && "slug" in doc) {
            return `/articles/${(doc as { slug: string }).slug}`
          }
          return
        },
      }
      const data = editorState([
        paragraph([
          internalLinkNode({
            relationTo: "articles",
            value: { id: "a1", slug: "hello" },
            children: [text("related")],
          }),
        ]),
      ])
      render(
        <RichText data={data} internalDocResolvers={internalDocResolvers} />
      )
      const link = screen.getByRole("link", { name: "related" })
      expect(link).toHaveAttribute("data-next-link", "true")
      expect(link).toHaveAttribute("href", "/articles/hello")
    })

    it("warns and renders plain text when collection has no resolver", () => {
      const data = editorState([
        paragraph([
          internalLinkNode({
            relationTo: "pages",
            value: { id: "p1", slug: "about" },
            children: [text("ghost")],
          }),
        ]),
      ])
      render(<RichText data={data} />)
      expect(screen.queryByRole("link")).toBeNull()
      expect(screen.getByText("ghost")).toBeInTheDocument()
      expect(warnSpy).toHaveBeenCalled()
    })
  })

  describe("upload converter", () => {
    it("warns and renders alt='' when alt is missing", () => {
      const data = editorState([
        uploadNode({
          id: "u1",
          value: {
            id: "m1",
            url: "/uploads/img.png",
            width: 100,
            height: 100,
          },
        }),
      ])
      const { container } = render(<RichText data={data} />)
      const img = container.querySelector("img")
      expect(img).not.toBeNull()
      expect(img?.getAttribute("alt")).toBe("")
      expect(warnSpy).toHaveBeenCalled()
    })

    it("renders non-image upload (no width/height) as download link", () => {
      const data = editorState([
        uploadNode({
          id: "u1",
          value: {
            id: "m1",
            url: "/uploads/doc.pdf",
            filename: "doc.pdf",
            mimeType: "application/pdf",
          },
        }),
      ])
      render(<RichText data={data} />)
      const link = screen.getByRole("link", { name: "doc.pdf" })
      expect(link).toHaveAttribute("href", "/uploads/doc.pdf")
      expect(screen.queryByRole("img")).toBeNull()
    })
  })

  describe("unknown node type", () => {
    it("renders nothing and warns", () => {
      const data = editorState([
        {
          type: "definitely-not-a-real-type",
          version: 1,
          direction: "ltr",
          format: "",
          indent: 0,
          children: [],
        },
      ])
      render(<RichText data={data} />)
      expect(warnSpy).toHaveBeenCalled()
    })
  })
})

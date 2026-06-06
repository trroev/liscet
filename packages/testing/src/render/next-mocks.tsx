import { createElement, type ImgHTMLAttributes, type ReactNode } from "react"
import { vi } from "vitest"

export type NextNavigationState = {
  push: ReturnType<typeof vi.fn>
  replace: ReturnType<typeof vi.fn>
  back: ReturnType<typeof vi.fn>
  forward: ReturnType<typeof vi.fn>
  refresh: ReturnType<typeof vi.fn>
  prefetch: ReturnType<typeof vi.fn>
  pathname: string
  searchParams: URLSearchParams
}

export const createNextNavigationState = (
  initial?: Readonly<{ pathname?: string; searchParams?: URLSearchParams }>
): NextNavigationState => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  pathname: initial?.pathname ?? "/",
  searchParams: initial?.searchParams ?? new URLSearchParams(),
})

export const nextNavigationFactory = (state: NextNavigationState) => ({
  useRouter: () => ({
    push: state.push,
    replace: state.replace,
    back: state.back,
    forward: state.forward,
    refresh: state.refresh,
    prefetch: state.prefetch,
  }),
  usePathname: () => state.pathname,
  useSearchParams: () => state.searchParams,
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
})

type LinkProps = {
  href: string
  children?: ReactNode
} & Record<string, unknown>

export const nextLinkFactory = () => ({
  default: ({ href, children, ...rest }: LinkProps) =>
    createElement(
      "a",
      { href: typeof href === "string" ? href : "#", ...rest },
      children
    ),
})

export const nextImageFactory = () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) =>
    createElement("img", { alt: props.alt ?? "", ...props }),
})

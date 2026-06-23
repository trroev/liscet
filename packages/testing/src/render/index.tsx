import type { User } from "@repo/auth"
import { SessionProvider } from "@repo/auth/session"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  type RenderOptions,
  type RenderResult,
  render,
} from "@testing-library/react"
import type { ComponentType, ReactElement, ReactNode } from "react"

export { default as userEvent } from "@testing-library/user-event"
export {
  createNextNavigationState,
  type NextNavigationState,
  nextImageFactory,
  nextLinkFactory,
  nextNavigationFactory,
} from "./next-mocks"

type RenderWithProvidersOptions = {
  initialUser?: User | null
  wrapper?: ComponentType<{ children: ReactNode }>
} & Omit<RenderOptions, "wrapper">

const buildWrapper = (
  initialUser: User | null,
  Outer?: ComponentType<{ children: ReactNode }>
): ComponentType<{ children: ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => {
    const inner = (
      <QueryClientProvider client={queryClient}>
        <SessionProvider initialUser={initialUser}>{children}</SessionProvider>
      </QueryClientProvider>
    )
    return Outer ? <Outer>{inner}</Outer> : inner
  }
  return Wrapper
}

export const renderWithProviders = (
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult => {
  const { initialUser = null, wrapper, ...rest } = options
  return render(ui, { wrapper: buildWrapper(initialUser, wrapper), ...rest })
}

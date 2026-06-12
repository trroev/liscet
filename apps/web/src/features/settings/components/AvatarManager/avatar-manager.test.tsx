// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest"

import { renderWithProviders, userEvent } from "@repo/testing/render"
import { cleanup, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { uploadAvatar, removeAvatar, nav } = vi.hoisted(() => ({
  uploadAvatar: vi.fn(),
  removeAvatar: vi.fn(),
  nav: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    pathname: "/test-user/settings/account",
    searchParams: new URLSearchParams(),
  },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: nav.push,
    replace: nav.replace,
    back: nav.back,
    forward: nav.forward,
    refresh: nav.refresh,
    prefetch: nav.prefetch,
  }),
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.searchParams,
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}))

vi.mock("../../actions/avatar", () => ({
  uploadAvatar,
  removeAvatar,
}))

if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = vi.fn(() => "blob:preview")
  URL.revokeObjectURL = vi.fn()
}

const { AvatarManager } = await import("./avatar-manager")

const makeFile = (name: string, type: string, sizeBytes: number): File => {
  const file = new File(["x"], name, { type })
  Object.defineProperty(file, "size", { value: sizeBytes })
  return file
}

beforeEach(() => {
  uploadAvatar.mockReset()
  removeAvatar.mockReset()
  nav.refresh.mockReset()
})

afterEach(() => {
  cleanup()
})

const openDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "Change photo" }))
  return within(await screen.findByRole("dialog"))
}

describe("AvatarManager", () => {
  it("uploads a valid image and refreshes the route on success", async () => {
    uploadAvatar.mockResolvedValueOnce({
      status: "success",
      data: { mediaId: "media-1", url: "https://cdn.example/a.jpg" },
    })
    const user = userEvent.setup()

    renderWithProviders(<AvatarManager avatarUrl={null} email="u@e.co" />)

    const dialog = await openDialog(user)

    const fileInput = dialog.getByLabelText("Click to choose an image")
    const file = makeFile("a.jpg", "image/jpeg", 1024)
    await user.upload(fileInput, file)

    await user.click(dialog.getByRole("button", { name: "Upload photo" }))

    await waitFor(() => {
      expect(uploadAvatar).toHaveBeenCalledTimes(1)
    })
    const [formData] = uploadAvatar.mock.calls[0] as [FormData]
    expect(formData.get("avatar")).toBeInstanceOf(File)
    expect((formData.get("avatar") as File).name).toBe("a.jpg")
    await waitFor(() => {
      expect(nav.refresh).toHaveBeenCalled()
    })
  })

  it("rejects an oversize file with the expected inline error", async () => {
    const user = userEvent.setup()

    renderWithProviders(<AvatarManager avatarUrl={null} email="u@e.co" />)

    const dialog = await openDialog(user)

    const fileInput = dialog.getByLabelText("Click to choose an image")
    const oversize = makeFile("big.jpg", "image/jpeg", 6 * 1024 * 1024)
    await user.upload(fileInput, oversize)

    expect(
      await dialog.findByText("Image must be under 5 MB.")
    ).toBeInTheDocument()
    expect(uploadAvatar).not.toHaveBeenCalled()
    expect(dialog.getByRole("button", { name: "Upload photo" })).toBeDisabled()
  })
})

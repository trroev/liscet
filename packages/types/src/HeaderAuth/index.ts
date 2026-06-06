export type SignedInAuth = {
  status: "signed-in"
  displayName: string
  initials: string
  avatarUrl: string | null
  onSignOut: () => void | Promise<void>
}

export type HeaderAuth = SignedInAuth | { status: "anonymous" }

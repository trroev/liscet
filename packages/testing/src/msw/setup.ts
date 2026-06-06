import { transferableAbortController } from "node:util"
import { afterAll, afterEach } from "vitest"
import { server } from "./index"

// jsdom installs its own `AbortController`/`AbortSignal` over Node's natives.
// Node's `fetch`/`Request` (undici) reject a jsdom-created signal with
// "Expected signal to be an instance of AbortSignal", which breaks any HTTP
// client that attaches an abort signal (e.g. better-auth's better-fetch).
// Restore the native classes before any test module — and the HTTP clients it
// imports — capture `globalThis.AbortController`. `transferableAbortController`
// is the only public Node API that hands back a native instance, so we read the
// constructors off it.
const NativeAbortController = transferableAbortController()
  .constructor as typeof AbortController
const NativeAbortSignal = new NativeAbortController().signal
  .constructor as typeof AbortSignal
globalThis.AbortController = NativeAbortController
globalThis.AbortSignal = NativeAbortSignal

// Start the MSW interceptor at module-evaluation time rather than in `beforeAll`.
// better-auth's client captures `globalThis.fetch` when `createAuthClient()`
// runs, and the production `authClient` is a module-level singleton created the
// moment its module is imported. Setup files evaluate before the test module
// (and its transitive imports) load, so patching `fetch` here guarantees the
// singleton captures MSW's interceptor instead of the real network.
server.listen({ onUnhandledRequest: "error" })

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

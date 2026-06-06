import type { User } from "@repo/auth"
import { HttpResponse, http, type JsonBodyType } from "msw"

const AUTH_BASE = "/api/auth"

export type SessionPayload = {
  user: User
  session: {
    id: string
    userId: string
    expiresAt: string
  }
}

export const authGetSessionHandler = (payload: SessionPayload | null) =>
  http.get(`${AUTH_BASE}/get-session`, () => HttpResponse.json(payload))

export const authSignInHandler = (payload: SessionPayload) =>
  http.post(`${AUTH_BASE}/sign-in/email`, () => HttpResponse.json(payload))

export const authSignUpHandler = (payload: SessionPayload) =>
  http.post(`${AUTH_BASE}/sign-up/email`, () => HttpResponse.json(payload))

export const authSignOutHandler = () =>
  http.post(`${AUTH_BASE}/sign-out`, () => HttpResponse.json({ success: true }))

export const authErrorHandler = (
  path: string,
  status = 401,
  body: JsonBodyType = { error: "Unauthorized" }
) => http.all(`${AUTH_BASE}/${path}`, () => HttpResponse.json(body, { status }))

type PayloadDoc = { id: string }

type PayloadListPage<TDoc extends PayloadDoc> = {
  docs: Array<TDoc>
  totalDocs: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
  limit: number
}

export const payloadListHandler = <TDoc extends PayloadDoc>(
  collection: string,
  docs: ReadonlyArray<TDoc>
) =>
  http.get(`/api/${collection}`, () => {
    const body: PayloadListPage<TDoc> = {
      docs: [...docs],
      totalDocs: docs.length,
      totalPages: 1,
      page: 1,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
      limit: docs.length,
    }
    return HttpResponse.json(body as unknown as JsonBodyType)
  })

export const payloadFindHandler = <TDoc extends PayloadDoc>(
  collection: string,
  docs: ReadonlyArray<TDoc>
) =>
  http.get(`/api/${collection}/:id`, ({ params }) => {
    const doc = docs.find((d) => d.id === params.id)
    if (!doc) {
      return HttpResponse.json({ errors: ["Not found"] }, { status: 404 })
    }
    return HttpResponse.json(doc as unknown as JsonBodyType)
  })

export const payloadErrorHandler = (
  collection: string,
  status = 500,
  body: JsonBodyType = { errors: ["Server error"] }
) => http.all(`/api/${collection}/*`, () => HttpResponse.json(body, { status }))

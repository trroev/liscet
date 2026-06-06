"use server"

import "server-only"

import type { ActionResult } from "@repo/types/ActionResult"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { serverAction } from "~/lib/server-action"
import { auth } from "../auth.server"

const signOutImpl = async (): Promise<ActionResult<void>> => {
  await auth.api.signOut({ headers: await headers() })
  revalidatePath("/", "layout")
  redirect("/")
}

export const signOutAction = serverAction(signOutImpl)

import { Geist, Geist_Mono } from "next/font/google"

export const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist",
})

export const geistMono = Geist_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

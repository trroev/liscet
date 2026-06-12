"use client"

import type React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

export type DetailPanelState = Readonly<{
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}>

type DetailPanelContentValue = Readonly<{
  content: React.ReactNode
  setContent: (content: React.ReactNode) => void
}>

const DetailPanelStateContext = createContext<DetailPanelState | null>(null)
const DetailPanelContentContext = createContext<DetailPanelContentValue | null>(
  null
)

export const useDetailPanel = (): DetailPanelState => {
  const state = useContext(DetailPanelStateContext)
  if (!state) {
    throw new Error("useDetailPanel must be used within a DetailPanelProvider")
  }
  return state
}

export const useDetailPanelContent = (): DetailPanelContentValue => {
  const value = useContext(DetailPanelContentContext)
  if (!value) {
    throw new Error(
      "DetailPanel components must be used within a DetailPanelProvider"
    )
  }
  return value
}

export type DetailPanelProviderProps = {
  children: React.ReactNode
}

export const DetailPanelProvider = ({ children }: DetailPanelProviderProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState<React.ReactNode>(null)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((previous) => !previous), [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "i"
      ) {
        event.preventDefault()
        toggle()
        return
      }
      if (event.key === "Escape") {
        close()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggle, close])

  const state = useMemo<DetailPanelState>(
    () => ({ close, isOpen, open, toggle }),
    [close, isOpen, open, toggle]
  )
  const contentValue = useMemo<DetailPanelContentValue>(
    () => ({ content, setContent }),
    [content]
  )

  return (
    <DetailPanelStateContext.Provider value={state}>
      <DetailPanelContentContext.Provider value={contentValue}>
        {children}
      </DetailPanelContentContext.Provider>
    </DetailPanelStateContext.Provider>
  )
}

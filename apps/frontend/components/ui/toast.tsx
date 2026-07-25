"use client"

import { createContext, useCallback, useContext, useState } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type ToastVariant = "success" | "error" | "info"

interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, message, variant }])
      if (variant !== "error") {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 2000)
      }
    },
    [],
  )

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-white shadow-lg",
              "animate-[toastSlideIn_0.25s_ease]",
              toast.variant === "success" && "bg-green-600",
              toast.variant === "error" && "bg-destructive",
              toast.variant === "info" && "bg-foreground",
            )}
            style={{ maxWidth: 320 }}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className="ml-auto shrink-0 opacity-70 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}

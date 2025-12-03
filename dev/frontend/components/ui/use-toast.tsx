"use client";

import { createContext, useCallback, useContext, useState } from "react"
import {
  ToastProvider as RadixToastProvider,
  Toast,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "./toast"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
}

type ToastContextType = {
  toast: (opts: ToastProps) => void
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback((opts: ToastProps) => {
    setToasts((prev) => [...prev, opts])

    setTimeout(() => {
      setToasts((prev) => prev.slice(1))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToastProvider>
        {children}
        <ToastViewport />

        {toasts.map((t, i) => (
         <Toast
            key={i}
            duration={3000}
            className={
              t.variant === "success"
                ? "border-green-600 text-green-700 dark:text-green-300"
                : t.variant === "error"
                ? "border-red-600 text-red-700 dark:text-red-300"
                : t.variant === "warning"
                ? "border-yellow-600 text-yellow-700 dark:text-yellow-300"
                : ""
            }
          >
            {t.title && <ToastTitle>{t.title}</ToastTitle>}
            {t.description && (
              <ToastDescription>{t.description}</ToastDescription>
            )}
          </Toast>
        ))}
      </RadixToastProvider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

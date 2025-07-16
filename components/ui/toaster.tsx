"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()
  
  // Debug logging
  console.log("Toaster render - Number of toasts:", toasts.length);
  console.log("Toasts data:", toasts);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        console.log("Rendering toast:", { id, title, description });
        return (
          <Toast key={id} {...props} className="!z-[9999] !fixed">
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="!z-[9999] !fixed !top-4 !right-4" />
    </ToastProvider>
  )
}

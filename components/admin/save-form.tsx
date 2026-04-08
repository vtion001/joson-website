"use client"
import * as React from "react"
import { useFormStatus } from "react-dom"

interface SaveFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData, ...args: any[]) => Promise<any> | void
  children: React.ReactNode
  className?: string
}

interface SubmitButtonProps {
  children: React.ReactNode
  className?: string
}

export const SaveForm = ({ action, children, className }: SaveFormProps) => {
  return (
    <form action={action as (formData: FormData) => void | Promise<void>} className={className}>{children}</form>
  )
}

export const SubmitButton = ({ children, className }: SubmitButtonProps) => {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      aria-busy={pending}
      data-pending={pending ? "true" : "false"}
    >
      {children}
    </button>
  )
}

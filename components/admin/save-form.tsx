"use client"
import * as React from "react"

interface FormStatusContextValue {
  pending: boolean
  setPending: (pending: boolean) => void
}

const FormStatusContext = React.createContext<FormStatusContextValue | null>(null)

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
  const [pending, setPending] = React.useState(false)

  const handleAction = async (formData: FormData) => {
    setPending(true)
    try {
      await action(formData)
    } finally {
      setPending(false)
    }
  }

  return (
    <FormStatusContext.Provider value={{ pending, setPending }}>
      <form action={handleAction} className={className}>{children}</form>
    </FormStatusContext.Provider>
  )
}

export const SubmitButton = ({ children, className }: SubmitButtonProps) => {
  const context = React.useContext(FormStatusContext)
  const pending = context?.pending ?? false

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

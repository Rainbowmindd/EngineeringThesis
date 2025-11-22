"use client"

import { useState, ReactNode, FC } from "react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

interface DialogTriggerProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

interface DialogContentProps {
  children: ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: ReactNode
  className?: string
}

interface DialogTitleProps {
  children: ReactNode
  className?: string
}

// Główny komponent Dialog
export const Dialog: FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = useState(open ?? false)

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value)
    onOpenChange?.(value)
  }

  return (
    <>
      {typeof children === "function"
        ? children({ open: isOpen, setOpen: handleOpenChange })
        : children}
    </>
  )
}

// Trigger do otwierania dialogu
export const DialogTrigger: FC<DialogTriggerProps> = ({ children, onClick, className }) => {
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// Treść okna dialogowego
export const DialogContent: FC<DialogContentProps> = ({ children, className }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50`}>
      <div className={`bg-white rounded-lg shadow-lg p-6 w-full max-w-md ${className}`}>
        {children}
      </div>
    </div>
  )
}

// Nagłówek dialogu
export const DialogHeader: FC<DialogHeaderProps> = ({ children, className }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

// Tytuł dialogu
export const DialogTitle: FC<DialogTitleProps> = ({ children, className }) => {
  return <h3 className={`text-lg font-bold ${className}`}>{children}</h3>
}

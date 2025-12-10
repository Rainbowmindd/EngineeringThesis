
import React, { useState, type ReactNode, type FC, createContext, useContext } from "react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

interface DialogTriggerProps {
  children: ReactNode
  className?: string
  asChild?: boolean
  onClick?: () => void
}

interface DialogContextType {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

const useDialogContext = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error("DialogTrigger and DialogContent must be used within the <Dialog> component.");
    }
    return context;
};


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

export const Dialog: FC<DialogProps> = ({ open: propOpen, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = useState(propOpen ?? false);

  React.useEffect(() => {
      if (propOpen !== undefined) {
          setIsOpen(propOpen);
      }
  }, [propOpen]);

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value);
    onOpenChange?.(value);
  }

  const contextValue = React.useMemo(() => ({
    isOpen,
    setIsOpen: handleOpenChange,
  }), [isOpen]);


  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  )
}

export const DialogTrigger: FC<DialogTriggerProps> = ({ children, onClick, className, asChild }) => {
  const { setIsOpen } = useDialogContext();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
    onClick?.();
  };

  if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
          onClick: handleClick,
          className: className,
      });
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

export const DialogContent: FC<DialogContentProps> = ({ children, className }) => {
  const { isOpen, setIsOpen } = useDialogContext();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
          setIsOpen(false);
      }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50`}
      onClick={handleBackdropClick} // Obsługa kliknięcia na tło
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-lg shadow-2xl p-6 max-w-md max-h-[90vh] overflow-y-auto ${className}`}
        onClick={(e) => e.stopPropagation()} // Zapobieganie zamykaniu po kliknięciu w środek
      >
        {children}
      </div>
    </div>
  )
}

export const DialogHeader: FC<DialogHeaderProps> = ({ children, className }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

export const DialogTitle: FC<DialogTitleProps> = ({ children, className }) => {
  return <h3 className={`text-xl font-bold text-gray-900 ${className}`}>{children}</h3>
}
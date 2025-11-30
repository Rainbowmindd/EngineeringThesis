
import React, { useState, type ReactNode, type FC, createContext, useContext } from "react"

// --- 1. DEFINICJA TYPÓW I KONTEKSTU ---

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

interface DialogTriggerProps {
  children: ReactNode
  className?: string
  asChild?: boolean // Dodajemy asChild dla elastyczności, jeśli będzie potrzebne
  onClick?: () => void
}

interface DialogContextType {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

// Kontekst do przekazywania stanu i funkcji otwierającej
const DialogContext = createContext<DialogContextType | undefined>(undefined);

const useDialogContext = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error("DialogTrigger and DialogContent must be used within the <Dialog> component.");
    }
    return context;
};

// --- 2. KOMPONENTY UI (Treść Modala) ---

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


// --- 3. GŁÓWNY KOMPONENT DIALOG ---

export const Dialog: FC<DialogProps> = ({ open: propOpen, onOpenChange, children }) => {
  // Używamy stanu wewnętrznego, który może być kontrolowany przez prop 'open'
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

// --- 4. DIALOG TRIGGER (Przycisk otwierający) ---

export const DialogTrigger: FC<DialogTriggerProps> = ({ children, onClick, className, asChild }) => {
  const { setIsOpen } = useDialogContext();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
    onClick?.();
  };

  // Jeśli asChild jest true, używamy pierwszego dziecka jako przycisku
  if (asChild) {
      // Zakładamy, że children jest jednym elementem React (np. Button)
      return React.cloneElement(children as React.ReactElement, {
          onClick: handleClick,
          className: className, // Przekazywanie klasy do przycisku
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

// --- 5. DIALOG CONTENT (Treść okna) ---

export const DialogContent: FC<DialogContentProps> = ({ children, className }) => {
  const { isOpen, setIsOpen } = useDialogContext();

  if (!isOpen) return null; // Warunkowe renderowanie

  // Logika zamykania po kliknięciu poza oknem (backdrop)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Sprawdź, czy kliknięcie nastąpiło bezpośrednio na tle, a nie wewnątrz modala
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

// --- 6. POZOSTAŁE KOMPONENTY (Style Tailwind) ---

export const DialogHeader: FC<DialogHeaderProps> = ({ children, className }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

export const DialogTitle: FC<DialogTitleProps> = ({ children, className }) => {
  return <h3 className={`text-xl font-bold text-gray-900 ${className}`}>{children}</h3>
}
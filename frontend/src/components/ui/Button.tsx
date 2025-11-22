// components/ui/Button.tsx

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority" // Importujemy tylko typy

import { cn } from "@/lib/utils"
// Nowy import:
import { buttonVariants } from "./button-variants" 

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// ZMIANA: Eksportujemy TYLKO komponent Button
export { Button } 
// Jeśli inne komponenty w projekcie potrzebują dostępu do 'buttonVariants', 
// powinny importować je bezpośrednio z './button-variants'.
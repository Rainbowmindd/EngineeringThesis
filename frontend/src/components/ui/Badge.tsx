// components/ui/Badge.tsx

import * as React from "react"
import { type VariantProps } from "class-variance-authority" // Importujemy tylko typy

import { cn } from "@/lib/utils"
// Nowy import:
import { badgeVariants } from "./badge-variants" 

// Interfejs typów wariantów musi być przeniesiony do Badge.tsx, 
// ponieważ jest używany przez BadgeProps
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {} 

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge } // Eksportujemy TYLKO komponent Badge
// Nie eksportujemy już badgeVariants z tego pliku
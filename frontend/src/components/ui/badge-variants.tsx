
import { cva } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-green-500 text-white shadow hover:bg-green-500/80",
        secondary:
          "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-100/80",
        outline: "text-gray-900",
        // Wariant specjalny dla sekcji Hero
        primaryOutline: "bg-green-100 text-green-700 border border-green-200",
        // Warianty statusu
        confirmed: "bg-green-100 text-green-800 border border-green-200 font-semibold",
        new: "bg-orange-100 text-orange-800 border border-orange-200 font-semibold",
        finished: "bg-blue-100 text-blue-800 border border-blue-200 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
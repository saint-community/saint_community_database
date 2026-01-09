import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { cva, type VariantProps } from "class-variance-authority"

export { cva, type VariantProps }

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

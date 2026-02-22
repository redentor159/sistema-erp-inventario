import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string | null | undefined, currency: "PEN" | "USD" = "PEN"): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  if (value === undefined || value === null || isNaN(value)) return currency === "USD" ? "$ 0.00" : "S/ 0.00"

  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-PE", {
    style: "currency",
    currency: currency,
  }).format(value)
}

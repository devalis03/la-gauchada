// Formatea un número como precio en formato $40.000
export function formatPrice(value: number): string {
  return "$" + value.toLocaleString("es-AR");
}
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

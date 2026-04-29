import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizePlayerName(name: string | null | undefined): string {
  if (!name) return 'Unknown';
  return name.replace(/\s+\d+\s*$/, '').trim() || 'Unknown';
}

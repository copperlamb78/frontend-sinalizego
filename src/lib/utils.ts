import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ⚡ Bolt: Cache Intl.NumberFormat instance to improve performance
// Creating a new Intl.NumberFormat instance is expensive (~100x slower than reusing).
// Since we only use pt-BR and BRL, caching the instance speeds up renders significantly,
// especially in large lists (e.g., StorefrontPage, OwnerFinancialPage).
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

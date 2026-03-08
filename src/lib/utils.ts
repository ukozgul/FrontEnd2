import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// className birleştirme fonksiyonu
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
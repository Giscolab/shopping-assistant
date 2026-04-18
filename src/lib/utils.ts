import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `${Math.round(value)} %`;
}

export function formatCm(value: number | null | undefined, digits = 1) {
  return typeof value === "number" ? `${value.toFixed(digits)} cm` : "Non renseigné";
}

export function formatKg(value: number | null | undefined, digits = 1) {
  return typeof value === "number" ? `${value.toFixed(digits)} kg` : "Non renseigné";
}

export function downloadTextFile(filename: string, content: string, mime = "application/json") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

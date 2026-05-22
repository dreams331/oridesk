import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getSentimentColour(sentiment: string | null): string {
  switch (sentiment) {
    case "positive": return "text-green-600 bg-green-50";
    case "neutral": return "text-blue-600 bg-blue-50";
    case "negative": return "text-orange-600 bg-orange-50";
    case "angry": return "text-red-600 bg-red-50";
    default: return "text-slate-600 bg-slate-50";
  }
}

export function getStatusColour(status: string): string {
  switch (status) {
    case "OPEN": return "text-blue-700 bg-blue-100";
    case "IN_PROGRESS": return "text-yellow-700 bg-yellow-100";
    case "RESOLVED": return "text-green-700 bg-green-100";
    case "CLOSED": return "text-slate-700 bg-slate-100";
    default: return "text-slate-700 bg-slate-100";
  }
}

export function getPriorityColour(priority: string): string {
  switch (priority) {
    case "LOW": return "text-slate-600 bg-slate-100";
    case "MEDIUM": return "text-blue-600 bg-blue-100";
    case "HIGH": return "text-orange-600 bg-orange-100";
    case "URGENT": return "text-red-600 bg-red-100";
    default: return "text-slate-600 bg-slate-100";
  }
}

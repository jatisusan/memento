import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateString: string): string {
  const now: Date = new Date();
  const past: Date = new Date(dateString);
  const diffInSeconds: number = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals: { label: string; seconds: number }[] = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 }
  ];

  for (const interval of intervals) {
      const count: number = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
          return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
      }
  }
  return "Just now";
}

export const checkIsLiked = (likeList: string[], userId: string) => {
  return likeList.includes(userId);
};
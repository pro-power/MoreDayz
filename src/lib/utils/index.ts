// Updated src/lib/utils/index.ts with better debugging

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(hour: number, minute: number = 0): string {
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

export function parseTime(timeString: string): { hour: number; minute: number } {
  // Handle both "12:00 PM" and "12:00" formats
  const parts = timeString.trim().split(' ');
  const timePart = parts[0];
  const period = parts[1]; // Could be undefined
  
  const [hourStr, minuteStr] = timePart.split(':');
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr || '0');
  
  // Convert to 24-hour format if period is provided
  if (period) {
    if (period.toLowerCase() === 'pm' && hour !== 12) hour += 12;
    if (period.toLowerCase() === 'am' && hour === 12) hour = 0;
  }
  
  console.log('parseTime:', { input: timeString, output: { hour, minute } });
  return { hour, minute };
}

// Convert hour and minute to pixel position (24-hour schedule)
export function timeToPixels(hour: number, minute: number = 0): number {
  const totalMinutes = (hour * 60) + minute;
  const pixelsPerMinute = 64 / 60; // 64px per hour = ~1.067px per minute
  const pixels = totalMinutes * pixelsPerMinute;
  
  console.log('timeToPixels:', { hour, minute, totalMinutes, pixels });
  return pixels;
}

// Convert pixel position to hour and minute
export function pixelsToTime(pixels: number): { hour: number; minute: number } {
  const pixelsPerMinute = 64 / 60;
  const totalMinutes = pixels / pixelsPerMinute;
  const hour = Math.floor(totalMinutes / 60);
  const minute = Math.floor((totalMinutes % 60) / 15) * 15; // Round to 15-minute intervals
  
  // Ensure hour stays within 0-23 range
  const validHour = Math.max(0, Math.min(23, hour));
  
  console.log('pixelsToTime:', { pixels, totalMinutes, hour: validHour, minute });
  return { hour: validHour, minute };
}
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
  const [time, period] = timeString.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr);
  const minute = parseInt(minuteStr || '0');
  
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  return { hour, minute };
}

export function timeToPixels(hour: number, minute: number = 0): number {
  const adjustedHour = hour - 6; // Adjust for 6 AM start
  return (adjustedHour * 64) + ((minute / 60) * 64);
}

export function pixelsToTime(pixels: number): { hour: number; minute: number } {
  const totalMinutes = (pixels / 64) * 60;
  const hour = Math.floor(totalMinutes / 60) + 6; // Add back 6 AM offset
  const minute = Math.floor((totalMinutes % 60) / 15) * 15; // Round to 15-minute intervals
  return { hour, minute };
}
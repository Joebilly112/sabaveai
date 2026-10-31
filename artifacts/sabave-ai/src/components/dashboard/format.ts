import type { SignalDay } from '@workspace/api-client-react';

/** Cutoffs from artifacts/api-server/src/signals/hazeSignal.ts levelFor. */
export const SEVERITY_COLORS = ['#2BB673', '#E0A82E', '#F08A3C', '#E0563F'] as const;
export const SEVERITY_LABELS = ['Good', 'Moderate', 'Unhealthy', 'Very unhealthy'] as const;
export const SEVERITY_HINTS = [
  'Under 35 µg/m³',
  '35–55 µg/m³',
  'Above 55 up to 150 µg/m³',
  'Above 150 µg/m³',
] as const;

/** Alert fires at level >= 2, which starts once PM2.5 is above 55. */
export const ALERT_THRESHOLD = 55;

export function clampLevel(level: number) {
  if (!Number.isFinite(level)) return 0;
  return Math.max(0, Math.min(3, Math.round(level)));
}

export function formatDateParts(date: string) {
  const value = new Date(date.length === 10 ? `${date}T12:00:00` : date);
  if (Number.isNaN(value.getTime())) return { day: date, date };
  return {
    day: new Intl.DateTimeFormat('en-MY', { weekday: 'short' }).format(value),
    date: new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short' }).format(value),
  };
}

export function formatDay(date: string) {
  const value = new Date(date.length === 10 ? `${date}T12:00:00` : date);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat('en-MY', { weekday: 'short', day: 'numeric', month: 'short' }).format(value);
}

export function formatStamp(iso?: string) {
  if (!iso) return null;
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return null;
  return new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(value);
}

export function peakDay(days: SignalDay[], peakDate?: string) {
  if (peakDate) {
    const match = days.find((day) => day.date.slice(0, 10) === peakDate.slice(0, 10));
    if (match) return match;
  }
  return days.reduce<SignalDay | undefined>((best, day) => {
    if (!best) return day;
    if (day.level > best.level || (day.level === best.level && day.value > best.value)) return day;
    return best;
  }, undefined);
}

export function malaysiaToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function scrollToSection(id: string) {
  const node = document.getElementById(id);
  if (!node) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

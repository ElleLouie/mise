// Dates for the weekly plan, as local "YYYY-MM-DD" strings so they don't shift with time zones.

export function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const today = () => isoDate(new Date());

// The seven days (Monday first) of the week containing `date`, shifted by `offset` weeks.
export function weekDays(offset = 0, date = new Date()) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return isoDate(day);
  });
}

export function dayLabel(iso, style = 'long') {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return style === 'short'
    ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : date.toLocaleDateString('en-US', { weekday: 'long' });
}

export const dayNumber = (iso) => Number(iso.slice(8));

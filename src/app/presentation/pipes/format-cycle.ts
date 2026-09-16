const BOGOTA = 'America/Bogota';
const MS_DAY = 24 * 60 * 60 * 1000;

export const formatDayMonth = (iso: string, locale: string): string =>
  new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: BOGOTA,
  });

export const formatLongDate = (iso: string, locale: string): string =>
  new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: BOGOTA,
  });

const startOfBogotaDay = (date: Date): number => {
  const isoDay = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOGOTA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

  return Date.parse(`${isoDay}T00:00:00Z`);
};

export const daysUntil = (iso: string, now = new Date()): number =>
  Math.round((startOfBogotaDay(new Date(iso)) - startOfBogotaDay(now)) / MS_DAY);

export const formatCycleRange = (fromIso: string, closesOnIso: string, locale: string): string =>
  `${formatDayMonth(fromIso, locale)} – ${formatDayMonth(closesOnIso, locale)}`;

export const formatDueLabel = (dueIso: string, locale: string, now = new Date()): string => {
  const days = daysUntil(dueIso, now);
  const date = formatDayMonth(dueIso, locale);

  if (days < 0) return `Venció el ${date}`;
  if (days === 0) return `Se paga hoy, ${date}`;
  if (days === 1) return `Se paga mañana, ${date}`;

  return `Faltan ${days} días · ${date}`;
};

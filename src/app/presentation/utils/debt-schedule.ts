import { Debt } from '../../domain/entities/debt.entity';
import { shiftMonth } from './month';

export enum DueStatus {
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  SOON = 'SOON',
  UPCOMING = 'UPCOMING',
}

/** Días antes del vencimiento en que un pago pasa a "pronto" (ámbar). */
export const SOON_DAYS = 7;
/** Días antes del vencimiento en que un pago cuenta para el badge del menú. */
export const ALERT_DAYS = 5;

// Un pago cubre la cuota aunque le falten unos pesos por redondeo.
const PAID_TOLERANCE = 1;

const DAY_MS = 24 * 60 * 60 * 1000;

const bogotaDayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export interface DueItem {
  debt: Debt;
  /** YYYY-MM-DD del vencimiento de este mes. */
  dueDate: string;
  /** Negativo si ya venció. */
  daysUntil: number;
  /** Lo pagado desde el vencimiento del mes anterior. */
  paid: number;
  remaining: number;
  status: DueStatus;
}

export const bogotaDay = (date: Date = new Date()): string => bogotaDayFormatter.format(date);

/** Día de pago dentro del mes; un 31 en un mes de 30 días cae el 30. */
export const dueDateFor = (month: string, dueDay: number): string => {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return `${month}-${String(Math.min(dueDay, lastDay)).padStart(2, '0')}`;
};

export const daysBetween = (from: string, to: string): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);

/**
 * Estado de la cuota del mes de una deuda con día de pago. Cuenta como pagado
 * todo lo registrado después del vencimiento anterior: así un pago hecho el 30
 * de octubre cubre la cuota que vence el 2 de noviembre.
 */
export const dueItemFor = (debt: Debt, today: string): DueItem | null => {
  if (debt.dueDay === undefined) return null;

  const month = today.slice(0, 7);
  const dueDate = dueDateFor(month, debt.dueDay);
  const previousDueDate = dueDateFor(shiftMonth(month, -1), debt.dueDay);

  const paid = debt.recentPayments
    .filter((payment) => bogotaDay(new Date(payment.paidAt)) > previousDueDate)
    .reduce((sum, payment) => sum + payment.amount, 0);

  const remaining = Math.max(debt.monthlyPayment - paid, 0);
  const daysUntil = daysBetween(today, dueDate);

  let status: DueStatus;
  if (remaining <= PAID_TOLERANCE) status = DueStatus.PAID;
  else if (daysUntil < 0) status = DueStatus.OVERDUE;
  else if (daysUntil <= SOON_DAYS) status = DueStatus.SOON;
  else status = DueStatus.UPCOMING;

  return { debt, dueDate, daysUntil, paid, remaining, status };
};

const STATUS_ORDER: Record<DueStatus, number> = {
  [DueStatus.OVERDUE]: 0,
  [DueStatus.SOON]: 1,
  [DueStatus.UPCOMING]: 2,
  [DueStatus.PAID]: 3,
};

/** Cuotas propias del mes: primero lo vencido, luego por fecha; lo pagado al final. */
export const monthChecklist = (debts: Debt[], today: string): DueItem[] =>
  debts
    .filter((debt) => !debt.archived && !debt.paidByOther)
    .map((debt) => dueItemFor(debt, today))
    .filter((item): item is DueItem => item !== null)
    .filter((item) => item.debt.balance > 0 || item.status === DueStatus.PAID)
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.daysUntil - b.daysUntil);

/** Vencidos o que vencen en los próximos `ALERT_DAYS` días y siguen sin pagar. */
export const alertCount = (items: DueItem[]): number =>
  items.filter(
    (item) =>
      item.status === DueStatus.OVERDUE ||
      (item.status === DueStatus.SOON && item.daysUntil <= ALERT_DAYS),
  ).length;

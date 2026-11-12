import { Debt } from '../../domain/entities/debt.entity';
import { dueDateFor } from './debt-schedule';
import { shiftMonth } from './month';

const CRLF = '\r\n';

// Texto libre dentro de un .ics: comas, punto y coma y saltos van escapados.
const escapeText = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

const compactDate = (isoDay: string): string => isoDay.replace(/-/g, '');

const utcStamp = (date: Date): string =>
  date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');

/**
 * Calendario .ics con un evento de todo el día que se repite cada mes en el día
 * de pago de cada deuda propia, con alarma 3 días antes y el mismo día a las 9.
 */
export const buildDebtCalendar = (
  debts: Debt[],
  today: string,
  formatAmount: (value: number) => string,
  now: Date = new Date(),
): string => {
  const month = today.slice(0, 7);
  const stamp = utcStamp(now);

  const events = debts
    .filter((debt) => !debt.archived && !debt.paidByOther && debt.dueDay !== undefined)
    .filter((debt) => debt.balance > 0)
    .flatMap((debt) => {
      const thisMonth = dueDateFor(month, debt.dueDay!);
      const first = thisMonth >= today ? thisMonth : dueDateFor(shiftMonth(month, 1), debt.dueDay!);
      const summary = escapeText(`Pagar ${debt.name}: ${formatAmount(debt.monthlyPayment)}`);

      return [
        'BEGIN:VEVENT',
        `UID:debt-${debt.id}@w8st-go`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${compactDate(first)}`,
        `RRULE:FREQ=MONTHLY;BYMONTHDAY=${debt.dueDay}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${escapeText('Cuota del plan de deudas de W8st & Go.')}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'TRIGGER:-P3D',
        `DESCRIPTION:${summary}`,
        'END:VALARM',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'TRIGGER:PT9H',
        `DESCRIPTION:${summary}`,
        'END:VALARM',
        'END:VEVENT',
      ];
    });

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//W8st & Go//Deudas//ES',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Pagos de deudas',
    ...events,
    'END:VCALENDAR',
    '',
  ].join(CRLF);
};

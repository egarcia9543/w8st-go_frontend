import { Debt, DebtKind } from '../../domain/entities/debt.entity';
import {
  alertCount,
  daysBetween,
  dueDateFor,
  dueItemFor,
  DueStatus,
  monthChecklist,
} from './debt-schedule';

const debt = (id: string, extra: Partial<Debt> = {}): Debt => ({
  id,
  name: id,
  kind: DebtKind.CREDIT_CARD,
  balance: 1000000,
  annualRate: 28.5582,
  monthlyPayment: 300000,
  dueDay: 17,
  paidByOther: false,
  archived: false,
  updatedAt: '2026-11-01T00:00:00Z',
  recentPayments: [],
  ...extra,
});

const TODAY = '2026-11-11';

describe('dueDateFor', () => {
  it('ajusta el día al último del mes', () => {
    expect(dueDateFor('2026-11', 17)).toBe('2026-11-17');
    expect(dueDateFor('2026-11', 31)).toBe('2026-11-30');
    expect(dueDateFor('2027-02', 30)).toBe('2027-02-28');
  });
});

describe('daysBetween', () => {
  it('cuenta días calendario, negativo hacia atrás', () => {
    expect(daysBetween(TODAY, '2026-11-17')).toBe(6);
    expect(daysBetween(TODAY, '2026-11-03')).toBe(-8);
  });
});

describe('dueItemFor', () => {
  it('sin día de pago no entra al checklist', () => {
    expect(dueItemFor(debt('x', { dueDay: undefined }), TODAY)).toBeNull();
  });

  it('marca vencido, pronto y con tiempo', () => {
    expect(dueItemFor(debt('a', { dueDay: 3 }), TODAY)?.status).toBe(DueStatus.OVERDUE);
    expect(dueItemFor(debt('b', { dueDay: 17 }), TODAY)?.status).toBe(DueStatus.SOON);
    expect(dueItemFor(debt('c', { dueDay: 25 }), TODAY)?.status).toBe(DueStatus.UPCOMING);
  });

  it('un pago después del vencimiento anterior cubre la cuota del mes', () => {
    const item = dueItemFor(
      debt('rappi', {
        dueDay: 2,
        monthlyPayment: 1193688,
        recentPayments: [{ amount: 1193688, paidAt: '2026-10-30T15:00:00Z' }],
      }),
      TODAY,
    );

    expect(item?.status).toBe(DueStatus.PAID);
    expect(item?.remaining).toBe(0);
  });

  it('un pago anterior al vencimiento previo no cuenta', () => {
    const item = dueItemFor(
      debt('amex', {
        dueDay: 3,
        recentPayments: [{ amount: 300000, paidAt: '2026-09-29T15:00:00Z' }],
      }),
      TODAY,
    );

    expect(item?.status).toBe(DueStatus.OVERDUE);
    expect(item?.paid).toBe(0);
  });
});

describe('monthChecklist y alertCount', () => {
  it('ordena lo vencido primero y deja por fuera lo que paga otra persona', () => {
    const items = monthChecklist(
      [
        debt('moto', { dueDay: 19 }),
        debt('amex', { dueDay: 3 }),
        debt('mamá', { dueDay: 3, paidByOther: true }),
        debt('mastercard', { dueDay: 17 }),
      ],
      TODAY,
    );

    expect(items.map((item) => item.debt.id)).toEqual(['amex', 'mastercard', 'moto']);
    expect(alertCount(items)).toBe(1);
  });
});

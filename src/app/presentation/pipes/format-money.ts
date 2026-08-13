const formatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(value: number, currency: string, locale: string): string {
  const key = `${locale}|${currency}`;
  let formatter = formatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
      maximumFractionDigits: 0,
    });
    formatters.set(key, formatter);
  }

  return formatter.format(value);
}

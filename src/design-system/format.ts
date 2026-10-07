/**
 * Hoisted formatters for the visual-validation harness (D06 / RFG-139).
 *
 * Creating `Intl` instances per render is expensive; they live at module scope
 * so fixtures render identically and cheaply. Dates reuse the shared `es-AR`
 * formatters from `dateFormat`; only currency is local because the production
 * formatter lives inside the `expenses` feature, which this module must not
 * import.
 */
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

export function formatAmountCents(amountCents: number): string {
  return currencyFormatter.format(amountCents / 100);
}

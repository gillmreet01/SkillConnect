const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Money is stored as integer cents to avoid floating-point rounding.
export function formatCents(cents: number) {
  return usd.format(cents / 100);
}

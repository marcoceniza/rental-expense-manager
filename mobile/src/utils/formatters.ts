export const formatCurrency = (
  amount: number,
  options?: { showPlusSign?: boolean; isNegative?: boolean }
): string => {
  const isNegative = amount < 0 || options?.isNegative;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (isNegative) {
    return `-₱${formatted}`;
  }
  if (options?.showPlusSign && amount > 0) {
    return `+₱${formatted}`;
  }
  return `₱${formatted}`;
};

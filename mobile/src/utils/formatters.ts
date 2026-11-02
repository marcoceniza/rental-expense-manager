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

export const getMonthName = (dateStr: string): string => {
  // e.g. "Sep 28, 2026" or "2026-09-28"
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const parts = dateStr.split(' ');
    if (parts.length > 0) return parts[0];
    return 'Unknown';
  }
  return d.toLocaleString('en-US', { month: 'long' });
};

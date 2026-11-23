import { formatCurrency } from '@/utils/formatters';

describe('formatCurrency', () => {
  test('formats a positive amount with the Philippine peso sign', () => {
    expect(formatCurrency(1234.5)).toBe('₱1,234.50');
  });

  test('formats zero with two decimal places and no sign', () => {
    expect(formatCurrency(0)).toBe('₱0.00');
  });

  test('formats a negative amount with a leading minus sign', () => {
    expect(formatCurrency(-1234.5)).toBe('-₱1,234.50');
  });

  test('honours the isNegative option for a positive amount', () => {
    expect(formatCurrency(1234.5, { isNegative: true })).toBe('-₱1,234.50');
  });

  test('adds a plus sign when requested for a positive amount', () => {
    expect(formatCurrency(1234.5, { showPlusSign: true })).toBe('+₱1,234.50');
  });

  test('does not add a plus sign for zero', () => {
    expect(formatCurrency(0, { showPlusSign: true })).toBe('₱0.00');
  });

  test('gives the minus sign precedence over the plus sign', () => {
    expect(formatCurrency(-42, { showPlusSign: true })).toBe('-₱42.00');
    expect(formatCurrency(42, { showPlusSign: true, isNegative: true })).toBe('-₱42.00');
  });

  test('rounds to two decimals and groups thousands', () => {
    expect(formatCurrency(1234567.891)).toBe('₱1,234,567.89');
    expect(formatCurrency(9.999)).toBe('₱10.00');
  });

  test('uses the absolute value before prefixing when isNegative is set', () => {
    expect(formatCurrency(-9.9, { isNegative: true })).toBe('-₱9.90');
  });
});

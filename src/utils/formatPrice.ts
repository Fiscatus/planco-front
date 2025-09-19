import type { Currency } from '@/globals/types/Product';

export const formatPrice = (price: number, currency: Currency): string => {
  const integerPrice = price / 100;
  const decimals = integerPrice - Math.floor(integerPrice);
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });
  return price >= 0 ? (decimals ? formatter.format(price / 100) : formatter.format(price / 100).split('.')[0]) : '';
};

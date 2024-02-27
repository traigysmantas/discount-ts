import { ShippingData } from './rules/types/shipping-data.type';

export const shippingData: ShippingData[] = [
  { provider: 'LP', packageSize: 'S', price: 1.5 },
  { provider: 'LP', packageSize: 'M', price: 4.9 },
  { provider: 'LP', packageSize: 'L', price: 6.9 },
  { provider: 'MR', packageSize: 'S', price: 2.0 },
  { provider: 'MR', packageSize: 'M', price: 3.0 },
  { provider: 'MR', packageSize: 'L', price: 4.0 },
];

export const packagePrices = {
  'LP-S': 1.5,
  'LP-M': 4.9,
  'LP-L': 6.9,
  'MR-S': 2.0,
  'MR-M': 3.0,
  'MR-L': 4.0,
};

import { getIsoDay } from './get-iso-day';

describe(`${getIsoDay.name}`, () => {
  it('returns year-month-day from date object', () => {
    const result = getIsoDay(new Date('2024-01-01T05:00'));

    expect(result).toBe('2024-01-01');
  });
});

import { calculateAge } from '../utils/ageCalculator';

describe('calculateAge', () => {
  it('should correctly calculate age from "YYYYMMDD" string', () => {
    const birthDateString = '19900101';
    const expectedAge = new Date().getFullYear() - 1990;
    expect(calculateAge(birthDateString)).toEqual(expectedAge);
  });

  it('should account for today being before the birth date in "YYYYMMDD" format', () => {
    const today = new Date();
    const birthDate = `${today.getFullYear() - 25}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}`;
    const expectedAge =
      today.getMonth() + 1 < parseInt(birthDate.substring(4, 6), 10) ||
      (today.getMonth() + 1 === parseInt(birthDate.substring(4, 6), 10) &&
        today.getDate() < parseInt(birthDate.substring(6, 8), 10))
        ? 24
        : 25;
    expect(calculateAge(birthDate)).toEqual(expectedAge);
  });
});

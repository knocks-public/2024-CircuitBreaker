/**
 *
 * @param birthDateString
 * @returns
 */
export function calculateAge(birthDateString: string): number {
  const year = parseInt(birthDateString.substring(0, 4), 10);
  const month = parseInt(birthDateString.substring(4, 6), 10) - 1; //`0` is January
  const day = parseInt(birthDateString.substring(6, 8), 10);

  const dob = new Date(year, month, day);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculate age from birthdate
 * @param birthdate - ISO date string or Date object
 * @returns Age in years
 */
export function calculateAge(birthdate: string | Date): number {
  const birth = typeof birthdate === "string" ? new Date(birthdate) : birthdate;
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Format birthdate to readable format
 * @param birthdate - ISO date string
 * @returns Formatted date string (e.g., "January 1, 1990")
 */
export function formatBirthdate(birthdate: string): string {
  const date = new Date(birthdate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get zodiac sign from birthdate
 * @param birthdate - ISO date string
 * @returns Zodiac sign name
 */
export function getZodiacSign(birthdate: string): string {
  const date = new Date(birthdate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const zodiacs = [
    { sign: "Capricorn", start: [12, 22], end: [1, 19] },
    { sign: "Aquarius", start: [1, 20], end: [2, 18] },
    { sign: "Pisces", start: [2, 19], end: [3, 20] },
    { sign: "Aries", start: [3, 21], end: [4, 19] },
    { sign: "Taurus", start: [4, 20], end: [5, 20] },
    { sign: "Gemini", start: [5, 21], end: [6, 20] },
    { sign: "Cancer", start: [6, 21], end: [7, 22] },
    { sign: "Leo", start: [7, 23], end: [8, 22] },
    { sign: "Virgo", start: [8, 23], end: [9, 22] },
    { sign: "Libra", start: [9, 23], end: [10, 22] },
    { sign: "Scorpio", start: [10, 23], end: [11, 21] },
    { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
  ];

  for (const zodiac of zodiacs) {
    const [startMonth, startDay] = zodiac.start;
    const [endMonth, endDay] = zodiac.end;

    if (startMonth === endMonth) {
      if (month === startMonth && day >= startDay && day <= endDay) {
        return zodiac.sign;
      }
    } else {
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay)
      ) {
        return zodiac.sign;
      }
    }
  }

  return "Unknown";
}

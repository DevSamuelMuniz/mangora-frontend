export const BRAZIL_TIME_ZONE = "America/Sao_Paulo";
export const BRAZIL_UTC_OFFSET = "-03:00";

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BRAZIL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function brazilDateKey(date: Date | string = new Date()) {
  const value = typeof date === "string" ? new Date(date) : date;
  const parts = dateKeyFormatter.formatToParts(value);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function addDaysToBrazilDateKey(days: number, date: Date | string = new Date()) {
  const [year, month, day] = brazilDateKey(date).split("-").map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day + days, 12));
  return calendarDate.toISOString().slice(0, 10);
}

export function brazilDateTimeToIso(date: string, time = "12:00") {
  return new Date(`${date}T${time}:00${BRAZIL_UTC_OFFSET}`).toISOString();
}

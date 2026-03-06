const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function normalizeToUtcStartOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function getDaysSinceStart(
  subscriptionStartAt: string | Date,
  now: Date = new Date()
): number {
  const start = normalizeToUtcStartOfDay(toDate(subscriptionStartAt));
  const current = normalizeToUtcStartOfDay(now);

  const diff = current.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / MS_PER_DAY));
}

export function getMonthIndex(daysSinceStart: number): number {
  return Math.floor(daysSinceStart / 30) + 1;
}

export function getDayInCycle(daysSinceStart: number): number {
  return daysSinceStart % 30;
}

export function getCycleSnapshot(
  subscriptionStartAt: string | Date,
  now: Date = new Date()
) {
  const daysSinceStart = getDaysSinceStart(subscriptionStartAt, now);
  const monthIndex = getMonthIndex(daysSinceStart);
  const dayInCycle = getDayInCycle(daysSinceStart);

  return {
    daysSinceStart,
    monthIndex,
    dayInCycle,
  };
}

export function isSequenceOffset(dayInCycle: number): boolean {
  return [0, 7, 14, 21].includes(dayInCycle);
}
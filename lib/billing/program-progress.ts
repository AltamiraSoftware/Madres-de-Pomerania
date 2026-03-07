const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function normalizeToUtcStartOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function diffWholeDays(from: Date, to: Date): number {
  const start = normalizeToUtcStartOfDay(from);
  const end = normalizeToUtcStartOfDay(to);
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY));
}

export interface ProgramProgressInput {
  programDaysConsumed: number;
  programLastResumedAt: string | Date | null;
  isCurrentlyActive: boolean;
  now?: Date;
}

export interface ProgramProgressSnapshot {
  effectiveProgramDays: number;
  currentSegmentDays: number;
  monthIndex: number;
  dayInCycle: number;
  isRunning: boolean;
}

export function getProgramProgressSnapshot({
  programDaysConsumed,
  programLastResumedAt,
  isCurrentlyActive,
  now = new Date(),
}: ProgramProgressInput): ProgramProgressSnapshot {
  let currentSegmentDays = 0;

  if (isCurrentlyActive && programLastResumedAt) {
    currentSegmentDays = diffWholeDays(toDate(programLastResumedAt), now);
  }

  const effectiveProgramDays = programDaysConsumed + currentSegmentDays;
  const monthIndex = Math.floor(effectiveProgramDays / 30) + 1;
  const dayInCycle = effectiveProgramDays % 30;

  return {
    effectiveProgramDays,
    currentSegmentDays,
    monthIndex,
    dayInCycle,
    isRunning: isCurrentlyActive && !!programLastResumedAt,
  };
}

export function shouldSendSequenceForDay(dayInCycle: number): boolean {
  return [0, 7, 14, 21].includes(dayInCycle);
}

export function consolidateProgramDays(params: {
  programDaysConsumed: number;
  programLastResumedAt: string | Date | null;
  now?: Date;
}): number {
  const { programDaysConsumed, programLastResumedAt, now = new Date() } = params;

  if (!programLastResumedAt) return programDaysConsumed;

  const extraDays = diffWholeDays(toDate(programLastResumedAt), now);
  return programDaysConsumed + extraDays;
}
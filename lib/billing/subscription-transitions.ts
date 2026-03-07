import { consolidateProgramDays } from "./program-progress";

export function buildPauseProgramUpdate(params: {
  programDaysConsumed: number;
  programLastResumedAt: string | null;
  now?: Date;
}) {
  const consolidatedDays = consolidateProgramDays({
    programDaysConsumed: params.programDaysConsumed,
    programLastResumedAt: params.programLastResumedAt,
    now: params.now,
  });

  return {
    program_days_consumed: consolidatedDays,
    program_last_resumed_at: null as null,
  };
}

export function buildResumeProgramUpdate(params: {
  programDaysConsumed: number;
  alreadyRunning: boolean;
  now?: Date;
}) {
  if (params.alreadyRunning) {
    return {
      program_days_consumed: params.programDaysConsumed,
      program_last_resumed_at: undefined,
    };
  }

  return {
    program_days_consumed: params.programDaysConsumed,
    program_last_resumed_at: (params.now ?? new Date()).toISOString(),
  };
}

export function buildInitialProgramStart(now: Date = new Date()) {
  return {
    program_days_consumed: 0,
    program_last_resumed_at: now.toISOString(),
  };
}
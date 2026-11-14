export const PHASES = ['Wdech', 'Zatrzymaj', 'Wydech', 'Zatrzymaj'] as const;
export const PHASE_MS = 4000;
export const SESSION_MS = 120_000;

export type Breath = { phase: number; label: string; fraction: number; secondsLeft: number; cycles: number; done: boolean };

export function breathAt(elapsedMs: number): Breath {
  const t = Math.min(Math.max(elapsedMs, 0), SESSION_MS);
  const step = Math.min(Math.floor(t / PHASE_MS), SESSION_MS / PHASE_MS - 1);
  const inPhase = t - step * PHASE_MS;
  return {
    phase: step % 4,
    label: PHASES[step % 4],
    fraction: inPhase / PHASE_MS,
    secondsLeft: Math.ceil((SESSION_MS - t) / 1000),
    cycles: Math.floor(t / (PHASE_MS * 4)),
    done: elapsedMs >= SESSION_MS,
  };
}

export function dotAt(phase: number, fraction: number, size: number): [number, number] {
  const f = fraction * size;
  return [[0, size - f], [f, 0], [size, f], [size - f, size]][phase] as [number, number];
}

export function scaleAt(phase: number, fraction: number): number {
  return [0.6 + 0.4 * fraction, 1, 1 - 0.4 * fraction, 0.6][phase];
}

export const TRIALS = 3;
export const WINDOW_MS = 30_000;
export const MIN_DELAY_MS = 1500;
export const MAX_DELAY_MS = 4000;

export const randomDelay = (rand: () => number = Math.random) =>
  MIN_DELAY_MS + Math.floor(rand() * (MAX_DELAY_MS - MIN_DELAY_MS));

export const average = (times: number[]) =>
  times.length ? Math.round(times.reduce((sum, t) => sum + t, 0) / times.length) : null;

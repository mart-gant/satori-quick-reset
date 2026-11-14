export const SCHEMA = 'krok.session/v1';
export const SOURCE = 'satori-quick-reset';

export type BreathingResult = { completed: boolean; seconds: number; cycles: number };
export type ReactionResult = { trials: number[]; averageMs: number | null };
export type Session = { date: string; breathing: BreathingResult | null; reaction: ReactionResult | null };

export type KrokSession = Session & { schema: typeof SCHEMA; source: typeof SOURCE };

export const toJson = (s: Session): KrokSession => ({ schema: SCHEMA, source: SOURCE, ...s });

const cycles = (n: number) =>
  `${n} ${n === 1 ? 'cykl' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'cykle' : 'cykli'}`;

export function toMarkdown(s: Session): string {
  const breathing = s.breathing
    ? `${s.breathing.seconds} s, ${cycles(s.breathing.cycles)}, ${s.breathing.completed ? 'ukończone' : 'przerwane'}`
    : 'nie wykonano';
  const reaction = s.reaction?.averageMs != null
    ? `śr. ${s.reaction.averageMs} ms (${s.reaction.trials.join(', ')})`
    : 'nie wykonano';
  return [
    `## Szybki reset · ${s.date.slice(0, 10)}`,
    '',
    '| Ćwiczenie | Wynik |',
    '|---|---|',
    `| Oddech 4-4-4-4 | ${breathing} |`,
    `| Czas reakcji | ${reaction} |`,
    '',
    `<!-- ${SCHEMA} source=${SOURCE} date=${s.date} -->`,
  ].join('\n');
}

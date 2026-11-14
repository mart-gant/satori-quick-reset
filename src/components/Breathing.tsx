import { useEffect, useState } from 'react';
import { breathAt, dotAt, scaleAt, PHASE_MS, SESSION_MS } from '../lib/breath.ts';
import type { BreathingResult } from '../lib/krok.ts';

const SIZE = 160;

type Props = { reducedMotion: boolean; onFinish: (result: BreathingResult) => void };

export function Breathing({ reducedMotion, onFinish }: Props) {
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (start == null) return;
    let id = 0;
    const tick = () => {
      const t = performance.now();
      setNow(t);
      if (t - start < SESSION_MS) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [start]);

  const elapsed = start == null ? 0 : now - start;
  const b = breathAt(elapsed);

  useEffect(() => {
    if (start == null || !b.done) return;
    setStart(null);
    onFinish({ completed: true, seconds: SESSION_MS / 1000, cycles: b.cycles });
  }, [b.done, b.cycles, start, onFinish]);

  const begin = () => {
    const t = performance.now();
    setNow(t);
    setStart(t);
  };
  const stop = () => {
    const spent = start == null ? 0 : performance.now() - start;
    setStart(null);
    onFinish({ completed: false, seconds: Math.floor(spent / 1000), cycles: breathAt(spent).cycles });
  };

  const running = start != null;
  const [x, y] = dotAt(b.phase, b.fraction, SIZE);
  const scale = reducedMotion ? 0.8 : scaleAt(b.phase, b.fraction);
  const inner = SIZE * scale;
  const phaseSeconds = Math.max(1, Math.ceil(((1 - b.fraction) * PHASE_MS) / 1000));
  const mm = Math.floor(b.secondsLeft / 60);
  const ss = String(b.secondsLeft % 60).padStart(2, '0');

  return (
    <section className="sqr-card" aria-labelledby="breathing-title">
      <h2 id="breathing-title">Oddech 4-4-4-4</h2>
      <p className="sqr-lead">Dwie minuty: wdech, zatrzymanie, wydech, zatrzymanie. Każda faza trwa 4 sekundy.</p>

      <div className="sqr-breath">
        <svg viewBox={`-12 -12 ${SIZE + 24} ${SIZE + 24}`} width="200" height="200" aria-hidden="true">
          <rect x="0" y="0" width={SIZE} height={SIZE} rx="6" className="sqr-breath-track" />
          <rect
            x={(SIZE - inner) / 2}
            y={(SIZE - inner) / 2}
            width={inner}
            height={inner}
            rx="10"
            className="sqr-breath-fill"
          />
          {running && !reducedMotion && <circle cx={x} cy={y} r="9" className="sqr-breath-dot" />}
        </svg>
        <div className="sqr-breath-label">
          <span className="sqr-breath-phase">{running ? b.label : 'Gotowe do startu'}</span>
          {running && <span className="sqr-breath-count">{phaseSeconds}</span>}
        </div>
      </div>

      <p className="sqr-sr-only" aria-live="polite">{running ? b.label : ''}</p>
      <p className="sqr-muted">Pozostało {mm}:{ss}</p>

      {running
        ? <button type="button" className="sqr-btn sqr-btn-secondary" onClick={stop}>Zakończ wcześniej</button>
        : <button type="button" className="sqr-btn sqr-btn-primary" onClick={begin}>Zacznij sesję</button>}
    </section>
  );
}

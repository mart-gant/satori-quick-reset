import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { average, randomDelay, TRIALS, WINDOW_MS } from '../lib/reaction.ts';
import type { ReactionResult } from '../lib/krok.ts';

type Stage = 'idle' | 'wait' | 'go' | 'early' | 'done';

const PROMPT: Record<Stage, string> = {
  idle: 'Kliknij, aby zacząć',
  wait: 'Czekaj na sygnał…',
  go: 'Teraz! Kliknij',
  early: 'Za wcześnie. Kliknij, aby powtórzyć próbę',
  done: 'Kliknij, aby zacząć od nowa',
};

export function ReactionTest({ onFinish }: { onFinish: (result: ReactionResult) => void }) {
  const [stage, setStage] = useState<Stage>('idle');
  const [times, setTimes] = useState<number[]>([]);
  const [timedOut, setTimedOut] = useState(false);
  const timesRef = useRef<number[]>([]);
  const goAt = useRef(0);
  const signal = useRef(0);
  const deadline = useRef(0);

  const clear = () => {
    window.clearTimeout(signal.current);
    window.clearTimeout(deadline.current);
  };
  useEffect(() => clear, []);

  const finish = (list: number[], late: boolean) => {
    clear();
    setTimedOut(late);
    setStage('done');
    if (list.length) onFinish({ trials: list, averageMs: average(list) });
  };

  const arm = () => {
    setStage('wait');
    signal.current = window.setTimeout(() => {
      goAt.current = performance.now();
      setStage('go');
    }, randomDelay());
  };

  const hit = () => {
    if (stage === 'idle' || stage === 'done') {
      timesRef.current = [];
      setTimes([]);
      setTimedOut(false);
      deadline.current = window.setTimeout(() => finish(timesRef.current, true), WINDOW_MS);
      return arm();
    }
    if (stage === 'wait') {
      window.clearTimeout(signal.current);
      return setStage('early');
    }
    if (stage === 'early') return arm();
    const list = [...timesRef.current, Math.round(performance.now() - goAt.current)];
    timesRef.current = list;
    setTimes(list);
    if (list.length >= TRIALS) finish(list, false);
    else arm();
  };

  const onKey = (e: KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      hit();
    }
  };

  const avg = average(times);

  return (
    <section className="sqr-card" aria-labelledby="reaction-title">
      <h2 id="reaction-title">Test reakcji</h2>
      <p className="sqr-lead">Trzy próby w 30 sekund. Kliknij albo naciśnij spację, gdy pole zmieni kolor i pojawi się napis „Teraz!”.</p>

      <button
        type="button"
        className={`sqr-reaction sqr-reaction-${stage}`}
        onPointerDown={(e) => { e.preventDefault(); hit(); }}
        onKeyDown={onKey}
      >
        {PROMPT[stage]}
      </button>

      <p className="sqr-muted" aria-live="polite">
        Próby: {times.length}/{TRIALS}
        {times.length > 0 && ` · ${times.join(' ms, ')} ms`}
        {stage === 'done' && avg != null && ` · średnia ${avg} ms`}
        {stage === 'done' && timedOut && ' · minęło 30 sekund'}
      </p>
    </section>
  );
}

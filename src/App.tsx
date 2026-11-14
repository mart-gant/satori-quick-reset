import { useCallback, useEffect, useRef, useState } from 'react';
import { Breathing } from './components/Breathing.tsx';
import { Exporter } from './components/Exporter.tsx';
import { PartnerFooter } from './components/PartnerFooter.tsx';
import { ReactionTest } from './components/ReactionTest.tsx';
import { toJson } from './lib/krok.ts';
import type { BreathingResult, KrokSession, ReactionResult, Session } from './lib/krok.ts';
import { load, save } from './lib/storage.ts';
import './styles.css';

type Prefs = { highContrast: boolean; reducedMotion: boolean };
export type QuickResetProps = { onSession?: (session: KrokSession) => void };

const systemReducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const emptySession = (): Session => ({ date: new Date().toISOString(), breathing: null, reaction: null });

export function App({ onSession }: QuickResetProps = {}) {
  const [prefs, setPrefs] = useState<Prefs>(() => load('prefs', { highContrast: false, reducedMotion: systemReducedMotion() }));
  const [session, setSession] = useState<Session>(() => load('session', emptySession()));
  const notify = useRef(onSession);
  notify.current = onSession;

  useEffect(() => save('prefs', prefs), [prefs]);
  useEffect(() => {
    save('session', session);
    notify.current?.(toJson(session));
  }, [session]);

  const onBreathing = useCallback((breathing: BreathingResult) =>
    setSession((s) => ({ ...s, date: new Date().toISOString(), breathing })), []);
  const onReaction = useCallback((reaction: ReactionResult) =>
    setSession((s) => ({ ...s, date: new Date().toISOString(), reaction })), []);

  const toggle = (key: keyof Prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div
      className="sqr-app"
      data-contrast={prefs.highContrast ? 'high' : undefined}
      data-motion={prefs.reducedMotion ? 'reduced' : undefined}
    >
      <header className="sqr-header">
        <h1>Szybki reset</h1>
        <p className="sqr-lead">Dwie minuty oddechu i krótki test uwagi. Bez konta, bez serwera.</p>
        <div className="sqr-prefs" role="group" aria-label="Ustawienia dostępności">
          <label><input type="checkbox" checked={prefs.highContrast} onChange={() => toggle('highContrast')} /> Wysoki kontrast</label>
          <label><input type="checkbox" checked={prefs.reducedMotion} onChange={() => toggle('reducedMotion')} /> Ogranicz animacje</label>
        </div>
      </header>

      <main className="sqr-grid">
        <Breathing reducedMotion={prefs.reducedMotion} onFinish={onBreathing} />
        <ReactionTest onFinish={onReaction} />
        <Exporter session={session} onReset={() => setSession(emptySession())} />
      </main>

      <PartnerFooter />
    </div>
  );
}

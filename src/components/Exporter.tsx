import { useState } from 'react';
import { toJson, toMarkdown } from '../lib/krok.ts';
import type { Session } from '../lib/krok.ts';

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

type Props = { session: Session; onReset: () => void };

export function Exporter({ session, onReset }: Props) {
  const [status, setStatus] = useState('');
  const empty = !session.breathing && !session.reaction;
  const blocks = [
    { name: 'Markdown', text: toMarkdown(session) },
    { name: 'JSON', text: JSON.stringify(toJson(session), null, 2) },
  ];

  const onCopy = async (name: string, text: string) =>
    setStatus((await copy(text)) ? `Skopiowano ${name}.` : `Nie udało się skopiować ${name}. Zaznacz tekst i skopiuj ręcznie.`);

  return (
    <section className="sqr-card" aria-labelledby="export-title">
      <h2 id="export-title">Eksport do Krok</h2>
      <p className="sqr-lead">
        {empty ? 'Wykonaj ćwiczenie, a podsumowanie pojawi się tutaj.' : 'Podsumowanie tej sesji. Dane zostają w tej przeglądarce.'}
      </p>

      {blocks.map(({ name, text }) => (
        <div key={name} className="sqr-export">
          <div className="sqr-export-head">
            <h3>{name}</h3>
            <button type="button" className="sqr-btn sqr-btn-primary" onClick={() => onCopy(name, text)} disabled={empty}>
              Kopiuj {name}
            </button>
          </div>
          <pre tabIndex={0}><code>{text}</code></pre>
        </div>
      ))}

      <p className="sqr-muted" role="status">{status}</p>
      <button type="button" className="sqr-btn sqr-btn-secondary" onClick={() => { onReset(); setStatus('Sesja wyczyszczona.'); }} disabled={empty}>
        Wyczyść sesję
      </button>
    </section>
  );
}

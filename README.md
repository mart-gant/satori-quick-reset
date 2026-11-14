# satori-quick-reset

**Lekki widżet higieny cyfrowej: dwie minuty oddechu, krótki test reakcji i eksport sesji do Krok.**

Działa w całości w przeglądarce: bez konta, bez serwera i bez śledzenia. To otwarty moduł (Apache-2.0) dla ekosystemu Fundacji Serio i lekka wersja ćwiczeń z komercyjnej aplikacji Satori. Granice opisuje sekcja [Model Open-Core](#model-open-core).

<sub>[Szybki start](#szybki-start) · [Osadzenie w Krok](#osadzenie-w-krok) · [Format wyjściowy](#format-wyjściowy) · [Model Open-Core](#model-open-core) · [Dostępność](#dostępność) · [CONTRIBUTING](CONTRIBUTING.md)</sub>

| Moduł | Robi |
|---|---|
| Oddech 4-4-4-4 | 2 minuty: wdech, zatrzymanie, wydech, zatrzymanie, każda faza po 4 s. Kropka obiega kwadrat, a wypełnienie rośnie przy wdechu |
| Test reakcji | 3 próby w oknie 30 s, losowe opóźnienie 1,5–4 s, średnia z prób; kliknięcie przed sygnałem powtarza próbę |
| Eksport do Krok | Blok Markdown i obiekt JSON z podsumowaniem sesji, każdy z przyciskiem „Kopiuj” |
| Stopka partnerska | Jeden link do pełnej aplikacji Satori |

## Szybki start

Wymagany Node 22.18 lub nowszy.

```bash
npm install && npm run dev
```

Vite wypisze adres, zwykle <http://localhost:5173>.

| Komenda | Robi |
|---|---|
| `npm run dev` | Serwer deweloperski z przeładowaniem na żywo |
| `npm test` | Testy logiki (`node --test`, bez dodatkowych pakietów) |
| `npm run build` | Sprawdzenie typów i statyczna paczka w `dist/` |
| `npm run preview` | Podgląd zbudowanej paczki |

## Osadzenie w Krok

Są dwa sposoby. Wybierz według tego, czy Krok ma dostać dane sesji automatycznie, czy wystarczy kopiowanie.

| | Komponent React | `iframe` |
|---|---|---|
| Wymaga | React 19 i bundler, który kompiluje TypeScript z zależności (Vite od razu; Next.js przez `transpilePackages`) | Dowolny stos, nawet zwykły HTML |
| Dane do Krok | Automatycznie, przez `onSession` | Przyciskiem „Kopiuj” (Markdown albo JSON) |
| Izolacja stylów | Klasy z prefiksem `sqr-`; style elementów hosta (np. `h2 { color }`) mogą przeniknąć | Pełna |
| Aktualizacja | Nowa wersja zależności i build Krok | Podmiana plików na hostingu |

### A. Komponent React

```bash
npm install github:<owner>/satori-quick-reset
```

`<owner>` to konto albo organizacja, pod którą opublikujesz repozytorium.

```tsx
import { QuickReset } from 'satori-quick-reset';
import type { KrokSession } from 'satori-quick-reset';

export function ResetPanel() {
  const save = (session: KrokSession) => {
    // tu Krok zapisuje sesję po swojemu, np. dodaje ją do dziennika
  };
  return <QuickReset onSession={save} />;
}
```

| Prop | Typ | Działanie |
|---|---|---|
| `onSession` | `(session: KrokSession) => void`, opcjonalny | Wywoływany po zamontowaniu i po każdej zmianie wyników, z obiektem w formacie [`krok.session/v1`](#json) |

| Eksport pakietu | Co to jest |
|---|---|
| `QuickReset` | Cały widżet; sam ładuje swoje style |
| `toJson`, `toMarkdown` | Te same funkcje, których używa eksporter; przydają się do własnego widoku sesji w Krok |
| `SCHEMA`, `SOURCE` | Stałe `'krok.session/v1'` i `'satori-quick-reset'` |
| `KrokSession`, `Session`, `BreathingResult`, `ReactionResult` | Typy TypeScript |

| Uwaga | Szczegół |
|---|---|
| Jedna kopia Reacta | `react` i `react-dom` to `peerDependencies`; widżet używa Reacta z Krok. Przy lokalnym `npm link` dodaj w Vite `resolve.dedupe: ['react', 'react-dom']` |
| Next.js | `transpilePackages: ['satori-quick-reset']` w `next.config`; komponent działa tylko po stronie klienta (`'use client'`) |
| Nagłówek | Widżet ma własny `<h1>`. W Krok umieść go w sekcji, w której drugi `h1` nie zaburzy struktury strony |
| Motyw | Kolory to zmienne CSS na `.sqr-app` (`--bg`, `--text`, `--accent` i inne); Krok może je nadpisać |

### B. `iframe`

1. Zbuduj paczkę poleceniem `npm run build`.
2. Wgraj katalog `dist/` na dowolny statyczny hosting. Ścieżki są względne (`base: './'`), więc działa też w podkatalogu.
3. Osadź widżet w Krok:

```html
<iframe
  src="https://example.org/quick-reset/"
  title="Szybki reset: oddech i test reakcji"
  width="100%"
  height="900"
  loading="lazy"
  allow="clipboard-write"
></iframe>
```

| Atrybut | Po co |
|---|---|
| `allow="clipboard-write"` | Przycisk „Kopiuj” używa schowka; bez tego widżet przełącza się na metodę zapasową, którą część przeglądarek blokuje w ramce |
| `title` | Czytnik ekranu ogłasza, co jest w ramce |
| `sandbox` | Jeśli Krok go używa, potrzebne są co najmniej `allow-scripts allow-same-origin`, bo bez tego `localStorage` nie działa |

W `iframe` dane sesji trafiają do Krok przez wklejenie bloku Markdown albo JSON. Ustawienia i wyniki zapisują się w `localStorage` domeny widżetu. Przeglądarki dzielą tę pamięć osobno dla każdej strony nadrzędnej, więc sesja z Krok nie miesza się z sesją otwartą bezpośrednio.

## Format wyjściowy

Format ma nazwę `krok.session/v1`. Generuje go jedno miejsce w kodzie, [`src/lib/krok.ts`](src/lib/krok.ts), a sprawdza [`tests/logic.test.ts`](tests/logic.test.ts).

> Parser `Krok` nie był dostępny przy projektowaniu tego formatu. Format idzie za konwencją repozytoriów `serio-ngo`: tabela Markdown i ukryty, wersjonowany znacznik `<!-- … v1 … -->`. Jeśli parser oczekuje innego kształtu, zmienia się tylko `src/lib/krok.ts`.

### JSON

```json
{
  "schema": "krok.session/v1",
  "source": "satori-quick-reset",
  "date": "2026-11-14T10:00:00.000Z",
  "breathing": { "completed": true, "seconds": 120, "cycles": 7 },
  "reaction": { "trials": [300, 310, 320], "averageMs": 310 }
}
```

| Pole | Typ | Zawsze obecne | Znaczenie |
|---|---|---|---|
| `schema` | `"krok.session/v1"` | tak | Wersja formatu; parser odrzuca nieznaną wartość |
| `source` | `"satori-quick-reset"` | tak | Narzędzie, które wygenerowało sesję |
| `date` | string, ISO 8601, UTC | tak | Czas ostatniego zapisanego wyniku albo wyczyszczenia sesji |
| `breathing` | obiekt albo `null` | tak | `null`: ćwiczenia oddechowego nie wykonano |
| `breathing.completed` | boolean | gdy `breathing` ≠ `null` | `true`: pełne 120 s; `false`: przerwane przyciskiem |
| `breathing.seconds` | liczba całkowita, 0–120 | gdy `breathing` ≠ `null` | Czas ćwiczenia w sekundach |
| `breathing.cycles` | liczba całkowita, 0–7 | gdy `breathing` ≠ `null` | Pełne cykle 16-sekundowe (4 fazy po 4 s) |
| `reaction` | obiekt albo `null` | tak | `null`: testu reakcji nie wykonano |
| `reaction.trials` | lista liczb całkowitych, ms, 1–3 elementy | gdy `reaction` ≠ `null` | Czasy kolejnych prób; mniej niż 3, gdy minęło 30 s |
| `reaction.averageMs` | liczba całkowita, ms | gdy `reaction` ≠ `null` | Zaokrąglona średnia z `trials` |

### Markdown

```markdown
## Szybki reset · 2026-11-14

| Ćwiczenie | Wynik |
|---|---|
| Oddech 4-4-4-4 | 120 s, 7 cykli, ukończone |
| Czas reakcji | śr. 310 ms (300, 310, 320) |

<!-- krok.session/v1 source=satori-quick-reset date=2026-11-14T10:00:00.000Z -->
```

| Element | Reguła |
|---|---|
| Nagłówek | `## Szybki reset · RRRR-MM-DD` (data UTC z pola `date`) |
| Wiersz „Oddech 4-4-4-4” | `<seconds> s, <cycles> cykl\|cykle\|cykli, ukończone\|przerwane` albo `nie wykonano` |
| Wiersz „Czas reakcji” | `śr. <averageMs> ms (<trials, po przecinku>)` albo `nie wykonano` |
| Znacznik | Ostatnia linia: `<!-- krok.session/v1 source=satori-quick-reset date=<ISO> -->`; parser szuka sesji po tym wzorcu, a nie po tekście tabeli |

| Zmiana formatu | Wersja |
|---|---|
| Nowe pole opcjonalne | Bez zmian (`v1`) |
| Zmiana znaczenia, typu albo usunięcie pola | `krok.session/v2`; Krok czyta `v1` i `v2` przynajmniej przez jedno wydanie |

## Model Open-Core

| | `satori-quick-reset` (to repozytorium) | Aplikacja Satori |
|---|---|---|
| Czym jest | Otwarty moduł webowy: oddech, test reakcji, eksport | Natywna aplikacja: analityka, funkcje AI, synchronizacja między urządzeniami |
| Prawa autorskie | Marcin Gantkowski | Marcin Gantkowski |
| Licencja | [Apache-2.0](LICENSE): używaj, zmieniaj i rozpowszechniaj, także komercyjnie | Komercyjna, autorska; ani kod, ani funkcje nie są objęte tą licencją |
| Dane | Tylko w przeglądarce (`localStorage`); żadnych wywołań sieci | Według polityki prywatności Satori |
| Rola | Wkład w ekosystem Fundacji Serio i jej narzędzie Krok | Osobny produkt |

| Zasada | Co oznacza |
|---|---|
| Moduł jest kompletny | Wszystko, co tu jest, działa bez konta i bez Satori. Żadna funkcja nie jest zablokowana ani okrojona, by zachęcić do zakupu |
| Jedno połączenie | Jedynym połączeniem z Satori jest link w stopce. Moduł nie wysyła do Satori danych ani telemetrii |
| Granica funkcji | Funkcje, które wymagają serwera, konta, AI albo synchronizacji, należą do Satori, a nie do tego repozytorium ([CONTRIBUTING](CONTRIBUTING.md#co-pasuje-do-tego-repozytorium)) |
| Nazwa i marka | Licencja Apache-2.0 nie daje prawa do nazwy „Satori” ani jej oznaczeń (sekcja 6 licencji). Fork może istnieć, ale nie może podawać się za oficjalny produkt Satori |
| Wkład | Wkład trafia na tej samej licencji Apache-2.0 (sekcja 5) |

## Dostępność

| Funkcja | Działanie |
|---|---|
| Ogranicz animacje | Domyślnie zgodnie z `prefers-reduced-motion`; wyłącza ruch kropki i pulsowanie, zostają nazwa fazy i odliczanie |
| Wysoki kontrast | Czarne tło, biały tekst, żółte akcenty |
| Ciemny motyw | Zgodnie z `prefers-color-scheme` |
| Klawiatura | Każda akcja ma przycisk; test reakcji przyjmuje spację i Enter |
| Czytnik ekranu | Zmiana fazy oddechu, wyniki prób i status kopiowania trafiają do regionów `aria-live` |
| Sygnał „Teraz!” | Kolor i napis, nigdy sam kolor |

## Dane w przeglądarce

| Klucz `localStorage` | Zawartość | Usuwa |
|---|---|---|
| `satori-quick-reset:v1:prefs` | Wysoki kontrast, ograniczenie animacji | Wyczyszczenie danych witryny |
| `satori-quick-reset:v1:session` | Ostatnie wyniki | Przycisk „Wyczyść sesję” |

Gdy `localStorage` jest niedostępny (tryb prywatny, zablokowane dane witryny), widżet działa normalnie, ale niczego nie pamięta po zamknięciu karty.

## Struktura

| Ścieżka | Zawartość |
|---|---|
| `src/index.ts` | Wejście pakietu: `QuickReset`, funkcje eksportu, typy |
| `src/App.tsx` | Układ widżetu, ustawienia, stan sesji, `onSession` |
| `src/components/` | `Breathing`, `ReactionTest`, `Exporter`, `PartnerFooter` |
| `src/lib/` | Czysta logika: `breath.ts`, `reaction.ts`, `krok.ts`, `storage.ts` |
| `src/styles.css` | Style widżetu, wyłącznie klasy `sqr-*` |
| `src/main.tsx`, `src/standalone.css` | Wersja samodzielna (strona i `iframe`) |
| `tests/logic.test.ts` | Testy logiki |

Wynik testu reakcji to ćwiczenie, a nie pomiar diagnostyczny.

# AGENTS.md

| Zakres | Reguła |
|---|---|
| Dane | Tylko `localStorage` w przeglądarce; żadnego serwera, analityki ani wywołań sieci |
| Logika | Czyste funkcje w `src/lib/`; komponenty tylko renderują i trzymają stan |
| Testy | `tests/logic.test.ts`, `node --test`; nowa reguła logiki dodaje jeden przypadek |
| Format eksportu | Jedno miejsce: `src/lib/krok.ts`; zmiana znaczenia pola podbija `v1` → `v2` |
| Style | Tylko klasy `sqr-*` i selektory w `.sqr-app`; nic globalnego, bo widżet osadza się w cudzej stronie |
| Dostępność | Każda animacja ma wariant bez ruchu; każdy sygnał ma tekst, nie tylko kolor |
| Zależności | Runtime: tylko `react` i `react-dom` jako `peerDependencies` |
| Granica Open-Core | Funkcje z serwerem, kontem, AI lub synchronizacją należą do Satori, nie tutaj |

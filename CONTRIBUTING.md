# Jak współtworzyć `satori-quick-reset`

Dziękujemy za pomoc. Ten plik mówi, co pasuje do repozytorium, jak przygotować zmianę i na jakiej licencji ją przyjmujemy.

## Co pasuje do tego repozytorium

To otwarta część modelu Open-Core (zob. [README](README.md#model-open-core)). Zanim zaczniesz większą zmianę, sprawdź, po której stronie granicy leży.

| Pasuje tutaj | Należy do aplikacji Satori, nie tutaj |
|---|---|
| Poprawki ćwiczenia oddechowego i testu reakcji | Analityka, historia i wykresy postępów |
| Dostępność, tłumaczenia, czytelność | Funkcje AI i rekomendacje |
| Format eksportu `krok.session` i integracja z Krok | Konta, logowanie, synchronizacja między urządzeniami |
| Nowe krótkie ćwiczenie, które działa offline w przeglądarce | Wszystko, co wysyła dane na serwer |
| Testy, dokumentacja, porządki w kodzie | Blokowanie funkcji lub komunikaty zachęcające do zakupu |

Nie wiesz, gdzie leży granica? Najpierw otwórz issue z jednym zdaniem: kto i co zyskuje.

## Uruchomienie

| Krok | Komenda | Powinno wyjść |
|---|---|---|
| 1. Zależności | `npm install` | `found 0 vulnerabilities` |
| 2. Podgląd | `npm run dev` | adres `http://localhost:5173` |
| 3. Testy | `npm test` | `fail 0` |
| 4. Build | `npm run build` | `✓ built` |

Node 22.18 lub nowszy: testy uruchamiają TypeScript bezpośrednio przez `node --test`.

## Zasady kodu

| Obszar | Zasada |
|---|---|
| Sieć | Żadnych wywołań sieci, analityki ani zewnętrznych czcionek; tylko `localStorage` |
| Logika | Czyste funkcje w `src/lib/`; komponenty tylko renderują i trzymają stan |
| Testy | Nowa reguła w `src/lib/` dodaje przypadek do `tests/logic.test.ts` |
| Style | Tylko klasy z prefiksem `sqr-` i selektory zagnieżdżone w `.sqr-app`; nic na `:root`, `body` ani gołych elementach, bo widżet żyje w cudzej stronie |
| Kolory | Wyłącznie zmienne CSS z `src/styles.css`; każdy nowy kolor ma wariant ciemny i wysokokontrastowy |
| Dostępność | Każda animacja ma wariant bez ruchu; każdy sygnał ma tekst, nie tylko kolor; każda akcja działa z klawiatury |
| Zależności | Runtime: tylko `react` i `react-dom` jako `peerDependencies`; nowa zależność wymaga uzasadnienia w PR |
| Teksty | Po polsku, krótkie zdania w trybie oznajmującym |

## Zmiana formatu eksportu

Krok i inne narzędzia czytają `krok.session/v1`, więc zmiana formatu wymaga ostrożności.

| Zmiana | Co zrobić |
|---|---|
| Nowe pole opcjonalne | Dodaj je w `src/lib/krok.ts`, w teście i w tabeli w README; wersja zostaje `v1` |
| Zmiana znaczenia, typu albo usunięcie pola | Nowa wersja `krok.session/v2`; opisz w PR, jak Krok ma czytać obie wersje |
| Zmiana tekstu w tabeli Markdown | Dozwolona; parser opiera się na znaczniku `<!-- krok.session/… -->`, nie na treści tabeli |

## Pull request

| Krok | Szczegół |
|---|---|
| 1. Gałąź | Jedna zmiana na gałąź, np. `fix/reaction-early-click` |
| 2. Commity | Krótki opis w trybie rozkazującym, np. `Show a retry hint after an early click` |
| 3. Sprawdzenie | `npm test` i `npm run build` przechodzą lokalnie; CI (`.github/workflows/verify.yml`) robi to samo |
| 4. Opis PR | Co się zmienia dla osoby korzystającej z widżetu, jak to sprawdzić, zrzut ekranu przy zmianie wyglądu |
| 5. Dostępność | Przy zmianie wyglądu sprawdź wysoki kontrast, ograniczenie animacji i obsługę klawiaturą |

## Licencja wkładu

| Zasada | Szczegół |
|---|---|
| Licencja | Wysyłając wkład, udostępniasz go na licencji Apache-2.0 tego repozytorium (sekcja 5 licencji); osobna umowa (CLA) nie jest potrzebna |
| Prawo do kodu | Wysyłaj tylko kod, do którego masz prawa. Nie kopiuj kodu z aplikacji Satori ani z projektów o niezgodnej licencji |
| Marka | Wkład nie zmienia zasad dotyczących nazwy „Satori”; zob. README |

## Zgłaszanie problemów

| Sytuacja | Gdzie |
|---|---|
| Błąd lub pomysł | Issue z krokami do odtworzenia albo z opisem, kto i co zyskuje |
| Problem z prywatnością lub bezpieczeństwem | Nie publikuj szczegółów w issue; napisz do opiekunów repozytorium prywatnie (GitHub Security Advisories) |
| Pytanie o aplikację Satori | Kanały Satori, nie to repozytorium |

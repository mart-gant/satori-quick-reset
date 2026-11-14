export const SATORI_URL = 'https://satori-two.vercel.app';

export function PartnerFooter() {
  return (
    <footer className="sqr-footer">
      <span>Szybki reset to lekka wersja ćwiczeń z Satori. </span>
      <a href={SATORI_URL} target="_blank" rel="noopener noreferrer">
        Pełna aplikacja Satori<span className="sqr-sr-only"> (otwiera się w nowej karcie)</span> →
      </a>
    </footer>
  );
}

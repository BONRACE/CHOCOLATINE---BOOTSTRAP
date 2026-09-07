import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-forest-dark/40 bg-forest/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 8.5C3 6.567 4.567 5 6.5 5h11A2.5 2.5 0 0 1 20 7.5v1a1.75 1.75 0 0 0 0 3.5v1A2.5 2.5 0 0 1 17.5 15h-11A2.5 2.5 0 0 1 4 12.5v-1a1.75 1.75 0 0 0 0-3.5v-1Z"
              stroke="#D4A62F"
              strokeWidth="1.4"
            />
            <path d="M9 5v10" stroke="#D4A62F" strokeWidth="1.4" strokeDasharray="2 2" />
          </svg>
          <span className="font-display text-lg italic text-ivory">EventFlow</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ivory/80 md:flex">
          <Link href="/" className="hover:text-gold">
            Découvrir
          </Link>
          <Link href="/admin/dashboard" className="hover:text-gold">
            Espace organisateur
          </Link>
          <Link href="/connexion" className="hover:text-gold">
            Scanner d'accès
          </Link>
        </nav>
        <Link
          href="/admin/evenements/nouveau"
          className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-forest-dark transition-colors hover:bg-gold-pale"
        >
          Créer un événement
        </Link>
      </div>
    </header>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ivory">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-ink/60 md:flex-row md:items-center md:justify-between">
        <p className="font-display italic text-ink/80">EventFlow</p>
        <p>Billetterie & contrôle d'accès pour les événements du Bénin.</p>
        <p>© {new Date().getFullYear()} EventFlow</p>
      </div>
    </footer>
  );
}

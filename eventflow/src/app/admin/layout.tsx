import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-primary-dark p-5 text-white">
        <p className="mb-8 text-lg font-bold">EventFlow <span className="text-gold">Admin</span></p>
        <nav className="space-y-2 text-sm">
          <Link href="/admin" className="block rounded-lg px-3 py-2 hover:bg-white/10">
            Dashboard
          </Link>
          <Link href="/admin/evenements/nouveau" className="block rounded-lg px-3 py-2 hover:bg-white/10">
            Créer un événement
          </Link>
        </nav>
      </aside>
      <div className="flex-1 bg-gray-50 p-6">{children}</div>
    </div>
  );
}

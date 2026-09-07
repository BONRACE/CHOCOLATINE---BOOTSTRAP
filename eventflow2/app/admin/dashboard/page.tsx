import Link from "next/link";
import { TrendingUp, Ticket, Percent, Plus } from "lucide-react";
import { events, fillRate, formatFCFA } from "@/lib/mock-data";

function totalRevenue() {
  return events.reduce(
    (sum, e) =>
      sum +
      e.ticketCategories.reduce(
        (s, tc) => s + tc.quantitySold * tc.unitPrice,
        0
      ),
    0
  );
}

function totalSold() {
  return events.reduce(
    (sum, e) =>
      sum + e.ticketCategories.reduce((s, tc) => s + tc.quantitySold, 0),
    0
  );
}

function avgFillRate() {
  const rates = events.map(fillRate);
  return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
}

const kpis = [
  { label: "Billets vendus", value: totalSold().toLocaleString("fr-FR"), icon: Ticket },
  { label: "Chiffre d'affaires", value: formatFCFA(totalRevenue()), icon: TrendingUp },
  { label: "Taux de remplissage moyen", value: `${avgFillRate()}%`, icon: Percent },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-ivory">
      {/* Barre admin, distincte du header public */}
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wide text-ink/40">
              Espace organisateur
            </p>
            <h1 className="font-display text-xl text-ink">Tableau de bord</h1>
          </div>
          <Link
            href="/admin/evenements/nouveau"
            className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-medium text-ivory hover:bg-forest-light"
          >
            <Plus size={15} />
            Nouvel événement
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {kpis.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-stub border border-line bg-white p-5">
              <Icon size={18} className="text-forest" />
              <p className="mt-3 font-display text-2xl text-ink">{value}</p>
              <p className="mt-1 text-sm text-ink/50">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-stub border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-lg text-ink">
              Événements récents et à venir
            </h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-forest/5 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-5 py-3 font-medium">Événement</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Ville</th>
                <th className="px-5 py-3 font-medium">Remplissage</th>
                <th className="px-5 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-forest/5">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/evenements/${e.id}`}
                      className="font-medium text-ink hover:text-forest"
                    >
                      {e.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink/60">
                    {new Date(e.startsAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-3 text-ink/60">{e.city}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full bg-gold"
                          style={{ width: `${fillRate(e)}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink/50">{fillRate(e)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-forest/10 px-2.5 py-1 text-xs font-medium text-forest">
                      Publié
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

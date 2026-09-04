import { prisma } from "@/lib/prisma";
import KPICard from "@/components/KPICard";
import { formatEventDate, formatXof } from "@/lib/utils";
import Link from "next/link";

// Page 2.1 — Dashboard Analytique Général
export default async function AdminDashboard() {
  const [events, ordersAgg, tickets] = await Promise.all([
    prisma.event.findMany({
      include: { ticketTypes: true },
      orderBy: { startsAt: "asc" }
    }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { totalXof: true }, _count: true }),
    prisma.ticket.count()
  ]);

  const totalQuota = events.reduce(
    (sum, e) => sum + e.ticketTypes.reduce((s, t) => s + t.quota, 0),
    0
  );
  const fillRate = totalQuota > 0 ? Math.round((tickets / totalQuota) * 100) : 0;

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Tableau de bord</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard label="Total ventes" value={String(ordersAgg._count)} />
        <KPICard label="Chiffre d'affaires global" value={formatXof(ordersAgg._sum.totalXof ?? 0)} accent />
        <KPICard label="Taux de remplissage moyen" value={`${fillRate}%`} />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-50 p-4 font-semibold">Événements récents & à venir</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Billets vendus</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => {
              const sold = e.ticketTypes.reduce((s, t) => s + t.quantitySold, 0);
              const quota = e.ticketTypes.reduce((s, t) => s + t.quota, 0);
              return (
                <tr key={e.id} className="border-t border-gray-50">
                  <td className="px-4 py-3 font-medium">{e.title}</td>
                  <td className="px-4 py-3 text-gray-600">{formatEventDate(e.startsAt)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">{e.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sold} / {quota}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/evenements/${e.id}`} className="text-primary underline">
                      Gérer
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

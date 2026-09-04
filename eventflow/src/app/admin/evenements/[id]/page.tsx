import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ParticipantsTable from "@/components/ParticipantsTable";
import AttendanceChart from "@/components/AttendanceChart";

// Page 2.3 — Gestion d'un Événement (Participants / Stats live / Export)
export default async function ManageEventPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      tickets: { include: { ticketType: true, order: true } }
    }
  });

  if (!event) notFound();

  const participants = event.tickets.map((t) => ({
    id: t.id,
    holderName: t.holderName,
    ticketTypeName: t.ticketType.name,
    status: t.status,
    buyerEmail: t.order.buyerEmail
  }));

  // Affluence heure par heure (jour J) à partir des scans horodatés
  const hourlyBuckets: Record<string, number> = {};
  for (const t of event.tickets) {
    if (t.status === "SCANNED" && t.scannedAt) {
      const hour = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit" }).format(t.scannedAt);
      hourlyBuckets[hour] = (hourlyBuckets[hour] ?? 0) + 1;
    }
  }
  const chartData = Object.entries(hourlyBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, count]) => ({ hour, count }));

  const scannedCount = event.tickets.filter((t) => t.status === "SCANNED").length;

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">{event.title}</h1>
        <p className="text-sm text-gray-500">
          {scannedCount} / {event.tickets.length} participants scannés
        </p>
      </div>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold">Statistiques en direct — affluence par heure</h2>
        <AttendanceChart data={chartData} />
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Participants</h2>
          <a
            href={`/api/export/${event.id}`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light"
          >
            Exporter en CSV
          </a>
        </div>
        <ParticipantsTable participants={participants} />
      </section>
    </main>
  );
}

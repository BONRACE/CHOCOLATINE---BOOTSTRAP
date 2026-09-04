import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatEventDate } from "@/lib/utils";
import TicketSelector from "@/components/TicketSelector";

// Page 1.2 — Détail Événement
export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await prisma.event.findFirst({
    where: { OR: [{ slug: params.slug }, { id: params.slug }], status: "PUBLISHED" },
    include: { ticketTypes: true }
  });

  if (!event) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Banner héro */}
      <div className="relative mb-6 h-72 overflow-hidden rounded-2xl bg-primary">
        {event.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.coverImageUrl} alt={event.title} className="h-full w-full object-cover opacity-90" />
        )}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
          <span className="mb-2 w-fit rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary-dark">
            {event.category}
          </span>
          <h1 className="text-3xl font-bold">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Infos clés */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Date & heure</p>
              <p className="font-medium">{formatEventDate(event.startsAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lieu</p>
              <p className="font-medium">{event.venue}</p>
              <p className="text-sm text-gray-500">{event.address}, {event.city}</p>
            </div>
          </div>

          {/* Carte interactive (placeholder) */}
          {event.latitude && event.longitude ? (
            <div className="h-56 rounded-xl border border-gray-100 bg-gray-100">
              {/* Intégration carte (Leaflet/Google Maps) à brancher ici avec
                  event.latitude / event.longitude */}
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Carte : {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
              </div>
            </div>
          ) : null}

          {/* Description riche */}
          <div className="prose max-w-none rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold">À propos de l&apos;événement</h2>
            <p className="whitespace-pre-line text-gray-700">{event.description}</p>
          </div>
        </div>

        {/* Widget d'achat */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <TicketSelector eventId={event.id} ticketTypes={event.ticketTypes} />
        </div>
      </div>
    </main>
  );
}

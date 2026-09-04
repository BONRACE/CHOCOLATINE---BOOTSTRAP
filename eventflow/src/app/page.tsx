import { prisma } from "@/lib/prisma";
import EventCard from "@/components/EventCard";
import SearchFilters from "@/components/SearchFilters";

// Page 1.1 — Accueil / Catalogue
export default async function HomePage({
  searchParams
}: {
  searchParams: { q?: string; category?: string; city?: string };
}) {
  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      ...(searchParams.q && { title: { contains: searchParams.q, mode: "insensitive" } }),
      ...(searchParams.category && { category: searchParams.category }),
      ...(searchParams.city && { city: searchParams.city })
    },
    include: { ticketTypes: { select: { priceXof: true } } },
    orderBy: { startsAt: "asc" }
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold text-primary">EventFlow</h1>
        <SearchFilters />
      </header>

      {events.length === 0 ? (
        <p className="py-16 text-center text-gray-500">Aucun événement ne correspond à votre recherche.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={{
                id: e.id,
                slug: e.slug,
                title: e.title,
                city: e.city,
                venue: e.venue,
                startsAt: e.startsAt.toISOString(),
                coverImageUrl: e.coverImageUrl,
                category: e.category,
                fromPriceXof: e.ticketTypes.length ? Math.min(...e.ticketTypes.map((t) => t.priceXof)) : 0
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

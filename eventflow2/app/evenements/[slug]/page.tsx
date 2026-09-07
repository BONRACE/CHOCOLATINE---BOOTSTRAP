import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Clock } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TicketSelector from "@/components/TicketSelector";
import { events, getEventBySlug } from "@/lib/mock-data";

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export default function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = getEventBySlug(params.slug);
  if (!event) notFound();

  const start = new Date(event.startsAt);

  return (
    <main className="min-h-screen bg-ivory">
      <SiteHeader />

      {/* Bannière héro */}
      <section className="relative h-[42vh] min-h-[320px] w-full">
        <Image
          src={event.coverImage}
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest-dark/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-8">
          <span className="rounded-full bg-gold px-3 py-1 text-xs font-medium text-forest-dark">
            {event.category}
          </span>
          <h1 className="mt-3 max-w-2xl font-display text-3xl italic text-ivory md:text-4xl">
            {event.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          {/* Infos clés */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-line pb-6 text-sm text-ink/70">
            <span className="flex items-center gap-2">
              <Calendar size={16} className="text-forest" />
              {start.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-forest" />
              {start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-forest" />
              {event.venueName}, {event.city}
            </span>
          </div>

          <div className="prose prose-sm mt-6 max-w-none text-ink/80">
            <h2 className="font-display text-xl text-ink">À propos</h2>
            <p className="mt-2 leading-relaxed">{event.description}</p>
          </div>

          {/* Carte / localisation — placeholder d'intégration */}
          <div className="mt-8">
            <h2 className="font-display text-xl text-ink">Lieu</h2>
            <p className="mt-1 text-sm text-ink/60">{event.address}</p>
            <div className="mt-3 flex h-48 items-center justify-center rounded-stub border border-dashed border-line bg-white text-sm text-ink/40">
              Carte interactive (Mapbox / Google Maps) — à intégrer
            </div>
          </div>

          <p className="mt-8 text-xs text-ink/40">
            Organisé par {event.organizerName}
          </p>
        </div>

        {/* Widget d'achat */}
        <div className="md:sticky md:top-24 md:self-start">
          <TicketSelector
            eventId={event.id}
            eventSlug={event.slug}
            ticketCategories={event.ticketCategories}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { EventMock, formatFCFA, minPrice } from "@/lib/mock-data";

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("fr-FR", { day: "2-digit" }),
    month: d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
    time: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function EventCard({ event }: { event: EventMock }) {
  const { day, month, time } = formatDate(event.startsAt);

  return (
    <Link
      href={`/evenements/${event.slug}`}
      className="group block focus-visible:outline-none"
    >
      <article className="relative overflow-hidden rounded-stub bg-white shadow-[0_1px_0_#DCD3BE] transition-shadow group-hover:shadow-[0_10px_30px_-12px_rgba(11,74,50,0.35)]">
        {/* Image portion */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={event.coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute left-3 top-3 rounded-full bg-forest/90 px-3 py-1 text-xs font-medium text-ivory backdrop-blur-sm">
            {event.category}
          </div>
          {/* date stub, boarding-pass style */}
          <div className="absolute right-3 top-3 flex flex-col items-center rounded-md bg-ivory px-2.5 py-1.5 text-forest shadow-sm">
            <span className="font-mono text-[10px] uppercase leading-none tracking-wide text-forest/60">
              {month}
            </span>
            <span className="font-display text-lg leading-none">{day}</span>
          </div>
        </div>

        {/* Perforated tear line with notches */}
        <div className="relative">
          <div className="ticket-notch perforation" />
        </div>

        {/* Info stub */}
        <div className="px-5 py-4">
          <h3 className="font-display text-xl leading-snug text-ink">
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-ink/60">
            {event.venueName} · {event.city} · {time}
          </p>
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
            <span className="text-xs text-ink/50">à partir de</span>
            <span className="font-mono text-sm font-medium text-forest">
              {formatFCFA(minPrice(event))}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

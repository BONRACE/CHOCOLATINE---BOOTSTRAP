import Link from "next/link";
import { formatEventDate, formatXof } from "@/lib/utils";
import type { EventCardData } from "@/types";

export default function EventCard({ event }: { event: EventCardData }) {
  return (
    <Link
      href={`/evenements/${event.slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden bg-primary/10">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary/40">
            EventFlow
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
          {event.category}
        </span>
      </div>
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-1 font-semibold text-gray-900">{event.title}</h3>
        <p className="text-sm text-gray-500">{formatEventDate(new Date(event.startsAt))}</p>
        <p className="text-sm text-gray-500">
          {event.venue}, {event.city}
        </p>
        <p className="pt-1 text-sm font-medium text-gold-dark">
          À partir de {formatXof(event.fromPriceXof)}
        </p>
      </div>
    </Link>
  );
}

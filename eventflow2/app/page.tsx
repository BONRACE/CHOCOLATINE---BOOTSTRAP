import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CatalogClient from "@/components/CatalogClient";
import { events } from "@/lib/mock-data";

// En production, remplacer `events` par une requête Prisma côté serveur :
// const events = await prisma.event.findMany({ where: { status: "PUBLISHED" }, include: { ticketCategories: true } });

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ivory">
      <SiteHeader />
      <CatalogClient events={events} />
      <SiteFooter />
    </main>
  );
}

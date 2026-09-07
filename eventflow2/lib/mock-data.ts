// Données de démonstration — à remplacer par des requêtes Prisma
// (voir lib/db.ts) une fois la base connectée. La forme des objets
// correspond exactement au schéma défini dans prisma/schema.prisma.

export type TicketCategoryMock = {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  quantitySold: number;
};

export type EventMock = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  city: string;
  venueName: string;
  address: string;
  coverImage: string;
  startsAt: string;
  endsAt: string;
  organizerName: string;
  ticketCategories: TicketCategoryMock[];
};

export const categories = [
  "Concert",
  "Festival",
  "Conférence",
  "Sport",
  "Théâtre",
  "Nightlife",
];

export const cities = ["Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi"];

export const events: EventMock[] = [
  {
    id: "evt_1",
    slug: "afro-nation-cotonou",
    title: "Afro Nation Cotonou",
    description:
      "Trois scènes, une nuit. Afro Nation pose ses valises à Cotonou pour une édition spéciale avec les plus grands noms de l'afrobeats et de l'amapiano, entre la plage et la ville.",
    category: "Festival",
    city: "Cotonou",
    venueName: "Plage de Fidjrossè",
    address: "Route des Pêches, Fidjrossè, Cotonou",
    coverImage:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1600&auto=format&fit=crop",
    startsAt: "2026-12-19T18:00:00+01:00",
    endsAt: "2026-12-20T02:00:00+01:00",
    organizerName: "Vibra Events",
    ticketCategories: [
      { id: "tc_1a", name: "Early Bird", unitPrice: 15000, quantity: 300, quantitySold: 287 },
      { id: "tc_1b", name: "Standard", unitPrice: 25000, quantity: 1200, quantitySold: 640 },
      { id: "tc_1c", name: "VIP", description: "Accès lounge + boissons incluses", unitPrice: 60000, quantity: 150, quantitySold: 52 },
    ],
  },
  {
    id: "evt_2",
    slug: "benin-tech-summit-2026",
    title: "Bénin Tech Summit",
    description:
      "Le rendez-vous annuel de l'écosystème tech béninois : startups, investisseurs, développeurs et institutions se retrouvent pour deux jours de conférences, d'ateliers et de networking.",
    category: "Conférence",
    city: "Cotonou",
    venueName: "Palais des Congrès",
    address: "Boulevard de la Marina, Cotonou",
    coverImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop",
    startsAt: "2026-11-05T09:00:00+01:00",
    endsAt: "2026-11-06T18:00:00+01:00",
    organizerName: "Epitech Bénin Alumni",
    ticketCategories: [
      { id: "tc_2a", name: "Étudiant", unitPrice: 3000, quantity: 400, quantitySold: 180 },
      { id: "tc_2b", name: "Standard", unitPrice: 10000, quantity: 500, quantitySold: 210 },
      { id: "tc_2c", name: "Pass Entreprise", description: "Accès salon exposants", unitPrice: 35000, quantity: 80, quantitySold: 19 },
    ],
  },
  {
    id: "evt_3",
    slug: "nuit-des-tables-rondes",
    title: "La Nuit des Tables Rondes",
    description:
      "Stand-up, poésie urbaine et musique live dans une ambiance intimiste. Une soirée éclectique portée par une nouvelle génération d'artistes béninois.",
    category: "Nightlife",
    city: "Cotonou",
    venueName: "Le Podium",
    address: "Quartier Haie Vive, Cotonou",
    coverImage:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1600&auto=format&fit=crop",
    startsAt: "2026-09-27T20:00:00+01:00",
    endsAt: "2026-09-28T00:00:00+01:00",
    organizerName: "Collectif Ana",
    ticketCategories: [
      { id: "tc_3a", name: "Standard", unitPrice: 5000, quantity: 200, quantitySold: 145 },
      { id: "tc_3b", name: "VIP", description: "Table réservée, 1er rang", unitPrice: 20000, quantity: 30, quantitySold: 24 },
    ],
  },
  {
    id: "evt_4",
    slug: "finale-coupe-benin-porto-novo",
    title: "Finale Coupe du Bénin",
    description:
      "La grande finale de la Coupe du Bénin. Ambiance garantie dans un stade en fusion pour couronner le champion de la saison.",
    category: "Sport",
    city: "Porto-Novo",
    venueName: "Stade Charles de Gaulle",
    address: "Porto-Novo",
    coverImage:
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
    startsAt: "2026-10-18T16:00:00+01:00",
    endsAt: "2026-10-18T19:00:00+01:00",
    organizerName: "Fédération Béninoise de Football",
    ticketCategories: [
      { id: "tc_4a", name: "Populaire", unitPrice: 2000, quantity: 5000, quantitySold: 3120 },
      { id: "tc_4b", name: "Tribune", unitPrice: 8000, quantity: 1200, quantitySold: 640 },
      { id: "tc_4c", name: "Loge VIP", unitPrice: 30000, quantity: 60, quantitySold: 41 },
    ],
  },
  {
    id: "evt_5",
    slug: "marche-des-createurs-parakou",
    title: "Marché des Créateurs",
    description:
      "Mode, artisanat et gastronomie locale rassemblés le temps d'un week-end. Plus de 60 exposants venus de tout le pays.",
    category: "Festival",
    city: "Parakou",
    venueName: "Place de l'Étoile Rouge",
    address: "Parakou",
    coverImage:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600&auto=format&fit=crop",
    startsAt: "2026-10-03T10:00:00+01:00",
    endsAt: "2026-10-04T19:00:00+01:00",
    organizerName: "Ville de Parakou",
    ticketCategories: [
      { id: "tc_5a", name: "Entrée journée", unitPrice: 1000, quantity: 2000, quantitySold: 430 },
    ],
  },
  {
    id: "evt_6",
    slug: "romeo-juliette-plein-air",
    title: "Roméo & Juliette, en plein air",
    description:
      "Une adaptation contemporaine du classique de Shakespeare, jouée en français et en fon, sous les étoiles.",
    category: "Théâtre",
    city: "Abomey-Calavi",
    venueName: "Campus UAC — Amphithéâtre extérieur",
    address: "Abomey-Calavi",
    coverImage:
      "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1600&auto=format&fit=crop",
    startsAt: "2026-09-25T19:30:00+01:00",
    endsAt: "2026-09-25T21:30:00+01:00",
    organizerName: "Troupe Kpogozoun",
    ticketCategories: [
      { id: "tc_6a", name: "Standard", unitPrice: 3500, quantity: 250, quantitySold: 98 },
    ],
  },
];

export function getEventBySlug(slug: string) {
  return events.find((e) => e.slug === slug);
}

export function minPrice(event: EventMock) {
  return Math.min(...event.ticketCategories.map((t) => t.unitPrice));
}

export function fillRate(event: EventMock) {
  const total = event.ticketCategories.reduce((s, t) => s + t.quantity, 0);
  const sold = event.ticketCategories.reduce((s, t) => s + t.quantitySold, 0);
  return Math.round((sold / total) * 100);
}

export function formatFCFA(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
}

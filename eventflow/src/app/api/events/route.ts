import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// GET /api/events — Catalogue public avec recherche + filtres
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const city = searchParams.get("city") ?? undefined;

  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      ...(q && { title: { contains: q, mode: "insensitive" } }),
      ...(category && { category }),
      ...(city && { city })
    },
    include: { ticketTypes: { select: { priceXof: true } } },
    orderBy: { startsAt: "asc" }
  });

  const payload = events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    city: e.city,
    venue: e.venue,
    startsAt: e.startsAt,
    coverImageUrl: e.coverImageUrl,
    category: e.category,
    fromPriceXof: e.ticketTypes.length ? Math.min(...e.ticketTypes.map((t) => t.priceXof)) : 0
  }));

  return NextResponse.json(payload);
}

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string(),
  city: z.string(),
  venue: z.string(),
  address: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  coverImageUrl: z.string().url().optional(),
  ticketTypes: z
    .array(
      z.object({
        name: z.string(),
        priceXof: z.number().int().nonnegative(),
        quota: z.number().int().positive()
      })
    )
    .min(1)
});

// POST /api/events — Création d'un événement (organisateur authentifié)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // @ts-expect-error - role custom ajouté à la session
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const event = await prisma.event.create({
    data: {
      title: data.title,
      slug: `${slugify(data.title)}-${Date.now().toString(36)}`,
      description: data.description,
      category: data.category,
      city: data.city,
      venue: data.venue,
      address: data.address,
      coverImageUrl: data.coverImageUrl,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      status: "DRAFT",
      // @ts-expect-error - id présent sur la session custom
      organizerId: session.user.id,
      ticketTypes: { create: data.ticketTypes }
    },
    include: { ticketTypes: true }
  });

  return NextResponse.json(event, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events/:id — Détail complet (public, via slug ou id)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const event = await prisma.event.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: { ticketTypes: true }
  });

  if (!event) return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });

  return NextResponse.json(event);
}

// PATCH /api/events/:id — Mise à jour (organisateur)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const event = await prisma.event.update({ where: { id: params.id }, data: body });
  return NextResponse.json(event);
}

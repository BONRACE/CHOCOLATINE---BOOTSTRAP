import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/:id — Récapitulatif de commande + billets (page confirmation)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      event: true,
      items: { include: { ticketType: true } },
      tickets: { include: { ticketType: true } }
    }
  });

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  return NextResponse.json(order);
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";

// GET /api/export/:eventId — Export CSV des participants (bouton "Export" admin)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const tickets = await prisma.ticket.findMany({
    where: { eventId: params.id },
    include: { ticketType: true, order: true }
  });

  const rows = tickets.map((t) => ({
    "Nom du participant": t.holderName,
    "Catégorie": t.ticketType.name,
    "Statut": t.status === "SCANNED" ? "Scanné" : t.status === "CANCELLED" ? "Annulé" : "Payé",
    "Email acheteur": t.order.buyerEmail,
    "Téléphone acheteur": t.order.buyerPhone,
    "Scanné le": t.scannedAt ? t.scannedAt.toISOString() : ""
  }));

  const csv = Papa.unparse(rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="participants-${params.id}.csv"`
    }
  });
}

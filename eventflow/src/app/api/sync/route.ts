import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/sync?eventId=xxx
 * Télécharge l'état complet des billets d'un événement pour amorcer le
 * cache local (IndexedDB) du scanner avant un passage en mode hors-ligne.
 *
 * POST /api/sync
 * Reçoit la file d'attente des scans effectués hors-ligne et les rejoue
 * côté serveur, dans l'ordre chronologique, avec la même logique
 * d'exclusion mutuelle que /api/tickets/verify (le premier scan valide
 * gagne, les suivants deviennent ALREADY_SCANNED).
 */

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId requis" }, { status: 400 });

  const tickets = await prisma.ticket.findMany({
    where: { eventId },
    include: { ticketType: true }
  });

  return NextResponse.json(
    tickets.map((t) => ({
      code: t.code,
      eventId: t.eventId,
      holderName: t.holderName,
      ticketTypeName: t.ticketType.name,
      status: t.status,
      scannedAt: t.scannedAt
    }))
  );
}

interface OfflineScanEntry {
  ticketCode: string;
  eventId: string;
  scannedAt: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  // @ts-expect-error - id custom
  const agentId: string = session.user.id;

  const { scans }: { scans: OfflineScanEntry[] } = await req.json();

  // Rejoue les scans dans l'ordre chronologique pour une résolution cohérente
  const sorted = [...scans].sort(
    (a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime()
  );

  const results = [];
  for (const scan of sorted) {
    const outcome = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({ where: { code: scan.ticketCode } });
      if (!ticket) return { ticketCode: scan.ticketCode, result: "NOT_FOUND" as const };
      if (ticket.eventId !== scan.eventId) return { ticketCode: scan.ticketCode, result: "WRONG_EVENT" as const };
      if (ticket.status === "SCANNED") return { ticketCode: scan.ticketCode, result: "ALREADY_SCANNED" as const };
      if (ticket.status === "CANCELLED") return { ticketCode: scan.ticketCode, result: "CANCELLED_TICKET" as const };

      await tx.ticket.update({
        where: { id: ticket.id },
        data: { status: "SCANNED", scannedAt: new Date(scan.scannedAt), scannedBy: agentId }
      });
      await tx.scanLog.create({
        data: {
          eventId: scan.eventId,
          ticketId: ticket.id,
          result: "SUCCESS",
          scannedBy: agentId,
          offlineSync: true,
          scannedAt: new Date(scan.scannedAt)
        }
      });
      return { ticketCode: scan.ticketCode, result: "SUCCESS" as const };
    });
    results.push(outcome);
  }

  return NextResponse.json({ results });
}

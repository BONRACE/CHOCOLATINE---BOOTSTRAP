import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseQrPayload } from "@/lib/ticket-qr";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/tickets/verify — Endpoint appelé par le scanner QUAND IL EST EN LIGNE.
 * Valide le billet de façon atomique (empêche deux agents de scanner le même
 * billet en même temps) et journalise le résultat pour les stats live.
 */

interface VerifyBody {
  payload: string; // contenu brut lu depuis le QR code
  eventId: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  // @ts-expect-error - id custom
  const agentId: string = session.user.id;

  const body: VerifyBody = await req.json();
  const parsed = parseQrPayload(body.payload);

  if (!parsed.valid || !parsed.code) {
    await logScan(body.eventId, null, "NOT_FOUND", agentId);
    return NextResponse.json({ ok: false, reason: "Billet inexistant" }, { status: 200 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { code: parsed.code },
      include: { ticketType: true }
    });

    if (!ticket) return { ok: false, reason: "Billet inexistant", logResult: "NOT_FOUND" as const };

    if (ticket.eventId !== body.eventId) {
      return { ok: false, reason: "Mauvais événement", logResult: "WRONG_EVENT" as const, ticketId: ticket.id };
    }

    if (ticket.status === "CANCELLED") {
      return { ok: false, reason: "Billet annulé", logResult: "CANCELLED_TICKET" as const, ticketId: ticket.id };
    }

    if (ticket.status === "SCANNED") {
      const heure = ticket.scannedAt
        ? new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(ticket.scannedAt)
        : "?";
      return {
        ok: false,
        reason: `Billet déjà scanné à ${heure}`,
        logResult: "ALREADY_SCANNED" as const,
        ticketId: ticket.id
      };
    }

    await tx.ticket.update({
      where: { id: ticket.id },
      data: { status: "SCANNED", scannedAt: new Date(), scannedBy: agentId }
    });

    return {
      ok: true,
      logResult: "SUCCESS" as const,
      ticketId: ticket.id,
      holderName: ticket.holderName,
      ticketTypeName: ticket.ticketType.name
    };
  });

  await logScan(body.eventId, result.ticketId ?? null, result.logResult, agentId);

  return NextResponse.json(result);
}

async function logScan(
  eventId: string,
  ticketId: string | null,
  result: "SUCCESS" | "ALREADY_SCANNED" | "NOT_FOUND" | "WRONG_EVENT" | "CANCELLED_TICKET",
  scannedBy: string,
  offlineSync = false
) {
  await prisma.scanLog.create({
    data: { eventId, ticketId: ticketId ?? undefined, result, scannedBy, offlineSync }
  });
}

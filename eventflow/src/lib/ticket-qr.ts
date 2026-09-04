import crypto from "crypto";

/**
 * Génère et vérifie le contenu sécurisé encodé dans le QR code d'un billet.
 * Format du payload : "<ticketCode>.<signatureHMAC>"
 * La signature empêche la falsification/duplication d'un billet (ex: capture
 * d'écran modifiée) car elle ne peut être recalculée sans TICKET_SECRET.
 */

function getSecret(): string {
  const secret = process.env.TICKET_SECRET;
  if (!secret) throw new Error("TICKET_SECRET manquant dans l'environnement");
  return secret;
}

export function generateTicketCode(): string {
  return crypto.randomBytes(12).toString("hex");
}

export function signTicketCode(code: string): string {
  return crypto.createHmac("sha256", getSecret()).update(code).digest("hex").slice(0, 24);
}

export function buildQrPayload(code: string): string {
  return `${code}.${signTicketCode(code)}`;
}

export interface ParsedQrPayload {
  valid: boolean;
  code?: string;
}

export function parseQrPayload(payload: string): ParsedQrPayload {
  const [code, signature] = payload.split(".");
  if (!code || !signature) return { valid: false };
  const expected = signTicketCode(code);
  // Comparaison à temps constant pour éviter les attaques de timing
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  return valid ? { valid: true, code } : { valid: false };
}

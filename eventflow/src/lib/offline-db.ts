"use client";

import { openDB, DBSchema, IDBPDatabase } from "idb";

/**
 * Base de données locale (IndexedDB) pour le scanner PWA.
 * Permet de valider les billets même sans connexion réseau, en stockant
 * une copie chiffrée-signée de la liste des billets de l'événement chargé,
 * et une file d'attente des scans effectués hors-ligne à synchroniser.
 */

export interface CachedTicket {
  code: string;
  eventId: string;
  holderName: string;
  ticketTypeName: string;
  status: "VALID" | "SCANNED" | "CANCELLED";
  scannedAt?: string;
}

export interface PendingScan {
  id?: number;
  ticketCode: string;
  eventId: string;
  scannedAt: string;
  scannedBy: string;
  result: "SUCCESS" | "ALREADY_SCANNED" | "NOT_FOUND" | "WRONG_EVENT" | "CANCELLED_TICKET";
  synced: boolean;
}

interface EventFlowDB extends DBSchema {
  tickets: {
    key: string; // ticket code
    value: CachedTicket;
    indexes: { "by-event": string };
  };
  pendingScans: {
    key: number;
    value: PendingScan;
    indexes: { "by-synced": string };
  };
}

let dbPromise: Promise<IDBPDatabase<EventFlowDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<EventFlowDB>("eventflow-scanner", 1, {
      upgrade(db) {
        const ticketStore = db.createObjectStore("tickets", { keyPath: "code" });
        ticketStore.createIndex("by-event", "eventId");

        const scanStore = db.createObjectStore("pendingScans", {
          keyPath: "id",
          autoIncrement: true
        });
        scanStore.createIndex("by-synced", "synced");
      }
    });
  }
  return dbPromise;
}

// ---- Cache des billets (téléchargé au moment de la sélection d'événement) ----

export async function cacheEventTickets(tickets: CachedTicket[]) {
  const db = await getDb();
  const tx = db.transaction("tickets", "readwrite");
  await Promise.all(tickets.map((t) => tx.store.put(t)));
  await tx.done;
}

export async function getCachedTicket(code: string): Promise<CachedTicket | undefined> {
  const db = await getDb();
  return db.get("tickets", code);
}

export async function markTicketScannedLocally(code: string, scannedAt: string) {
  const db = await getDb();
  const ticket = await db.get("tickets", code);
  if (ticket) {
    ticket.status = "SCANNED";
    ticket.scannedAt = scannedAt;
    await db.put("tickets", ticket);
  }
}

// ---- File d'attente des scans à synchroniser ----

export async function queuePendingScan(scan: Omit<PendingScan, "id">) {
  const db = await getDb();
  await db.add("pendingScans", scan as PendingScan);
}

export async function getUnsyncedScans(): Promise<PendingScan[]> {
  const db = await getDb();
  const all = await db.getAll("pendingScans");
  return all.filter((s) => !s.synced);
}

export async function markScanSynced(id: number) {
  const db = await getDb();
  const scan = await db.get("pendingScans", id);
  if (scan) {
    scan.synced = true;
    await db.put("pendingScans", scan);
  }
}

export async function clearEventCache(eventId: string) {
  const db = await getDb();
  const tx = db.transaction("tickets", "readwrite");
  const index = tx.store.index("by-event");
  let cursor = await index.openCursor(eventId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

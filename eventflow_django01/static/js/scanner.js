/**
 * EventFlow Scan — logique client du scanner PWA.
 *
 * Variables injectées par templates/scanner/scan.html :
 *   EVENT_ID, VERIFY_URL, MANIFEST_URL, SYNC_URL, CSRF_TOKEN
 *
 * Principe de la validation hors-ligne : le manifeste téléchargé depuis
 * MANIFEST_URL contient, pour chaque billet payé, sa signature HMAC-SHA256
 * déjà calculée côté serveur (voir apps/tickets/services.py). Le scanner
 * n'a donc jamais besoin de connaître la clé secrète Django : il compare
 * simplement la signature lue dans le QR code à celle du manifeste local.
 */

const DB_NAME = "eventflow_scanner";
const DB_VERSION = 1;
let scannedLocallyThisSession = new Set();
let db;
let scanCount = 0;

// ---------- IndexedDB ----------

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const database = req.result;
      if (!database.objectStoreNames.contains("manifest")) {
        database.createObjectStore("manifest", { keyPath: "t_id" });
      }
      if (!database.objectStoreNames.contains("pending")) {
        database.createObjectStore("pending", { keyPath: "offline_id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(storeName, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function idbGet(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function idbDelete(storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function idbClearManifest() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("manifest", "readwrite");
    tx.objectStore("manifest").clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------- Manifeste hors-ligne ----------

async function downloadManifest() {
  try {
    const res = await fetch(MANIFEST_URL, { credentials: "same-origin" });
    if (!res.ok) return;
    const data = await res.json();
    await idbClearManifest();
    for (const ticket of data.tickets) {
      await idbPut("manifest", { ...ticket, scanned_locally: false });
    }
  } catch (err) {
    // Pas de réseau au chargement : on continue avec le manifeste déjà
    // stocké localement depuis une session précédente, s'il existe.
    console.warn("Manifeste non téléchargé (hors-ligne ?)", err);
  }
}

// ---------- Réseau ----------

function updateNetworkBadge() {
  const badge = document.getElementById("network-badge");
  if (navigator.onLine) {
    badge.textContent = "En ligne";
    badge.className = "flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-xs font-medium text-ivory/80";
  } else {
    badge.textContent = "Hors-ligne";
    badge.className = "flex items-center gap-1.5 rounded-full bg-coral/20 px-3 py-1.5 text-xs font-medium text-coral";
  }
}

window.addEventListener("online", () => {
  updateNetworkBadge();
  downloadManifest();
  syncPendingScans();
});
window.addEventListener("offline", updateNetworkBadge);

// ---------- Son (Web Audio API) ----------

function playTone(frequency) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (err) {
    // Web Audio indisponible (ex. autoplay bloqué avant interaction) : on
    // n'interrompt pas le scan pour autant, le retour visuel suffit.
  }
}

// ---------- File de synchronisation ----------

async function queuePendingScan(entry) {
  await idbPut("pending", entry);
  await refreshSyncBadge();
}

async function refreshSyncBadge() {
  const pending = await idbGetAll("pending");
  const btn = document.getElementById("sync-btn");
  const count = document.getElementById("sync-count");
  count.textContent = pending.length;
  btn.classList.toggle("hidden", pending.length === 0);
  btn.classList.toggle("flex", pending.length > 0);
}

async function syncPendingScans() {
  if (!navigator.onLine) return;
  const pending = await idbGetAll("pending");
  if (pending.length === 0) return;
  try {
    const res = await fetch(SYNC_URL, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-CSRFToken": CSRF_TOKEN },
      body: JSON.stringify({ scans: pending }),
    });
    if (res.ok) {
      for (const entry of pending) {
        await idbDelete("pending", entry.offline_id);
      }
      await refreshSyncBadge();
    }
  } catch (err) {
    console.warn("Synchronisation reportée — toujours hors-ligne.", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sync-btn").addEventListener("click", syncPendingScans);
});

// ---------- Feedback visuel plein écran ----------

function showFeedback(kind, title, subtitle, photoUrl) {
  const overlay = document.getElementById("feedback-overlay");
  const validIcon = document.getElementById("feedback-icon-valid");
  const invalidIcon = document.getElementById("feedback-icon-invalid");
  const photoEl = document.getElementById("feedback-photo");

  overlay.classList.remove("hidden");
  overlay.classList.add("flex");
  overlay.style.backgroundColor = kind === "valid" ? "#0B4A32" : "#E2572B";

  // La photo n'est montrée que pour un billet valide : c'est elle qui
  // permet à l'agent de vérifier visuellement l'identité au contrôle,
  // comme sur un visa — elle prime alors sur la grosse icône de validation.
  if (photoEl) {
    if (kind === "valid" && photoUrl) {
      photoEl.src = photoUrl;
      photoEl.classList.remove("hidden");
      validIcon.classList.add("hidden");
    } else {
      photoEl.classList.add("hidden");
      validIcon.classList.toggle("hidden", kind !== "valid");
    }
  } else {
    validIcon.classList.toggle("hidden", kind !== "valid");
  }
  invalidIcon.classList.toggle("hidden", kind === "valid");
  document.getElementById("feedback-title").textContent = title;
  document.getElementById("feedback-subtitle").textContent = subtitle || "";

  playTone(kind === "valid" ? 1046 : 220);

  window.setTimeout(() => {
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
  }, 2400);
}

function bumpCounter() {
  scanCount += 1;
  const counter = document.getElementById("scan-counter");
  const [, total] = counter.textContent.split("/");
  counter.textContent = `${scanCount} /${total}`;
}

// ---------- Vérification hors-ligne ----------

const ERROR_MESSAGES = {
  NOT_FOUND: "Billet inexistant",
  WRONG_EVENT: "Mauvais événement",
  CANCELLED_TICKET: "Billet annulé",
};

async function verifyOffline(payload) {
  const entry = await idbGet("manifest", payload.t_id);
  if (!entry || entry.sig !== payload.sig) {
    return { result: "NOT_FOUND" };
  }
  if (entry.e_id !== EVENT_ID) {
    return { result: "WRONG_EVENT" };
  }
  if (entry.scanned_locally || scannedLocallyThisSession.has(entry.t_id)) {
    return { result: "ALREADY_SCANNED", already_scanned_at: entry.scanned_at_local || "" };
  }
  entry.scanned_locally = true;
  entry.scanned_at_local = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  await idbPut("manifest", entry);
  scannedLocallyThisSession.add(entry.t_id);
  return { result: "VALID" };
}

// ---------- Traitement d'un scan ----------

let processing = false;

async function handleDecodedText(text) {
  if (processing) return;
  processing = true;
  window.setTimeout(() => { processing = false; }, 900); // anti-rebond caméra

  let payload;
  try {
    payload = JSON.parse(text);
  } catch (err) {
    showFeedback("invalid", "Billet inexistant");
    return;
  }

  const offlineId = `${payload.t_id}-${Date.now()}`;

  if (navigator.onLine) {
    try {
      const res = await fetch(VERIFY_URL, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-CSRFToken": CSRF_TOKEN },
        body: JSON.stringify({ payload, event_id: EVENT_ID, offline_id: offlineId }),
      });
      const data = await res.json();
      applyResult(data.result, data.holder, data.already_scanned_at);
      return;
    } catch (err) {
      // Le réseau vient de tomber entre la détection online et l'appel fetch :
      // on bascule sur la validation locale ci-dessous.
    }
  }

  const local = await verifyOffline(payload);
  await queuePendingScan({
    offline_id: offlineId,
    t_id: payload.t_id,
    e_id: payload.e_id,
    result: local.result,
    scanned_at: new Date().toISOString(),
  });
  // Hors-ligne, le manifeste local ne contient que les signatures (pas les
  // photos, pour rester léger) : pas de "holder" à afficher dans ce cas.
  applyResult(local.result, null, local.already_scanned_at);
}

function applyResult(result, holder, alreadyScannedAt) {
  if (result === "VALID") {
    bumpCounter();
    const subtitle = holder ? [holder.category, holder.profession].filter(Boolean).join(" · ") : "";
    showFeedback("valid", (holder && holder.name) || "Billet valide", subtitle, holder && holder.photo_url);
  } else if (result === "ALREADY_SCANNED") {
    const who = holder && holder.name ? `${holder.name} — ` : "";
    showFeedback("invalid", `${who}Billet déjà scanné${alreadyScannedAt ? " à " + alreadyScannedAt : ""}`);
  } else {
    showFeedback("invalid", ERROR_MESSAGES[result] || "Billet inexistant");
  }
}

// ---------- Caméra (html5-qrcode) ----------

function startCamera() {
  const reader = new Html5Qrcode("qr-reader");
  reader
    .start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (decodedText) => handleDecodedText(decodedText),
      () => { /* pas de QR code dans la trame courante — silencieux */ }
    )
    .catch((err) => {
      document.getElementById("qr-reader").innerHTML =
        '<p class="p-6 text-center text-sm text-coral">Impossible d\'accéder à la caméra. Vérifiez les autorisations du navigateur.</p>';
      console.error(err);
    });
}

// ---------- Démarrage ----------

(async function init() {
  db = await openDb();
  updateNetworkBadge();
  await refreshSyncBadge();
  if (navigator.onLine) {
    await downloadManifest();
    await syncPendingScans();
  }
  startCamera();
})();

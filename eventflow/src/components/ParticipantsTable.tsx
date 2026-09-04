"use client";

import { useMemo, useState } from "react";

interface Participant {
  id: string;
  holderName: string;
  ticketTypeName: string;
  status: "VALID" | "SCANNED" | "CANCELLED";
  buyerEmail: string;
}

const STATUS_LABEL: Record<Participant["status"], string> = {
  VALID: "Payé",
  SCANNED: "Scanné",
  CANCELLED: "Annulé"
};

const STATUS_COLOR: Record<Participant["status"], string> = {
  VALID: "bg-blue-100 text-blue-700",
  SCANNED: "bg-primary/10 text-primary",
  CANCELLED: "bg-red-100 text-red-700"
};

export default function ParticipantsTable({ participants }: { participants: Participant[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Participant["status"] | "ALL">("ALL");

  const filtered = useMemo(
    () =>
      participants.filter((p) => {
        const matchesSearch = p.holderName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [participants, search, statusFilter]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un participant..."
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Participant["status"] | "ALL")}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="VALID">Payé</option>
          <option value="SCANNED">Scanné</option>
          <option value="CANCELLED">Annulé</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.holderName}</td>
                <td className="px-4 py-3 text-gray-600">{p.ticketTypeName}</td>
                <td className="px-4 py-3 text-gray-600">{p.buyerEmail}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLOR[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

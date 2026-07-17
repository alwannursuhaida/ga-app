"use client";
// made by al with love
import { useState } from "react";

type UnitData = {
  id: string;
  name: string;
  label: string;
  namaPenanggungJawab: string | null;
  namaKepalaSekolah: string | null;
};

export default function PengaturanUnitForm({ units: initialUnits }: { units: UnitData[] }) {
  const [units, setUnits] = useState(initialUnits);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  function updateLocal(id: string, field: "namaPenanggungJawab" | "namaKepalaSekolah", value: string) {
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, [field]: value } : u)));
  }

  async function save(unit: UnitData) {
    setSavingId(unit.id);
    setSavedId(null);
    await fetch("/api/pengaturan/unit", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitId: unit.id,
        namaPenanggungJawab: unit.namaPenanggungJawab,
        namaKepalaSekolah: unit.namaKepalaSekolah,
      }),
    });
    setSavingId(null);
    setSavedId(unit.id);
    setTimeout(() => setSavedId(null), 2000);
  }

  return (
    <div className="space-y-3">
      {units.map((unit) => {
        const isYayasan = unit.name === "YAYASAN";
        return (
          <div key={unit.id} className="rounded-md border border-line bg-paper p-4">
            <p className="mb-3 font-display text-sm font-semibold text-ink">{unit.label}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink/70">
                  {isYayasan
                    ? "Nama Kepala Divisi General Affair"
                    : "Nama Wakil Kepala Sarpra"}
                </label>
                <input
                  value={unit.namaPenanggungJawab || ""}
                  onChange={(e) => updateLocal(unit.id, "namaPenanggungJawab", e.target.value)}
                  placeholder="mis. Mohamad Alimuddin, S.E.Sy."
                  className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
                />
              </div>
              {!isYayasan && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink/70">
                    Nama Kepala Sekolah
                  </label>
                  <input
                    value={unit.namaKepalaSekolah || ""}
                    onChange={(e) => updateLocal(unit.id, "namaKepalaSekolah", e.target.value)}
                    placeholder="mis. Fulan, S.Pd."
                    className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
                  />
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => save(unit)}
                disabled={savingId === unit.id}
                className="rounded-sm bg-deep px-3 py-1.5 text-xs font-medium text-sand hover:opacity-90 disabled:opacity-50"
              >
                {savingId === unit.id ? "Menyimpan..." : "Simpan"}
              </button>
              {savedId === unit.id && (
                <span className="text-xs text-moss">Tersimpan.</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

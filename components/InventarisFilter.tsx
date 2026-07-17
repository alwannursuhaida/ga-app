"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function InventarisFilter({
  units,
  showUnitFilter,
}: {
  units: { id: string; label: string }[];
  showUnitFilter: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const inputClass =
    "w-full rounded-sm border border-line bg-white px-3 py-2 text-xs outline-none focus:border-deep";

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 rounded-md border border-line bg-paper p-4 sm:grid-cols-3 lg:grid-cols-6">
      <div>
        <label className="mb-1 block text-[10px] font-medium text-ink/50">Nama Barang</label>
        <input
          defaultValue={searchParams.get("nama") || ""}
          onChange={(e) => setParam("nama", e.target.value)}
          placeholder="Cari nama..."
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-medium text-ink/50">Kode Aset</label>
        <input
          defaultValue={searchParams.get("kode") || ""}
          onChange={(e) => setParam("kode", e.target.value)}
          placeholder="AST-..."
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-medium text-ink/50">Kategori</label>
        <input
          defaultValue={searchParams.get("kategori") || ""}
          onChange={(e) => setParam("kategori", e.target.value)}
          placeholder="Elektronik..."
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-medium text-ink/50">Kondisi</label>
        <select
          defaultValue={searchParams.get("kondisi") || ""}
          onChange={(e) => setParam("kondisi", e.target.value)}
          className={inputClass}
        >
          <option value="">Semua</option>
          <option value="BAIK">Baik</option>
          <option value="RUSAK_RINGAN">Rusak Ringan</option>
          <option value="RUSAK_BERAT">Rusak Berat</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-medium text-ink/50">Lokasi</label>
        <input
          defaultValue={searchParams.get("lokasi") || ""}
          onChange={(e) => setParam("lokasi", e.target.value)}
          placeholder="Ruang..."
          className={inputClass}
        />
      </div>
      {showUnitFilter && (
        <div>
          <label className="mb-1 block text-[10px] font-medium text-ink/50">Unit</label>
          <select
            defaultValue={searchParams.get("unitId") || ""}
            onChange={(e) => setParam("unitId", e.target.value)}
            className={inputClass}
          >
            <option value="">Semua Unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

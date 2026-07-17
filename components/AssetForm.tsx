"use client";
// made by al with love
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, formatRupiahInput, hitungPenyusutan } from "@/lib/labels";

export default function AssetForm({
  units,
  lockedUnit,
  initial,
  mode = "create",
  assetId,
}: {
  units: { id: string; label: string }[];
  /** Jika terisi, field Unit dikunci (staff hanya bisa menambah aset milik unitnya sendiri) */
  lockedUnit?: { id: string; label: string };
  initial?: {
    kode: string;
    nama: string;
    kategori: string;
    kondisi: string;
    lokasi: string;
    unitId: string;
    jumlah: number;
    keterangan?: string | null;
    tahunPengadaan?: number | null;
    hargaBeli?: number | null;
    hargaJual?: number | null;
    masaManfaat?: number | null;
  };
  mode?: "create" | "edit";
  assetId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    kode: initial?.kode || "",
    nama: initial?.nama || "",
    kategori: initial?.kategori || "",
    kondisi: initial?.kondisi || "BAIK",
    lokasi: initial?.lokasi || "",
    unitId: lockedUnit?.id || initial?.unitId || units[0]?.id || "",
    jumlah: String(initial?.jumlah ?? 1),
    keterangan: initial?.keterangan || "",
    tahunPengadaan: initial?.tahunPengadaan ? String(initial.tahunPengadaan) : "",
    hargaBeli: initial?.hargaBeli ? String(initial.hargaBeli) : "",
    hargaJual: initial?.hargaJual ? String(initial.hargaJual) : "",
    masaManfaat: initial?.masaManfaat ? String(initial.masaManfaat) : "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const url = mode === "edit" && assetId ? `/api/assets/${assetId}` : "/api/assets";
    const res = await fetch(url, {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tahunPengadaan: form.tahunPengadaan ? Number(form.tahunPengadaan) : undefined,
        hargaBeli: form.hargaBeli ? Number(form.hargaBeli) : undefined,
        hargaJual: form.hargaJual ? Number(form.hargaJual) : undefined,
        masaManfaat: form.masaManfaat ? Number(form.masaManfaat) : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal menyimpan aset.");
      return;
    }
    router.push("/dashboard/inventaris");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl rounded-md border border-line bg-paper p-6">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Kode Aset</label>
          <input
            required
            value={form.kode}
            onChange={(e) => update("kode", e.target.value)}
            placeholder="AST-SMP-0002"
            className="w-full rounded-sm border border-line bg-white px-3 py-2 font-mono text-sm outline-none focus:border-deep"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Jumlah</label>
          <input
            type="number"
            min={1}
            required
            value={form.jumlah}
            onChange={(e) => update("jumlah", e.target.value)}
            className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
          />
        </div>
      </div>

      <label className="mb-1 block text-xs font-medium text-ink/70">Nama Barang</label>
      <input
        required
        value={form.nama}
        onChange={(e) => update("nama", e.target.value)}
        placeholder="mis. Proyektor Epson EB-X05"
        className="mb-4 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
      />

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Kategori</label>
          <input
            required
            value={form.kategori}
            onChange={(e) => update("kategori", e.target.value)}
            placeholder="Elektronik / Furnitur / dst"
            className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Kondisi</label>
          <select
            value={form.kondisi}
            onChange={(e) => update("kondisi", e.target.value)}
            className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
          >
            <option value="BAIK">Baik</option>
            <option value="RUSAK_RINGAN">Rusak Ringan</option>
            <option value="RUSAK_BERAT">Rusak Berat</option>
          </select>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Unit</label>
          {lockedUnit ? (
            <div className="flex w-full items-center rounded-sm border border-line bg-sand/40 px-3 py-2 text-sm text-ink/70">
              {lockedUnit.label}
              <span className="ml-auto text-[10px] uppercase tracking-wide text-ink/40">Otomatis</span>
            </div>
          ) : (
            <select
              value={form.unitId}
              onChange={(e) => update("unitId", e.target.value)}
              className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Lokasi</label>
          <input
            required
            value={form.lokasi}
            onChange={(e) => update("lokasi", e.target.value)}
            placeholder="mis. Ruang Kelas 7A"
            className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Tahun Pengadaan</label>
          <input
            type="number"
            min={1990}
            max={2100}
            value={form.tahunPengadaan}
            onChange={(e) => update("tahunPengadaan", e.target.value)}
            placeholder="mis. 2024"
            className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Masa Manfaat (tahun)</label>
          <input
            type="number"
            min={1}
            value={form.masaManfaat}
            onChange={(e) => update("masaManfaat", e.target.value)}
            placeholder="mis. 5"
            className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Harga Beli</label>
          <div className="flex items-center rounded-sm border border-line bg-white focus-within:border-deep">
            <span className="pl-3 text-sm text-ink/40">Rp</span>
            <input
              inputMode="numeric"
              value={formatRupiahInput(form.hargaBeli)}
              onChange={(e) => update("hargaBeli", e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="w-full bg-transparent px-2 py-2 text-sm outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/70">Harga Jual</label>
          <div className="flex items-center rounded-sm border border-line bg-white focus-within:border-deep">
            <span className="pl-3 text-sm text-ink/40">Rp</span>
            <input
              inputMode="numeric"
              value={formatRupiahInput(form.hargaJual)}
              onChange={(e) => update("hargaJual", e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="w-full bg-transparent px-2 py-2 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <label className="mb-1 block text-xs font-medium text-ink/70">
        Nilai Penyusutan / Tahun (otomatis)
      </label>
      <div className="mb-4 w-full rounded-sm border border-dashed border-line bg-sand/40 px-3 py-2 text-sm text-ink/60">
        {formatRupiah(
          hitungPenyusutan(
            Number(form.hargaBeli) || 0,
            Number(form.hargaJual) || 0,
            Number(form.masaManfaat) || 0
          )
        )}
      </div>

      <label className="mb-1 block text-xs font-medium text-ink/70">Keterangan (opsional)</label>
      <textarea
        rows={3}
        value={form.keterangan}
        onChange={(e) => update("keterangan", e.target.value)}
        className="mb-4 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
      />

      {error && (
        <p className="mb-4 rounded-sm bg-rust/10 px-3 py-2 text-xs text-rust">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-deep px-4 py-2 text-sm font-medium text-sand hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Simpan Aset"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/inventaris")}
          className="rounded-sm border border-line px-4 py-2 text-sm text-ink/60 hover:bg-sand"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

"use client";
// made by al with love
import { useState } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/image";

type LoanAsset = {
  id: string;
  kode: string;
  nama: string;
  lokasi: string;
};

type LoanUnit = {
  id: string;
  name: string;
  label: string;
  assets: LoanAsset[];
};

export default function RequestForm({
  type,
  backHref,
  showDates,
  loanUnits = [],
}: {
  type: "PERBAIKAN" | "PENGAJUAN_SARANA" | "PEMINJAMAN";
  backHref: string;
  showDates?: boolean;
  loanUnits?: LoanUnit[];
}) {
  const router = useRouter();
  const isLoan = type === "PEMINJAMAN";
  const isPerbaikan = type === "PERBAIKAN";
  const isPengadaan = type === "PENGAJUAN_SARANA";
  const showLokasiFoto = isPerbaikan || isPengadaan;
  const [ownerUnitId, setOwnerUnitId] = useState(loanUnits[0]?.id || "");
  const selectedUnit = loanUnits.find((u) => u.id === ownerUnitId);
  const availableAssets = selectedUnit?.assets || [];
  const [assetId, setAssetId] = useState(availableAssets[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lokasiPerbaikan, setLokasiPerbaikan] = useState("");
  const [tingkatKerusakan, setTingkatKerusakan] = useState("RINGAN");
  const [urgensi, setUrgensi] = useState("DAPAT_MENUNGGU");
  const [fotoSebelum, setFotoSebelum] = useState("");
  const [fotoError, setFotoError] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFotoSebelum(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoError("");
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setFotoSebelum(compressed);
    } catch {
      setFotoError("Gagal memproses foto. Coba foto lain.");
    } finally {
      setCompressing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const selectedAsset = availableAssets.find((a) => a.id === assetId);
    const requestTitle = isLoan ? selectedAsset?.nama || "" : title;
    const requestDescription = isLoan
      ? `Peminjaman ${selectedAsset?.nama || "barang"} milik ${selectedUnit?.label || "unit"}.`
      : description;

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title: requestTitle,
        description: requestDescription,
        assetId: isLoan ? assetId : undefined,
        lokasiPerbaikan: showLokasiFoto ? lokasiPerbaikan : undefined,
        tingkatKerusakan: isPerbaikan ? tingkatKerusakan : undefined,
        urgensi: isPerbaikan ? urgensi : undefined,
        fotoSebelum: showLokasiFoto && fotoSebelum ? fotoSebelum : undefined,
        tanggalMulai: tanggalMulai || undefined,
        tanggalSelesai: tanggalSelesai || undefined,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal mengirim data.");
      return;
    }
    router.push(backHref);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl rounded-md border border-line bg-paper p-6"
    >
      {isLoan ? (
        <>
          <label className="mb-1 block text-xs font-medium text-ink/70">Milik</label>
          <select
            required
            value={ownerUnitId}
            onChange={(e) => {
              const nextUnitId = e.target.value;
              const nextUnit = loanUnits.find((u) => u.id === nextUnitId);
              setOwnerUnitId(nextUnitId);
              setAssetId(nextUnit?.assets[0]?.id || "");
            }}
            className="mb-4 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
          >
            {loanUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>

          <label className="mb-1 block text-xs font-medium text-ink/70">Barang</label>
          <select
            required
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            disabled={availableAssets.length === 0}
            className="mb-4 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep disabled:bg-line/40 disabled:text-ink/40"
          >
            {availableAssets.length === 0 ? (
              <option value="">Belum ada barang diinventarisir</option>
            ) : (
              availableAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama} - {a.kode} - {a.lokasi}
                </option>
              ))
            )}
          </select>
        </>
      ) : (
        <>
          <label className="mb-1 block text-xs font-medium text-ink/70">Judul</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="mis. AC Ruang Kelas 8B tidak dingin"
            className="mb-4 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
          />

          <label className="mb-1 block text-xs font-medium text-ink/70">Deskripsi</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan detail kondisi, lokasi tepat, dan urgensinya."
            className="mb-4 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
          />
        </>
      )}

      {isPerbaikan && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">
              Tingkat Kerusakan
            </label>
            <select
              value={tingkatKerusakan}
              onChange={(e) => setTingkatKerusakan(e.target.value)}
              className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
            >
              <option value="RINGAN">Ringan</option>
              <option value="SEDANG">Sedang</option>
              <option value="BERAT">Berat</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">
              Sifat Permintaan
            </label>
            <select
              value={urgensi}
              onChange={(e) => setUrgensi(e.target.value)}
              className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
            >
              <option value="DAPAT_MENUNGGU">Dapat Menunggu</option>
              <option value="SEGERA">Segera</option>
            </select>
          </div>
        </div>
      )}

      {showLokasiFoto && (
        <>
          <label className="mb-1 block text-xs font-medium text-ink/70">
            {isPerbaikan ? "Lokasi Perbaikan" : "Lokasi Pengadaan"}
          </label>
          <input
            required
            value={lokasiPerbaikan}
            onChange={(e) => setLokasiPerbaikan(e.target.value)}
            placeholder="mis. Ruang Kelas 8B"
            className="mb-4 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
          />

          <label className="mb-1 block text-xs font-medium text-ink/70">
            {isPerbaikan ? "Foto Bukti Kerusakan (Before)" : "Foto Pendukung"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFotoSebelum}
            className="mb-2 w-full rounded-sm border border-line bg-white px-3 py-2 text-xs outline-none file:mr-3 file:rounded-sm file:border-0 file:bg-sand file:px-2 file:py-1 file:text-xs"
          />
          {compressing && <p className="mb-2 text-xs text-ink/40">Memproses foto...</p>}
          {fotoError && <p className="mb-2 text-xs text-rust">{fotoError}</p>}
          {fotoSebelum && (
            <img
              src={fotoSebelum}
              alt="Preview foto"
              className="mb-4 h-32 w-auto rounded-sm border border-line object-cover"
            />
          )}
        </>
      )}

      {showDates && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">Tanggal Mulai</label>
            <input
              type="date"
              required
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink/70">Tanggal Selesai</label>
            <input
              type="date"
              required
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-sm bg-rust/10 px-3 py-2 text-xs text-rust">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-sm bg-deep px-4 py-2 text-sm font-medium text-sand hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Mengirim..." : "Kirim"}
        </button>
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="rounded-sm border border-line px-4 py-2 text-sm text-ink/60 hover:bg-sand"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

"use client";
// made by al with love
import { useState } from "react";
import { useRouter } from "next/navigation";
import { statusLabel } from "@/lib/labels";
import { compressImage } from "@/lib/image";

const options = ["DIAJUKAN", "DIPROSES", "SELESAI", "DITOLAK"];

function toDateInputValue(d?: string | Date | null) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function RequestActions({
  id,
  currentStatus,
  currentCatatan,
  editableDates,
  currentTanggalMulai,
  currentTanggalSelesai,
  showTenggatWaktu,
  currentTenggatWaktu,
  showFotoSesudah,
  currentFotoSesudah,
}: {
  id: string;
  currentStatus: string;
  currentCatatan?: string | null;
  /** true untuk peminjaman: pemilik aset boleh menyesuaikan periode pinjam */
  editableDates?: boolean;
  currentTanggalMulai?: string | Date | null;
  currentTanggalSelesai?: string | Date | null;
  /** true untuk perbaikan: wajib isi tenggat waktu saat status diubah ke Diproses */
  showTenggatWaktu?: boolean;
  currentTenggatWaktu?: string | Date | null;
  /** true untuk perbaikan: GA dapat mengunggah foto bukti setelah diperbaiki */
  showFotoSesudah?: boolean;
  currentFotoSesudah?: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [catatan, setCatatan] = useState(currentCatatan || "");
  const [tanggalMulai, setTanggalMulai] = useState(toDateInputValue(currentTanggalMulai));
  const [tanggalSelesai, setTanggalSelesai] = useState(toDateInputValue(currentTanggalSelesai));
  const [tenggatWaktu, setTenggatWaktu] = useState(toDateInputValue(currentTenggatWaktu));
  const [fotoSesudah, setFotoSesudah] = useState("");
  const [fotoError, setFotoError] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const needsTenggat =
    showTenggatWaktu && status === "DIPROSES" && !tenggatWaktu;

  const dirty =
    status !== currentStatus ||
    catatan !== (currentCatatan || "") ||
    fotoSesudah !== "" ||
    (showTenggatWaktu && tenggatWaktu !== toDateInputValue(currentTenggatWaktu)) ||
    (editableDates &&
      (tanggalMulai !== toDateInputValue(currentTanggalMulai) ||
        tanggalSelesai !== toDateInputValue(currentTanggalSelesai)));

  async function handleFotoSesudah(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoError("");
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setFotoSesudah(compressed);
    } catch {
      setFotoError("Gagal memproses foto. Coba foto lain.");
    } finally {
      setCompressing(false);
    }
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        catatanGA: catatan,
        ...(showTenggatWaktu && { tenggatWaktu: tenggatWaktu || null }),
        ...(fotoSesudah && { fotoSesudah }),
        ...(editableDates && {
          tanggalMulai: tanggalMulai || null,
          tanggalSelesai: tanggalSelesai || null,
        }),
      }),
    });
    setSaving(false);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-sm border border-line px-2 py-1 text-xs text-ink/70 hover:bg-sand"
      >
        Proses
      </button>
    );
  }

  return (
    <div className="w-64 space-y-2 rounded-sm border border-line bg-white p-3 shadow-sm">
      <div>
        <label className="mb-1 block text-[10px] font-medium text-ink/50">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-sm border border-line bg-white px-2 py-1 text-xs outline-none focus:border-deep"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {statusLabel[o]}
            </option>
          ))}
        </select>
      </div>

      {showTenggatWaktu && status === "DIPROSES" && (
        <div>
          <label className="mb-1 block text-[10px] font-medium text-ink/50">
            Tenggat Waktu <span className="text-rust">*</span>
          </label>
          <input
            type="date"
            value={tenggatWaktu}
            onChange={(e) => setTenggatWaktu(e.target.value)}
            className="w-full rounded-sm border border-line bg-white px-2 py-1 text-xs outline-none focus:border-deep"
          />
        </div>
      )}

      {editableDates && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] font-medium text-ink/50">Mulai</label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full rounded-sm border border-line bg-white px-2 py-1 text-xs outline-none focus:border-deep"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-ink/50">Selesai</label>
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="w-full rounded-sm border border-line bg-white px-2 py-1 text-xs outline-none focus:border-deep"
            />
          </div>
        </div>
      )}

      {showFotoSesudah && (
        <div>
          <label className="mb-1 block text-[10px] font-medium text-ink/50">
            Foto Bukti Perbaikan (After)
          </label>
          {currentFotoSesudah && !fotoSesudah && (
            <img
              src={currentFotoSesudah}
              alt="Foto sesudah"
              className="mb-1 h-16 w-auto rounded-sm border border-line object-cover"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFotoSesudah}
            className="w-full rounded-sm border border-line bg-white px-2 py-1 text-[11px] outline-none file:mr-2 file:rounded-sm file:border-0 file:bg-sand file:px-2 file:py-0.5 file:text-[11px]"
          />
          {compressing && <p className="text-[10px] text-ink/40">Memproses foto...</p>}
          {fotoError && <p className="text-[10px] text-rust">{fotoError}</p>}
          {fotoSesudah && (
            <img
              src={fotoSesudah}
              alt="Preview foto sesudah"
              className="mt-1 h-16 w-auto rounded-sm border border-line object-cover"
            />
          )}
        </div>
      )}

      <div>
        <label className="mb-1 block text-[10px] font-medium text-ink/50">Catatan</label>
        <textarea
          rows={2}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="mis. alasan penolakan / catatan proses"
          className="w-full rounded-sm border border-line bg-white px-2 py-1 text-xs outline-none focus:border-deep"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving || !dirty || needsTenggat}
          className="rounded-sm bg-deep px-2 py-1 text-xs text-sand hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-sm border border-line px-2 py-1 text-xs text-ink/60 hover:bg-sand"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

"use client";
// made by al with love
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

type ImportRow = {
  kode?: string;
  nama?: string;
  kategori?: string;
  kondisi?: string;
  lokasi?: string;
  jumlah?: number | string;
  tahunPengadaan?: number | string;
  hargaBeli?: number | string;
  hargaJual?: number | string;
  masaManfaat?: number | string;
  keterangan?: string;
};

type ImportResult = {
  created: number;
  skipped: { row: number; alasan: string }[];
};

export default function ImportExcelButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // Normalisasi header (template pakai judul kolom berbahasa Indonesia)
      const normalized: ImportRow[] = rows.map((r) => ({
        kode: String(r["Kode Aset"] ?? "").trim(),
        nama: String(r["Nama Barang"] ?? "").trim(),
        kategori: String(r["Kategori"] ?? "").trim(),
        kondisi: String(r["Kondisi (BAIK/RUSAK_RINGAN/RUSAK_BERAT)"] ?? r["Kondisi"] ?? "").trim(),
        lokasi: String(r["Lokasi"] ?? "").trim(),
        jumlah: r["Jumlah"],
        tahunPengadaan: r["Tahun Pengadaan"],
        hargaBeli: r["Harga Beli"],
        hargaJual: r["Harga Jual"],
        masaManfaat: r["Masa Manfaat (tahun)"],
        keterangan: String(r["Keterangan"] ?? "").trim(),
      }));

      const res = await fetch("/api/assets/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: normalized }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengimpor file.");
      } else {
        setResult(data);
        router.refresh();
      }
    } catch (err) {
      setError("File tidak dapat dibaca. Pastikan menggunakan template yang disediakan.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href="/api/assets/template"
        className="rounded-sm border border-line px-3 py-2 text-xs font-medium text-ink/70 hover:bg-sand"
      >
        Unduh Template Excel
      </a>
      <label className="cursor-pointer rounded-sm border border-line px-3 py-2 text-xs font-medium text-ink/70 hover:bg-sand">
        {loading ? "Mengimpor..." : "Import Excel"}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          disabled={loading}
          className="hidden"
        />
      </label>

      {(result || error) && (
        <div className="absolute right-6 top-24 z-10 w-72 rounded-sm border border-line bg-white p-3 text-xs shadow-md">
          {error && <p className="text-rust">{error}</p>}
          {result && (
            <div>
              <p className="font-medium text-moss">{result.created} aset berhasil diimpor.</p>
              {result.skipped.length > 0 && (
                <div className="mt-2 space-y-1 text-ink/60">
                  <p className="font-medium text-amber">{result.skipped.length} baris dilewati:</p>
                  {result.skipped.slice(0, 5).map((s, i) => (
                    <p key={i}>
                      Baris {s.row}: {s.alasan}
                    </p>
                  ))}
                </div>
              )}
              <button
                onClick={() => setResult(null)}
                className="mt-2 text-ink/40 underline"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

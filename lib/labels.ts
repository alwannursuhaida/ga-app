// made by al with love

export const requestTypeLabel: Record<string, string> = {
  PERBAIKAN: "Perbaikan Sarpra",
  PENGAJUAN_SARANA: "Pengadaan Sarpra",
  PEMINJAMAN: "Peminjaman Sarpra",
};

export const requestTypePath: Record<string, string> = {
  PERBAIKAN: "perbaikan",
  PENGAJUAN_SARANA: "pengadaan-sarpra",
  PEMINJAMAN: "peminjaman",
};

export const statusLabel: Record<string, string> = {
  DIAJUKAN: "Diajukan",
  DIPROSES: "Diproses",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
};

export const statusStyle: Record<string, string> = {
  DIAJUKAN: "bg-line/60 text-ink",
  DIPROSES: "bg-amber/15 text-amber border border-amber/30",
  SELESAI: "bg-moss/15 text-moss border border-moss/30",
  DITOLAK: "bg-rust/15 text-rust border border-rust/30",
};

export const conditionLabel: Record<string, string> = {
  BAIK: "Baik",
  RUSAK_RINGAN: "Rusak Ringan",
  RUSAK_BERAT: "Rusak Berat",
};

export const conditionStyle: Record<string, string> = {
  BAIK: "bg-moss/15 text-moss border border-moss/30",
  RUSAK_RINGAN: "bg-amber/15 text-amber border border-amber/30",
  RUSAK_BERAT: "bg-rust/15 text-rust border border-rust/30",
};

export function formatRupiah(v: number | null | undefined) {
  if (v === null || v === undefined || isNaN(v)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);
}

export function formatRupiahInput(digits: string) {
  if (!digits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

export function hitungPenyusutan(
  hargaBeli?: number | null,
  hargaJual?: number | null,
  masaManfaat?: number | null
) {
  if (!hargaBeli || !masaManfaat || masaManfaat <= 0) return null;
  const jual = hargaJual || 0;
  return (hargaBeli - jual) / masaManfaat;
}

export const kerusakanLabel: Record<string, string> = {
  RINGAN: "Ringan",
  SEDANG: "Sedang",
  BERAT: "Berat",
};

export const kerusakanStyle: Record<string, string> = {
  RINGAN: "bg-moss/15 text-moss border border-moss/30",
  SEDANG: "bg-amber/15 text-amber border border-amber/30",
  BERAT: "bg-rust/15 text-rust border border-rust/30",
};

export const urgensiLabel: Record<string, string> = {
  SEGERA: "Segera",
  DAPAT_MENUNGGU: "Dapat Menunggu",
};

export const urgensiStyle: Record<string, string> = {
  SEGERA: "bg-rust/15 text-rust border border-rust/30",
  DAPAT_MENUNGGU: "bg-line/60 text-ink/70",
};

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

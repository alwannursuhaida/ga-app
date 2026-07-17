// made by al with love
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import fs from "fs";
import path from "path";

const HARI: Record<number, string> = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

function formatTanggalPanjang(d: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

const CHECK = "☒";
const UNCHECK = "☐";

type RequestForDokumen = {
  title: string;
  description: string;
  lokasiPerbaikan?: string | null;
  tingkatKerusakan?: string | null;
  urgensi?: string | null;
  createdAt: Date;
  unit: {
    name: string;
    label: string;
    namaPenanggungJawab?: string | null;
    namaKepalaSekolah?: string | null;
  };
};

/**
 * Isi jabatan lengkap untuk field "Jabatan" di form.
 * Unit YAYASAN (staff GA) punya kalimat berbeda dari unit sekolah.
 */
function jabatanLengkap(unit: RequestForDokumen["unit"]) {
  if (unit.name === "YAYASAN") {
    return "Kepala Divisi General Affair Yayasan Albanna";
  }
  return `Wakil Kepala Sekolah bagian Sarana dan Prasarana ${unit.label}`;
}

/**
 * Teks jabatan untuk blok tanda tangan (Dilaporkan oleh / Diterima oleh hal 2).
 * Unit YAYASAN pakai "Staff General Affair", bukan format "Wakil Kepala ... Albanna".
 */
function jabatanPelapor(unit: RequestForDokumen["unit"]) {
  if (unit.name === "YAYASAN") return "Staff General Affair";
  return `Wakil Kepala Sarana Prasarana ${unit.label}`;
}

/**
 * Teks jabatan untuk blok "Diketahui oleh" (Kepala Sekolah).
 * Unit YAYASAN pakai "Staff General Affair" juga (tidak ada "kepala sekolah" di level yayasan).
 */
function jabatanMengetahui(unit: RequestForDokumen["unit"]) {
  if (unit.name === "YAYASAN") return "Staff General Affair";
  return `Kepala ${unit.label}`;
}

export function generateDokumenPerbaikan(request: RequestForDokumen): Buffer {
  const templatePath = path.join(process.cwd(), "templates", "permintaan-perbaikan.docx");
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  const tingkat = request.tingkatKerusakan || "";
  const urgensi = request.urgensi || "";

  doc.render({
    barang: request.title,
    hari: HARI[request.createdAt.getDay()],
    tanggal: formatTanggalPanjang(request.createdAt),
    uraianKerusakan: request.description,
    kotakBerat: tingkat === "BERAT" ? CHECK : UNCHECK,
    kotakSedang: tingkat === "SEDANG" ? CHECK : UNCHECK,
    kotakRingan: tingkat === "RINGAN" ? CHECK : UNCHECK,
    namaPenanggungJawab: request.unit.namaPenanggungJawab || "-",
    jabatan: jabatanLengkap(request.unit),
    kotakSegera: urgensi === "SEGERA" ? CHECK : UNCHECK,
    kotakMenunggu: urgensi === "DAPAT_MENUNGGU" ? CHECK : UNCHECK,
    jabatanPelapor: jabatanPelapor(request.unit),
    jabatanMengetahui: jabatanMengetahui(request.unit),
  });

  return doc.getZip().generate({ type: "nodebuffer" });
}

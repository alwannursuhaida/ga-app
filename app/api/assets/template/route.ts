// made by al with love
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const headers = [
    "Kode Aset",
    "Nama Barang",
    "Kategori",
    "Kondisi (BAIK/RUSAK_RINGAN/RUSAK_BERAT)",
    "Lokasi",
    "Jumlah",
    "Tahun Pengadaan",
    "Harga Beli",
    "Harga Jual",
    "Masa Manfaat (tahun)",
    "Keterangan",
  ];

  const contoh = [
    "", // kode dikosongkan -> dibuat otomatis oleh sistem
    "Proyektor Epson EB-X05",
    "Elektronik",
    "BAIK",
    "Ruang Kelas 7A",
    1,
    2024,
    5000000,
    500000,
    5,
    "Contoh baris — hapus/ganti sebelum upload",
  ];

  const sheetData = [headers, contoh];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = [
    { wch: 14 },
    { wch: 28 },
    { wch: 16 },
    { wch: 30 },
    { wch: 22 },
    { wch: 8 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 30 },
  ];

  const petunjuk = [
    ["Petunjuk Pengisian Template Inventaris"],
    [""],
    ["1. Kode Aset boleh dikosongkan — sistem akan membuatkan kode otomatis."],
    ["2. Nama Barang, Kategori, dan Lokasi wajib diisi."],
    ["3. Kondisi hanya boleh salah satu dari: BAIK, RUSAK_RINGAN, RUSAK_BERAT."],
    ["   Jika dikosongkan, akan dianggap BAIK."],
    ["4. Jumlah wajib berupa angka. Jika dikosongkan, dianggap 1."],
    ["5. Setiap aset yang diimpor otomatis menjadi milik unit akun yang mengunggah file ini."],
    ["6. Jangan mengubah judul kolom di sheet 'Template'."],
    [`Diunduh oleh: ${session.name} (${session.unitLabel})`],
  ];
  const wsPetunjuk = XLSX.utils.aoa_to_sheet(petunjuk);
  wsPetunjuk["!cols"] = [{ wch: 70 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.utils.book_append_sheet(wb, wsPetunjuk, "Petunjuk");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="template-inventaris-${session.unitLabel.replace(/\s+/g, "-").toLowerCase()}.xlsx"`,
    },
  });
}

// made by al with love
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const validKondisi = ["BAIK", "RUSAK_RINGAN", "RUSAK_BERAT"];

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

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = (await req.json()) as { rows: ImportRow[] };
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "File kosong atau format tidak dikenali." }, { status: 400 });
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: "Maksimal 500 baris per import." }, { status: 400 });
  }

  // Setiap aset yang diimpor otomatis menjadi milik unit akun yang mengunggah,
  // konsisten dengan aturan penambahan aset manual.
  const unit = await prisma.unit.findUnique({ where: { id: session.unitId } });
  if (!unit) return NextResponse.json({ error: "Unit tidak ditemukan." }, { status: 400 });

  // Cari nomor urut kode terakhir untuk unit ini, untuk auto-generate kode yang kosong.
  const existingCount = await prisma.asset.count({ where: { unitId: unit.id } });
  let nextSeq = existingCount + 1;

  function generateKode() {
    const kode = `AST-${unit!.name}-${String(nextSeq).padStart(4, "0")}`;
    nextSeq += 1;
    return kode;
  }

  let created = 0;
  const skipped: { row: number; alasan: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNum = i + 2; // baris 1 = header di Excel

    const nama = (r.nama || "").trim();
    const kategori = (r.kategori || "").trim();
    const lokasi = (r.lokasi || "").trim();

    if (!nama || !kategori || !lokasi) {
      skipped.push({ row: rowNum, alasan: "Nama/Kategori/Lokasi kosong" });
      continue;
    }

    let kondisi = (r.kondisi || "BAIK").trim().toUpperCase();
    if (!validKondisi.includes(kondisi)) {
      skipped.push({ row: rowNum, alasan: `Kondisi "${r.kondisi}" tidak valid` });
      continue;
    }

    let jumlah = Number(r.jumlah);
    if (!r.jumlah || isNaN(jumlah) || jumlah < 1) jumlah = 1;

    let kode = (r.kode || "").trim();
    if (!kode) kode = generateKode();

    const tahunPengadaan = r.tahunPengadaan ? Number(r.tahunPengadaan) : undefined;
    const hargaBeli = r.hargaBeli ? Number(r.hargaBeli) : undefined;
    const hargaJual = r.hargaJual ? Number(r.hargaJual) : undefined;
    const masaManfaat = r.masaManfaat ? Number(r.masaManfaat) : undefined;

    try {
      await prisma.asset.create({
        data: {
          kode,
          nama,
          kategori,
          kondisi,
          lokasi,
          unitId: unit.id,
          jumlah,
          tahunPengadaan: tahunPengadaan && !isNaN(tahunPengadaan) ? tahunPengadaan : undefined,
          hargaBeli: hargaBeli && !isNaN(hargaBeli) ? hargaBeli : undefined,
          hargaJual: hargaJual && !isNaN(hargaJual) ? hargaJual : undefined,
          masaManfaat: masaManfaat && !isNaN(masaManfaat) ? masaManfaat : undefined,
          keterangan: (r.keterangan || "").trim() || undefined,
        },
      });
      created += 1;
    } catch (e: any) {
      if (e.code === "P2002") {
        skipped.push({ row: rowNum, alasan: `Kode "${kode}" sudah digunakan` });
      } else {
        skipped.push({ row: rowNum, alasan: "Gagal menyimpan" });
      }
    }
  }

  return NextResponse.json({ created, skipped });
}

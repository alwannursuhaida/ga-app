// made by al with love
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assets = await prisma.asset.findMany({
    where: session.role === "STAFF" ? { unitId: session.unitId } : {},
    include: { unit: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(assets);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  let {
    kode,
    nama,
    kategori,
    kondisi,
    lokasi,
    unitId,
    jumlah,
    keterangan,
    tahunPengadaan,
    hargaBeli,
    hargaJual,
    masaManfaat,
  } = body;

  // STAFF hanya bisa menambah aset atas nama unitnya sendiri — kepemilikan
  // otomatis mengikuti unit staff yang login, tidak bisa dipilih/dititip ke unit lain.
  if (session.role === "STAFF") {
    unitId = session.unitId;
  }

  if (!kode || !nama || !kategori || !lokasi || !unitId) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }

  try {
    const created = await prisma.asset.create({
      data: {
        kode,
        nama,
        kategori,
        kondisi: kondisi || "BAIK",
        lokasi,
        unitId,
        jumlah: jumlah ? Number(jumlah) : 1,
        keterangan,
        tahunPengadaan: tahunPengadaan ? Number(tahunPengadaan) : undefined,
        hargaBeli: hargaBeli ? Number(hargaBeli) : undefined,
        hargaJual: hargaJual ? Number(hargaJual) : undefined,
        masaManfaat: masaManfaat ? Number(masaManfaat) : undefined,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ error: "Kode aset sudah digunakan." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal menyimpan aset." }, { status: 500 });
  }
}

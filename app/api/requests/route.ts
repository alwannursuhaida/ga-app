// made by al with love
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { saveBase64Image } from "@/lib/uploads";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type") || undefined;

  const requests = await prisma.request.findMany({
    where: {
      type: type as any,
      // STAFF melihat: request unitnya sendiri, ATAU (khusus peminjaman)
      // request atas aset yang dimiliki unitnya — supaya bisa diproses.
      ...(session.role === "STAFF"
        ? {
            OR: [
              { unitId: session.unitId },
              { asset: { unitId: session.unitId } },
            ],
          }
        : {}),
    },
    include: { user: true, unit: true, asset: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, title, description, assetId, tanggalMulai, tanggalSelesai, lokasiPerbaikan, fotoSebelum, tingkatKerusakan, urgensi } = body;

  if (!type) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }

  let requestTitle = title;
  let requestDescription = description;

  if (type === "PEMINJAMAN") {
    if (!assetId || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json({ error: "Data peminjaman tidak lengkap." }, { status: 400 });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { unit: true },
    });

    if (!asset) {
      return NextResponse.json({ error: "Barang tidak ditemukan." }, { status: 404 });
    }

    requestTitle = asset.nama;
    requestDescription = description || `Peminjaman ${asset.nama} milik ${asset.unit.label}.`;
  }

  const showLokasiFoto = type === "PERBAIKAN" || type === "PENGAJUAN_SARANA";

  if (showLokasiFoto && !lokasiPerbaikan) {
    return NextResponse.json({ error: "Lokasi wajib diisi." }, { status: 400 });
  }

  if (!requestTitle || !requestDescription) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }

  let fotoSebelumPath: string | undefined;
  if (showLokasiFoto && fotoSebelum) {
    try {
      fotoSebelumPath = await saveBase64Image(fotoSebelum, "uploads/perbaikan", "sebelum");
    } catch {
      return NextResponse.json({ error: "Gagal menyimpan foto." }, { status: 400 });
    }
  }

  const created = await prisma.request.create({
    data: {
      type,
      title: requestTitle,
      description: requestDescription,
      assetId: assetId || undefined,
      lokasiPerbaikan: showLokasiFoto ? lokasiPerbaikan : undefined,
      tingkatKerusakan: type === "PERBAIKAN" ? tingkatKerusakan || "RINGAN" : undefined,
      urgensi: type === "PERBAIKAN" ? urgensi || "DAPAT_MENUNGGU" : undefined,
      fotoSebelum: fotoSebelumPath,
      tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : undefined,
      tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : undefined,
      userId: session.userId,
      unitId: session.unitId,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

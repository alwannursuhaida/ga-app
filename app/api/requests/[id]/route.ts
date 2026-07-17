// made by al with love
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { saveBase64Image } from "@/lib/uploads";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.request.findUnique({
    where: { id: params.id },
    include: { asset: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
  }

  // Yang berwenang memproses pengajuan:
  // 1. GA — berwenang atas semua jenis pengajuan (oversight penuh)
  // 2. Untuk PEMINJAMAN: staff dari unit PEMILIK barang yang dipinjam
  //    (mis. barang milik SMP dipinjam Staff SD -> Staff SMP yang approve/edit/tolak)
  const isGA = session.role === "GA";
  const isAssetOwner =
    session.role === "STAFF" &&
    existing.assetId !== null &&
    existing.asset?.unitId === session.unitId;

  if (!isGA && !isAssetOwner) {
    return NextResponse.json(
      { error: "Anda tidak berwenang memproses data ini." },
      { status: 403 }
    );
  }

  const { status, catatanGA, tanggalMulai, tanggalSelesai, tenggatWaktu, fotoSesudah } =
    await req.json();

  const validStatuses = ["DIAJUKAN", "DIPROSES", "SELESAI", "DITOLAK"];
  if (status !== undefined && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
  }

  if (
    status === "DIPROSES" &&
    existing.type === "PERBAIKAN" &&
    !tenggatWaktu &&
    !existing.tenggatWaktu
  ) {
    return NextResponse.json(
      { error: "Tenggat waktu wajib diisi saat status diubah menjadi Diproses." },
      { status: 400 }
    );
  }

  let fotoSesudahPath: string | undefined;
  if (fotoSesudah) {
    try {
      fotoSesudahPath = await saveBase64Image(fotoSesudah, "uploads/perbaikan", "sesudah");
    } catch {
      return NextResponse.json({ error: "Gagal menyimpan foto." }, { status: 400 });
    }
  }

  const updated = await prisma.request.update({
    where: { id: params.id },
    data: {
      ...(status !== undefined && { status }),
      ...(catatanGA !== undefined && { catatanGA }),
      ...(tenggatWaktu !== undefined && {
        tenggatWaktu: tenggatWaktu ? new Date(tenggatWaktu) : null,
      }),
      ...(fotoSesudahPath && { fotoSesudah: fotoSesudahPath }),
      ...(tanggalMulai !== undefined && {
        tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null,
      }),
      ...(tanggalSelesai !== undefined && {
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
      }),
    },
  });

  return NextResponse.json(updated);
}

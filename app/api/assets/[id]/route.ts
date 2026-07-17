// made by al with love
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.asset.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Aset tidak ditemukan." }, { status: 404 });
  }

  const isGA = session.role === "GA";
  const isOwner = session.role === "STAFF" && existing.unitId === session.unitId;

  if (!isGA && !isOwner) {
    return NextResponse.json(
      { error: "Anda hanya dapat mengubah aset milik unit Anda sendiri." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const {
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

  // STAFF (pemilik) tidak boleh memindahkan kepemilikan aset ke unit lain —
  // hanya GA yang berwenang mengubah unitId (mis. saat mutasi barang antar unit).
  const data: Record<string, unknown> = {
    ...(kode !== undefined && { kode }),
    ...(nama !== undefined && { nama }),
    ...(kategori !== undefined && { kategori }),
    ...(kondisi !== undefined && { kondisi }),
    ...(lokasi !== undefined && { lokasi }),
    ...(jumlah !== undefined && { jumlah: Number(jumlah) }),
    ...(keterangan !== undefined && { keterangan }),
    ...(tahunPengadaan !== undefined && { tahunPengadaan: Number(tahunPengadaan) }),
    ...(hargaBeli !== undefined && { hargaBeli: Number(hargaBeli) }),
    ...(hargaJual !== undefined && { hargaJual: Number(hargaJual) }),
    ...(masaManfaat !== undefined && { masaManfaat: Number(masaManfaat) }),
  };
  if (isGA && unitId !== undefined) {
    data.unitId = unitId;
  }

  const updated = await prisma.asset.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "GA") {
    return NextResponse.json({ error: "Hanya GA yang dapat menghapus aset." }, { status: 403 });
  }

  await prisma.asset.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

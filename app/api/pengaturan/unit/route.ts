// made by al with love
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "GA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const units = await prisma.unit.findMany({ orderBy: { label: "asc" } });
  return NextResponse.json(units);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "GA") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { unitId, namaPenanggungJawab, namaKepalaSekolah } = await req.json();
  if (!unitId) {
    return NextResponse.json({ error: "unitId wajib diisi." }, { status: 400 });
  }

  const updated = await prisma.unit.update({
    where: { id: unitId },
    data: {
      ...(namaPenanggungJawab !== undefined && { namaPenanggungJawab: namaPenanggungJawab || null }),
      ...(namaKepalaSekolah !== undefined && { namaKepalaSekolah: namaKepalaSekolah || null }),
    },
  });

  return NextResponse.json(updated);
}

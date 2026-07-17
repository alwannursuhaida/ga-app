// made by al with love
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateDokumenPerbaikan } from "@/lib/generateDokumenPerbaikan";
import { savePdfFile } from "@/lib/uploads";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB — cukup untuk hasil scan wajar

// GET -> download dokumen Word (identitas terisi otomatis dari data sistem)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const request = await prisma.request.findUnique({
    where: { id: params.id },
    include: { unit: true },
  });

  if (!request || request.type !== "PERBAIKAN") {
    return NextResponse.json({ error: "Pengajuan tidak ditemukan." }, { status: 404 });
  }

  if (session.role === "STAFF" && request.unitId !== session.unitId) {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 403 });
  }

  try {
    const buffer = generateDokumenPerbaikan(request);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Permintaan-Perbaikan-${request.id}.docx"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Gagal membuat dokumen." }, { status: 500 });
  }
}

// POST -> upload dokumen PDF hasil tanda tangan
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const request = await prisma.request.findUnique({ where: { id: params.id } });
  if (!request || request.type !== "PERBAIKAN") {
    return NextResponse.json({ error: "Pengajuan tidak ditemukan." }, { status: 404 });
  }
  if (session.role === "STAFF" && request.unitId !== session.unitId) {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Tidak ada file yang diunggah." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File harus berformat PDF." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Ukuran file terlalu besar (maks 8MB)." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await savePdfFile(buffer, "dokumen", `perbaikan-${request.id}`);

  const updated = await prisma.request.update({
    where: { id: params.id },
    data: { dokumenUrl: url },
  });

  return NextResponse.json(updated);
}

// DELETE -> hapus dokumen yang sudah diunggah (misal salah upload)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const request = await prisma.request.findUnique({ where: { id: params.id } });
  if (!request) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
  if (session.role === "STAFF" && request.unitId !== session.unitId) {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 403 });
  }

  const updated = await prisma.request.update({
    where: { id: params.id },
    data: { dokumenUrl: null },
  });
  return NextResponse.json(updated);
}

// made by al with love
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan kata sandi wajib diisi." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { unit: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Email atau kata sandi salah." }, { status: 401 });
  }

  if (user.role !== "GA" && user.role !== "STAFF") {
    return NextResponse.json({ error: "Role pengguna tidak valid." }, { status: 500 });
  }

  await createSessionCookie({
    userId: user.id,
    name: user.name,
    role: user.role,
    unitId: user.unitId,
    unitLabel: user.unit.label,
  });

  return NextResponse.json({ ok: true });
}

// made by al with love
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const UnitName = {
  YAYASAN: "YAYASAN",
  PAUD: "PAUD",
  SD: "SD",
  SMP: "SMP",
  SMA: "SMA",
} as const;

const Role = {
  GA: "GA",
  STAFF: "STAFF",
} as const;

const AssetCondition = {
  BAIK: "BAIK",
} as const;

async function main() {
  const units = [
    { name: UnitName.YAYASAN, label: "Yayasan" },
    { name: UnitName.PAUD, label: "PAUD Albanna" },
    { name: UnitName.SD, label: "SD Albanna" },
    { name: UnitName.SMP, label: "SMP Albanna" },
    { name: UnitName.SMA, label: "SMA Albanna" },
  ];

  const createdUnits: Record<string, string> = {};
  for (const u of units) {
    const unit = await prisma.unit.upsert({
      where: { name: u.name },
      update: { label: u.label },
      create: u,
    });
    createdUnits[u.name] = unit.id;
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "ga@albanna.sch.id" },
    update: { name: "General Affair", role: Role.GA, unitId: createdUnits[UnitName.YAYASAN] },
    create: {
      name: "General Affair",
      email: "ga@albanna.sch.id",
      passwordHash,
      role: Role.GA,
      unitId: createdUnits[UnitName.YAYASAN],
    },
  });

  await prisma.user.upsert({
    where: { email: "staff.smp@albanna.sch.id" },
    update: { name: "Staff SMP", role: Role.STAFF, unitId: createdUnits[UnitName.SMP] },
    create: {
      name: "Staff SMP",
      email: "staff.smp@albanna.sch.id",
      passwordHash,
      role: Role.STAFF,
      unitId: createdUnits[UnitName.SMP],
    },
  });

  await prisma.user.upsert({
    where: { email: "staff.paud@albanna.sch.id" },
    update: { name: "Staff PAUD", role: Role.STAFF, unitId: createdUnits[UnitName.PAUD] },
    create: {
      name: "Staff PAUD",
      email: "staff.paud@albanna.sch.id",
      passwordHash,
      role: Role.STAFF,
      unitId: createdUnits[UnitName.PAUD],
    },
  });

  await prisma.user.upsert({
    where: { email: "staff.sd@albanna.sch.id" },
    update: { name: "Staff SD", role: Role.STAFF, unitId: createdUnits[UnitName.SD] },
    create: {
      name: "Staff SD",
      email: "staff.sd@albanna.sch.id",
      passwordHash,
      role: Role.STAFF,
      unitId: createdUnits[UnitName.SD],
    },
  });

  await prisma.user.upsert({
    where: { email: "staff.sma@albanna.sch.id" },
    update: { name: "Staff SMA", role: Role.STAFF, unitId: createdUnits[UnitName.SMA] },
    create: {
      name: "Staff SMA",
      email: "staff.sma@albanna.sch.id",
      passwordHash,
      role: Role.STAFF,
      unitId: createdUnits[UnitName.SMA],
    },
  });

  await prisma.asset.upsert({
    where: { kode: "AST-SMP-0001" },
    update: {},
    create: {
      kode: "AST-SMP-0001",
      nama: "Proyektor Epson EB-X05",
      kategori: "Elektronik",
      kondisi: AssetCondition.BAIK,
      lokasi: "Ruang Kelas 7A",
      unitId: createdUnits[UnitName.SMP],
      jumlah: 1,
    },
  });

  console.log("Seed selesai. Semua akun pakai password: password123");
  console.log("- GA         : ga@albanna.sch.id");
  console.log("- Staff PAUD : staff.paud@albanna.sch.id");
  console.log("- Staff SD   : staff.sd@albanna.sch.id");
  console.log("- Staff SMP  : staff.smp@albanna.sch.id");
  console.log("- Staff SMA  : staff.sma@albanna.sch.id");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

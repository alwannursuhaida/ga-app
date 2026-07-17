import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import PengaturanUnitForm from "@/components/PengaturanUnitForm";

// made by al with love
export default async function PengaturanPage() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "GA") redirect("/dashboard");

  const units = await prisma.unit.findMany({ orderBy: { label: "asc" } });

  return (
    <div>
      <PageHeader
        eyebrow="MODUL 06"
        title="Pengaturan"
        subtitle="Nama-nama ini dipakai untuk mengisi otomatis dokumen Permintaan Perbaikan."
      />
      <PengaturanUnitForm units={units} />
    </div>
  );
}

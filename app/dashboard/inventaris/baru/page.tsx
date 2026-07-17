import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import AssetForm from "@/components/AssetForm";

// made by al with love
export default async function BaruInventarisPage() {
  const session = await getSession();
  if (!session) return null;

  const units = await prisma.unit.findMany({ orderBy: { label: "asc" } });

  return (
    <div>
      <PageHeader
        eyebrow="MODUL 04"
        title="Tambah Aset"
        subtitle={
          session.role === "STAFF"
            ? `Aset yang ditambahkan otomatis menjadi milik ${session.unitLabel}.`
            : undefined
        }
      />
      <AssetForm
        units={units.map((u) => ({ id: u.id, label: u.label }))}
        lockedUnit={
          session.role === "STAFF" ? { id: session.unitId, label: session.unitLabel } : undefined
        }
      />
    </div>
  );
}

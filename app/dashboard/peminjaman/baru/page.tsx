import PageHeader from "@/components/PageHeader";
import RequestForm from "@/components/RequestForm";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// made by al with love
export default async function BaruPeminjamanPage() {
  const session = await getSession();
  if (!session) return null;

  const units = await prisma.unit.findMany({
    include: {
      assets: {
        where: { kondisi: { not: "RUSAK_BERAT" } },
        orderBy: { nama: "asc" },
      },
    },
    orderBy: { label: "asc" },
  });

  return (
    <div>
      <PageHeader eyebrow="MODUL 03" title="Ajukan Peminjaman Sarpra" />
      <RequestForm
        type="PEMINJAMAN"
        backHref="/dashboard/peminjaman"
        showDates
        loanUnits={units.map((u) => ({
          id: u.id,
          name: u.name,
          label: u.label,
          assets: u.assets.map((a) => ({
            id: a.id,
            kode: a.kode,
            nama: a.nama,
            lokasi: a.lokasi,
          })),
        }))}
      />
    </div>
  );
}

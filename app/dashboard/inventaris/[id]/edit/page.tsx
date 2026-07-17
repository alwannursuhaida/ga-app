import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import AssetForm from "@/components/AssetForm";

// made by al with love
export default async function EditAsetPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return null;

  const asset = await prisma.asset.findUnique({ where: { id: params.id } });
  if (!asset) notFound();

  const isOwner = session.role === "STAFF" && asset.unitId === session.unitId;
  if (session.role !== "GA" && !isOwner) redirect("/dashboard/inventaris");

  const units = await prisma.unit.findMany({ orderBy: { label: "asc" } });

  return (
    <div>
      <PageHeader eyebrow="MODUL 04" title={`Edit Aset — ${asset.kode}`} />
      <AssetForm
        units={units.map((u) => ({ id: u.id, label: u.label }))}
        lockedUnit={session.role === "STAFF" ? { id: session.unitId, label: session.unitLabel } : undefined}
        mode="edit"
        assetId={asset.id}
        initial={{
          kode: asset.kode,
          nama: asset.nama,
          kategori: asset.kategori,
          kondisi: asset.kondisi,
          lokasi: asset.lokasi,
          unitId: asset.unitId,
          jumlah: asset.jumlah,
          keterangan: asset.keterangan,
          tahunPengadaan: asset.tahunPengadaan,
          hargaBeli: asset.hargaBeli,
          hargaJual: asset.hargaJual,
          masaManfaat: asset.masaManfaat,
        }}
      />
    </div>
  );
}

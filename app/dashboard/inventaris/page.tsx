import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import { ConditionBadge } from "@/components/StatusBadge";
import ImportExcelButton from "@/components/ImportExcelButton";
import InventarisFilter from "@/components/InventarisFilter";
import { formatRupiah, hitungPenyusutan } from "@/lib/labels";

// made by al with love
export default async function InventarisPage({
  searchParams,
}: {
  searchParams: {
    nama?: string;
    kode?: string;
    kategori?: string;
    kondisi?: string;
    lokasi?: string;
    unitId?: string;
  };
}) {
  const session = await getSession();
  if (!session) return null;

  const where: Record<string, unknown> =
    session.role === "STAFF" ? { unitId: session.unitId } : {};

  if (searchParams.nama) where.nama = { contains: searchParams.nama };
  if (searchParams.kode) where.kode = { contains: searchParams.kode };
  if (searchParams.kategori) where.kategori = { contains: searchParams.kategori };
  if (searchParams.lokasi) where.lokasi = { contains: searchParams.lokasi };
  if (searchParams.kondisi) where.kondisi = searchParams.kondisi;
  if (searchParams.unitId && session.role === "GA") where.unitId = searchParams.unitId;

  const [assets, units] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: { unit: true },
      orderBy: { createdAt: "desc" },
    }),
    session.role === "GA" ? prisma.unit.findMany({ orderBy: { label: "asc" } }) : Promise.resolve([]),
  ]);

  return (
    <div className="relative">
      <PageHeader
        eyebrow="MODUL 04"
        title="Inventarisir Barang"
        subtitle={
          session.role === "STAFF"
            ? `Menampilkan aset milik ${session.unitLabel}.`
            : "Menampilkan aset seluruh unit."
        }
        action={{ href: "/dashboard/inventaris/baru", label: "+ Tambah Aset" }}
        extra={<ImportExcelButton />}
      />

      <Suspense fallback={null}>
        <InventarisFilter
          units={units.map((u) => ({ id: u.id, label: u.label }))}
          showUnitFilter={session.role === "GA"}
        />
      </Suspense>

      {assets.length === 0 ? (
        <p className="rounded-md border border-line bg-paper px-5 py-10 text-center text-sm text-ink/40">
          Belum ada aset yang cocok dengan filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => {
            const canEdit = session.role === "GA" || a.unitId === session.unitId;
            const penyusutan = hitungPenyusutan(a.hargaBeli, a.hargaJual, a.masaManfaat);
            return (
              <div
                key={a.id}
                className="rounded-md border border-dashed border-line bg-paper p-4"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] text-deep">{a.kode}</span>
                  <ConditionBadge condition={a.kondisi} />
                </div>
                <p className="mt-2 font-display text-sm font-semibold text-ink">{a.nama}</p>
                <p className="mt-1 text-xs text-ink/50">
                  {a.kategori} · Jumlah: {a.jumlah}
                  {a.tahunPengadaan ? ` · Th. ${a.tahunPengadaan}` : ""}
                </p>
                <div className="mt-3 border-t border-line/70 pt-2 text-xs text-ink/60">
                  <p>{a.unit.label}</p>
                  <p className="text-ink/40">{a.lokasi}</p>
                </div>
                {(a.hargaBeli || a.hargaJual || a.masaManfaat) && (
                  <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-line/70 pt-2 text-[11px] text-ink/60">
                    <p>Harga Beli: <span className="text-ink">{formatRupiah(a.hargaBeli)}</span></p>
                    <p>Harga Jual: <span className="text-ink">{formatRupiah(a.hargaJual)}</span></p>
                    <p>Masa Manfaat: <span className="text-ink">{a.masaManfaat ? `${a.masaManfaat} th` : "-"}</span></p>
                    <p>Penyusutan/th: <span className="text-ink">{formatRupiah(penyusutan)}</span></p>
                  </div>
                )}
                {a.keterangan && (
                  <p className="mt-2 text-xs italic text-ink/40">{a.keterangan}</p>
                )}
                {canEdit && (
                  <Link
                    href={`/dashboard/inventaris/${a.id}/edit`}
                    className="mt-3 inline-block text-xs text-deep underline"
                  >
                    Edit
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

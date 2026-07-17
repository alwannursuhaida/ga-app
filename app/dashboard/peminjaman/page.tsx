import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import RequestActions from "@/components/RequestActions";
import { formatDate } from "@/lib/labels";

// made by al with love
export default async function PeminjamanPage() {
  const session = await getSession();
  if (!session) return null;

  const requests = await prisma.request.findMany({
    where: {
      type: "PEMINJAMAN",
      ...(session.role === "STAFF"
        ? {
            OR: [
              { unitId: session.unitId },
              { asset: { unitId: session.unitId } },
            ],
          }
        : {}),
    },
    include: { user: true, unit: true, asset: { include: { unit: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="MODUL 03"
        title="Peminjaman Sarpra"
        action={{ href: "/dashboard/peminjaman/baru", label: "+ Ajukan Peminjaman" }}
      />

      <div className="overflow-hidden rounded-md border border-line bg-paper">
        {requests.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink/40">
            Belum ada permohonan peminjaman.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-sand/50 text-left text-xs text-ink/50">
                <th className="px-5 py-3 font-medium">Barang</th>
                <th className="px-5 py-3 font-medium">Unit / Pengaju</th>
                <th className="px-5 py-3 font-medium">Periode Pinjam</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const canProcess =
                  session.role === "GA" || r.asset?.unitId === session.unitId;
                return (
                  <tr key={r.id} className="border-b border-line/60 last:border-0 align-top">
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{r.title}</p>
                      <p className="mt-1 max-w-md text-xs text-ink/60">
                        Milik: {r.asset?.unit.label || "-"}
                        {r.asset ? ` · ${r.asset.kode} · ${r.asset.lokasi}` : ""}
                      </p>
                      {r.catatanGA && (
                        <p className="mt-1 text-xs italic text-amber">Catatan: {r.catatanGA}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-ink/60">
                      {r.unit.label}
                      <br />
                      {r.user.name}
                    </td>
                    <td className="px-5 py-4 text-xs text-ink/50">
                      {formatDate(r.tanggalMulai)} — {formatDate(r.tanggalSelesai)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-4">
                      {canProcess ? (
                        <RequestActions
                          id={r.id}
                          currentStatus={r.status}
                          currentCatatan={r.catatanGA}
                          editableDates
                          currentTanggalMulai={r.tanggalMulai}
                          currentTanggalSelesai={r.tanggalSelesai}
                        />
                      ) : (
                        <span className="text-xs text-ink/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

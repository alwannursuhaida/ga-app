import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import RequestActions from "@/components/RequestActions";
import { formatDate } from "@/lib/labels";

// made by al with love
export default async function PengadaanSarpraPage() {
  const session = await getSession();
  if (!session) return null;

  const requests = await prisma.request.findMany({
    where: {
      type: "PENGAJUAN_SARANA",
      ...(session.role === "STAFF" ? { unitId: session.unitId } : {}),
    },
    include: { user: true, unit: true, asset: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        eyebrow="MODUL 02"
        title="Pengadaan Sarpra"
        action={{ href: "/dashboard/pengadaan-sarpra/baru", label: "+ Ajukan Pengadaan" }}
      />

      <div className="overflow-hidden rounded-md border border-line bg-paper">
        {requests.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink/40">
            Belum ada pengadaan sarpra.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-sand/50 text-left text-xs text-ink/50">
                <th className="px-5 py-3 font-medium">Judul</th>
                <th className="px-5 py-3 font-medium">Unit / Pengaju</th>
                <th className="px-5 py-3 font-medium">Tanggal</th>
                <th className="px-5 py-3 font-medium">Status</th>
                {session.role === "GA" && <th className="px-5 py-3 font-medium">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-line/60 last:border-0 align-top">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{r.title}</p>
                    <p className="mt-1 max-w-md text-xs text-ink/60">{r.description}</p>
                    {r.lokasiPerbaikan && (
                      <p className="mt-1 text-xs text-ink/50">Lokasi: {r.lokasiPerbaikan}</p>
                    )}
                    {r.fotoSebelum && (
                      <a href={r.fotoSebelum} target="_blank" rel="noreferrer">
                        <img
                          src={r.fotoSebelum}
                          alt="Foto pendukung"
                          className="mt-2 h-14 w-14 rounded-sm border border-line object-cover"
                        />
                      </a>
                    )}
                    {r.catatanGA && (
                      <p className="mt-1 text-xs italic text-amber">Catatan GA: {r.catatanGA}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-ink/60">
                    {r.unit.label}
                    <br />
                    {r.user.name}
                  </td>
                  <td className="px-5 py-4 text-xs text-ink/50">{formatDate(r.createdAt)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  {session.role === "GA" && (
                    <td className="px-5 py-4">
                      <RequestActions
                        id={r.id}
                        currentStatus={r.status}
                        currentCatatan={r.catatanGA}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

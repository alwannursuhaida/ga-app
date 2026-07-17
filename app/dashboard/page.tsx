import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { requestTypeLabel, formatDate } from "@/lib/labels";
import Link from "next/link";
import SopModal from "@/components/SopModal";

// made by al with love
export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const scope =
    session.role === "STAFF"
      ? {
          OR: [
            { unitId: session.unitId },
            { asset: { unitId: session.unitId } },
          ],
        }
      : {};

  const [diajukan, diproses, selesai, totalAset, recent] = await Promise.all([
    prisma.request.count({ where: { ...scope, status: "DIAJUKAN" } }),
    prisma.request.count({ where: { ...scope, status: "DIPROSES" } }),
    prisma.request.count({ where: { ...scope, status: "SELESAI" } }),
    prisma.asset.count({ where: session.role === "STAFF" ? { unitId: session.unitId } : {} }),
    prisma.request.findMany({
      where: scope,
      include: { user: true, unit: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const stats = [
    { label: "Menunggu Diproses", value: diajukan, tag: "01" },
    { label: "Sedang Diproses", value: diproses, tag: "02" },
    { label: "Selesai", value: selesai, tag: "03" },
    { label: "Total Aset Tercatat", value: totalAset, tag: "04" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="DASHBOARD"
        title={`Halo, ${session.name.split(" ")[0]}`}
        extra={<SopModal />}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-md border border-line bg-paper p-4">
            <p className="font-mono text-[10px] text-ink/40">{s.tag}</p>
            <p className="font-display mt-2 text-3xl font-semibold text-deep">{s.value}</p>
            <p className="mt-1 text-xs text-ink/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-line bg-paper">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-sm font-medium text-ink">Aktivitas Terbaru</h2>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink/40">
            Belum ada aktivitas.
          </p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-b border-line/60 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{r.title}</p>
                    <p className="font-mono text-[11px] text-ink/40">
                      {requestTypeLabel[r.type]} · {r.unit.label} · {r.user.name}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-ink/50">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

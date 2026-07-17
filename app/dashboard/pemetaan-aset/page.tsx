import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import { ConditionBadge } from "@/components/StatusBadge";

// made by al with love
export default async function PemetaanAsetPage() {
  const session = await getSession();
  if (!session) return null;

  const units = await prisma.unit.findMany({
    where: session.role === "STAFF" ? { id: session.unitId } : {},
    include: { assets: { orderBy: { lokasi: "asc" } } },
    orderBy: { label: "asc" },
  });

  return (
    <div>
      <PageHeader eyebrow="MODUL 05" title="Pemetaan Aset" />

      <div className="flex flex-col gap-6">
        {units.map((unit) => {
          const byLokasi = unit.assets.reduce<Record<string, typeof unit.assets>>((acc, a) => {
            acc[a.lokasi] = acc[a.lokasi] || [];
            acc[a.lokasi].push(a);
            return acc;
          }, {});
          const lokasiList = Object.keys(byLokasi);

          return (
            <div key={unit.id} className="rounded-md border border-line bg-paper">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <h2 className="font-display text-sm font-semibold text-ink">{unit.label}</h2>
                <span className="font-mono text-[11px] text-ink/40">
                  {unit.assets.length} aset · {lokasiList.length} lokasi
                </span>
              </div>

              {lokasiList.length === 0 ? (
                <p className="px-5 py-6 text-center text-xs text-ink/40">
                  Belum ada aset tercatat di unit ini.
                </p>
              ) : (
                <div className="divide-y divide-line/60">
                  {lokasiList.map((lokasi) => (
                    <div key={lokasi} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      <span className="w-40 shrink-0 text-xs font-medium text-ink/70">
                        {lokasi}
                      </span>
                      <div className="flex flex-1 flex-wrap gap-2">
                        {byLokasi[lokasi].map((a) => (
                          <span
                            key={a.id}
                            className="flex items-center gap-2 rounded-sm border border-dashed border-line px-2 py-1"
                          >
                            <span className="font-mono text-[10px] text-deep">{a.kode}</span>
                            <span className="text-xs text-ink/70">{a.nama}</span>
                            <ConditionBadge condition={a.kondisi} />
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

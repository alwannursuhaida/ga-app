"use client";
// made by al with love
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menu = [
  { href: "/dashboard", label: "Dashboard", tag: "00" },
  { href: "/dashboard/perbaikan", label: "Perbaikan Sarpra", tag: "01" },
  { href: "/dashboard/pengadaan-sarpra", label: "Pengadaan Sarpra", tag: "02" },
  { href: "/dashboard/peminjaman", label: "Peminjaman Sarpra", tag: "03" },
  { href: "/dashboard/inventaris", label: "Inventarisir Barang", tag: "04" },
  { href: "/dashboard/pemetaan-aset", label: "Pemetaan Aset", tag: "05" },
];

const menuGA = [
  { href: "/dashboard/pengaturan", label: "Pengaturan", tag: "06" },
];

export default function Sidebar({
  name,
  role,
  unitLabel,
}: {
  name: string;
  role: string;
  unitLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between bg-deep text-sand">
      <div>
        <div className="flex items-center gap-3 border-b border-sand/10 px-6 py-6">
          <img
            src="/logo.png"
            alt="Logo Yayasan"
            className="h-11 w-11 shrink-0 rounded-full bg-sand/10 object-cover ring-1 ring-sand/20"
          />
          <div>
            <p className="font-display text-lg font-semibold leading-tight">
              GA · Albanna
            </p>
            <p className="mt-1 text-xs text-sand/60">Sarana &amp; Prasarana Yayasan</p>
          </div>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {[...menu, ...(role === "GA" ? menuGA : [])].map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sand/10 text-sand"
                    : "text-sand/60 hover:bg-sand/5 hover:text-sand"
                }`}
              >
                <span className="font-mono text-[10px] text-sand/40">{item.tag}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-sand/10 px-6 py-5">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-sand/50">
          {role === "GA" ? "General Affair" : "Staff Unit"} · {unitLabel}
        </p>
        <button
          onClick={logout}
          className="mt-3 text-xs text-sand/50 underline decoration-sand/30 underline-offset-2 hover:text-sand"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}

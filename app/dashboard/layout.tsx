import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Watermark from "@/components/Watermark";

// made by al with love
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-sand">
      <Sidebar name={session.name} role={session.role} unitLabel={session.unitLabel} />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 px-8 py-8">{children}</main>
        <Watermark />
      </div>
    </div>
  );
}

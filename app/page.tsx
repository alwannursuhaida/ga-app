import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

// made by al with love
export default async function Home() {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
}

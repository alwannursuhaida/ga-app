"use client";
// made by al with love
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Watermark from "@/components/Watermark";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Gagal masuk.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-sand bg-dot-grid">
      {/* Panel foto Kepala Divisi — disembunyikan di layar sempit (mobile) */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="relative mt-6 h-[calc(100vh-1.5rem)] overflow-hidden">
          <div className="animate-fadeSlideIn relative h-full w-full">
            <Image
              src="/kadiv.png"
              alt="Kepala Divisi General Affair"
              fill
              priority
              className="object-contain object-bottom"
            />
          </div>
          {/* caption diposisikan menempel di badan foto (area yang ditandai) */}
          {/* left/top ini perkiraan — geser angkanya kalau perlu sedikit disesuaikan */}
          <div className="absolute left-[60%] top-[76%] -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-2xl bg-deep px-5 py-3 text-center shadow-md">
              <p className="font-display text-base font-semibold text-white">
                Nur Kholish, S.Pd.
              </p>
              <p className="mt-0.5 text-xs text-white/80">Kepala Divisi General Affair</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form login */}
      <div className="flex w-full flex-col justify-between lg:w-1/2">
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="mb-8 border-l-2 border-deep pl-4">
              <p className="font-mono text-[11px] tracking-widest text-ink/50">
                SARANA &amp; PRASARANA
              </p>
              <h1 className="font-display text-2xl font-semibold text-ink">
                GA Yayasan Albanna
              </h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-md border border-line bg-paper p-6 shadow-sm"
            >
              <label className="mb-1 block text-xs font-medium text-ink/70">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
                placeholder="nama@albanna.sch.id"
              />

              <label className="mb-1 block text-xs font-medium text-ink/70">Kata Sandi</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-deep"
                placeholder="••••••••"
              />

              {error && (
                <p className="mb-4 rounded-sm bg-rust/10 px-3 py-2 text-xs text-rust">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-sm bg-deep py-2 text-sm font-medium text-sand transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-ink/40">
              Akun dibuat oleh General Affair.
            </p>
          </div>
        </div>
        <Watermark />
      </div>
    </div>
  );
}

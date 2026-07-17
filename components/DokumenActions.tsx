"use client";
// made by al with love
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function DokumenActions({
  requestId,
  currentDokumenUrl,
}: {
  requestId: string;
  currentDokumenUrl?: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/requests/${requestId}/dokumen`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error || "Gagal mengunggah dokumen.");
      return;
    }
    router.refresh();
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete() {
    if (!confirm("Hapus dokumen yang sudah diunggah?")) return;
    await fetch(`/api/requests/${requestId}/dokumen`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <a
        href={`/api/requests/${requestId}/dokumen`}
        className="rounded-sm border border-line px-2 py-1 text-center text-xs text-ink/70 hover:bg-sand"
      >
        Download
      </a>

      {currentDokumenUrl ? (
        <div className="flex items-center gap-1">
          <a
            href={currentDokumenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-sm border border-moss/40 bg-moss/10 px-2 py-1 text-center text-xs text-moss hover:bg-moss/20"
          >
            Lihat PDF
          </a>
          <button
            onClick={handleDelete}
            title="Hapus dokumen"
            className="rounded-sm border border-line px-1.5 py-1 text-xs text-ink/40 hover:bg-sand"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="cursor-pointer rounded-sm border border-dashed border-line px-2 py-1 text-center text-xs text-ink/60 hover:bg-sand">
          {uploading ? "Mengunggah..." : "Upload PDF"}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
      {error && <p className="text-[10px] text-rust">{error}</p>}
    </div>
  );
}

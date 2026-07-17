// made by al with love
import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@netlify/blobs";
import { getSession } from "@/lib/auth";

const STORE_NAME = "ga-app-files";

// Menyajikan file yang tersimpan di Netlify Blobs (foto & dokumen upload).
// Perlu login untuk akses — konsisten dengan seluruh route API lain di app ini.
export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = params.path.join("/");
  const store = getStore(STORE_NAME);

  const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
  if (!result) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
  }

  const contentType = (result.metadata?.contentType as string) || "application/octet-stream";

  return new NextResponse(result.data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // aman di-cache lama karena tiap file punya nama unik (timestamp di filename)
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}

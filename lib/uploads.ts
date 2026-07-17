// made by al with love
import { PDFDocument } from "pdf-lib";
import { getStore } from "@netlify/blobs";

const STORE_NAME = "ga-app-files";

async function uploadBuffer(buffer: Buffer, dir: string, filename: string, contentType: string) {
  const store = getStore(STORE_NAME);
  const key = `${dir}/${filename}`;
  const data = new Uint8Array(buffer).buffer;
  await store.set(key, data, { metadata: { contentType } });
  // Netlify Blobs tidak kasih URL publik langsung (beda dengan Vercel Blob) —
  // filenya disajikan lewat route kita sendiri: app/api/files/[...path]/route.ts
  return `/api/files/${key}`;
}

export async function savePdfFile(buffer: Buffer, dir: string, prefix: string) {
  // Kompresi ringan: parse ulang lewat pdf-lib supaya object stream dipadatkan.
  // Ini tidak sedrastis mengompres ulang gambar di dalamnya (butuh tools berat
  // seperti Ghostscript), tapi cukup membantu tanpa dependency tambahan yang berat.
  let outputBytes: Uint8Array;
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    outputBytes = await pdfDoc.save({ useObjectStreams: true });
  } catch {
    // Kalau gagal diparse ulang (PDF tidak standar), simpan apa adanya.
    outputBytes = buffer;
  }

  const filename = `${prefix}-${Date.now()}.pdf`;
  return uploadBuffer(Buffer.from(outputBytes), dir, filename, "application/pdf");
}

export async function saveBase64Image(dataUrl: string, dir: string, prefix: string) {
  const match = /^data:image\/(\w+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Format gambar tidak valid.");
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const buffer = Buffer.from(match[2], "base64");
  const filename = `${prefix}-${Date.now()}.${ext}`;
  return uploadBuffer(buffer, dir, filename, `image/${match[1]}`);
}

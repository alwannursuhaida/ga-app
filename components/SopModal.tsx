"use client";
import { useState } from "react";

export default function SopModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-sm border border-deep px-4 py-2 text-sm font-medium text-deep hover:bg-deep hover:text-sand"
      >
        Lihat SOP
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-[85vh] w-full max-w-3xl flex-col rounded-md bg-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div>
                <p className="font-mono text-[10px] text-ink/40">SOP/GA/001</p>
                <h2 className="font-display text-lg font-semibold text-ink">
                  Standar Operasional Prosedur
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-sm px-2 py-1 text-sm text-ink/50 hover:bg-line/40"
              >
                Tutup
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-sand">
              <iframe src="/sop.pdf" className="h-full w-full" title="SOP" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

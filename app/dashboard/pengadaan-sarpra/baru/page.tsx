import PageHeader from "@/components/PageHeader";
import RequestForm from "@/components/RequestForm";

// made by al with love
export default function BaruPengadaanSarpraPage() {
  return (
    <div>
      <PageHeader eyebrow="MODUL 02" title="Ajukan Pengadaan Sarpra" />
      <RequestForm type="PENGAJUAN_SARANA" backHref="/dashboard/pengadaan-sarpra" />
    </div>
  );
}

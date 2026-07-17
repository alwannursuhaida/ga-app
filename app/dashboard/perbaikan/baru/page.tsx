import PageHeader from "@/components/PageHeader";
import RequestForm from "@/components/RequestForm";

// made by al with love
export default function BaruPerbaikanPage() {
  return (
    <div>
      <PageHeader eyebrow="MODUL 01" title="Ajukan Perbaikan Sarpra" />
      <RequestForm type="PERBAIKAN" backHref="/dashboard/perbaikan" />
    </div>
  );
}

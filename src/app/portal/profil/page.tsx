import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalProfile } from "@/components/portal/PortalProfile";

export default function ProfilPage() {
  return <div className="grid gap-6"><PortalHeader title="Profil" subtitle="Kelola informasi profil warga." /><PortalProfile /></div>;
}
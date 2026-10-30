import { Cta } from "@/components/cta";
import { Faq } from "@/components/faq";
import { Hero } from "@/components/hero";
import { ProfileSection } from "@/components/profile-section";
import { PhotoToReport } from "@/components/photo-to-report";
import { ReportSection } from "@/components/report-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ProfileSection />
        <PhotoToReport />
        <ReportSection />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}

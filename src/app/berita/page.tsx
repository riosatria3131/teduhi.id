import { LandingNewsSection } from "@/components/landing-news-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <LandingNewsSection />
      </main>
      <SiteFooter />
    </div>
  );
}
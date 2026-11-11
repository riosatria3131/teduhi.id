import type { LandingFaqItem, LandingPageContent, LandingStepItem } from "@/lib/landing-page-content";

const inputClass = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-400";
const labelClass = "grid gap-2 text-sm font-bold text-[#102a61]";

type LandingPageEditorProps = {
  content: LandingPageContent;
  onChange: (content: LandingPageContent) => void;
};

export function LandingPageEditor({ content, onChange }: LandingPageEditorProps) {
  function update<K extends keyof LandingPageContent>(key: K, value: LandingPageContent[K]) {
    onChange({ ...content, [key]: value });
  }

  function updateStep(index: number, key: keyof LandingStepItem, value: string) {
    update("howItWorksSteps", content.howItWorksSteps.map((step, itemIndex) => itemIndex === index ? { ...step, [key]: value } : step));
  }

  function updateFaq(index: number, key: keyof LandingFaqItem, value: string) {
    update("faqs", content.faqs.map((faq, itemIndex) => itemIndex === index ? { ...faq, [key]: value } : faq));
  }

  return (
    <div className="grid gap-5">
      <div className="max-w-3xl">
        <h2 className="text-base font-extrabold text-[#102a61]">Konten landing page</h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">Ubah teks pada halaman utama. Perubahan disimpan di browser ini dan langsung digunakan oleh landing page; tidak mengubah database.</p>
      </div>

      <section className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <div><h3 className="text-sm font-extrabold text-[#102a61]">Hero / Judul utama</h3><p className="mt-1 text-xs text-slate-500">Teks utama yang tampil pada banner halaman depan.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Label hero<input required maxLength={80} value={content.heroBadge} onChange={(event) => update("heroBadge", event.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Judul baris pertama<input required maxLength={100} value={content.heroLineOne} onChange={(event) => update("heroLineOne", event.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Judul baris kedua<input required maxLength={100} value={content.heroLineTwo} onChange={(event) => update("heroLineTwo", event.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Penekanan judul<input required maxLength={80} value={content.heroEmphasis} onChange={(event) => update("heroEmphasis", event.target.value)} className={inputClass} /></label>
          <label className={`${labelClass} sm:col-span-2`}>Subjudul<textarea required maxLength={240} rows={2} value={content.heroSubtitle} onChange={(event) => update("heroSubtitle", event.target.value)} className={inputClass} /></label>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <h3 className="text-sm font-extrabold text-[#102a61]">Profil</h3>
        <label className={labelClass}>Judul profil<input required maxLength={160} value={content.profileHeading} onChange={(event) => update("profileHeading", event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Deskripsi profil<textarea required maxLength={1200} rows={4} value={content.profileDescription} onChange={(event) => update("profileDescription", event.target.value)} className={inputClass} /></label>
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <div><h3 className="text-sm font-extrabold text-[#102a61]">Cara kerja</h3><p className="mt-1 text-xs text-slate-500">Urutan langkah ditampilkan mengikuti nomor secara otomatis.</p></div>
        <label className={labelClass}>Label bagian<input required maxLength={80} value={content.howItWorksEyebrow} onChange={(event) => update("howItWorksEyebrow", event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Judul bagian<input required maxLength={160} value={content.howItWorksHeading} onChange={(event) => update("howItWorksHeading", event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Deskripsi bagian<textarea required maxLength={400} rows={2} value={content.howItWorksDescription} onChange={(event) => update("howItWorksDescription", event.target.value)} className={inputClass} /></label>
        <div className="grid gap-3">
          {content.howItWorksSteps.map((step, index) => <article key={index} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
            <h4 className="text-xs font-bold text-slate-600 sm:col-span-2">Langkah {index + 1}</h4>
            <label className={labelClass}>Nama langkah<input required maxLength={80} value={step.title} onChange={(event) => updateStep(index, "title", event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Penjelasan<textarea required maxLength={300} rows={2} value={step.text} onChange={(event) => updateStep(index, "text", event.target.value)} className={inputClass} /></label>
            <button type="button" onClick={() => update("howItWorksSteps", content.howItWorksSteps.filter((_, itemIndex) => itemIndex !== index))} disabled={content.howItWorksSteps.length <= 1} className="w-fit text-xs font-bold text-rose-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40">Hapus langkah</button>
          </article>)}
        </div>
        <button type="button" onClick={() => update("howItWorksSteps", [...content.howItWorksSteps, { title: "Langkah baru", text: "Jelaskan langkah berikutnya." }])} disabled={content.howItWorksSteps.length >= 8} className="w-fit rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">Tambah langkah</button>
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <div><h3 className="text-sm font-extrabold text-[#102a61]">FAQ</h3><p className="mt-1 text-xs text-slate-500">Kelola judul, pengantar, dan tanya-jawab yang tampil di landing page.</p></div>
        <label className={labelClass}>Label bagian<input required maxLength={80} value={content.faqEyebrow} onChange={(event) => update("faqEyebrow", event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Judul bagian<textarea required maxLength={160} rows={2} value={content.faqHeading} onChange={(event) => update("faqHeading", event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Deskripsi bagian<textarea required maxLength={300} rows={2} value={content.faqDescription} onChange={(event) => update("faqDescription", event.target.value)} className={inputClass} /></label>
        <div className="grid gap-3">
          {content.faqs.map((faq, index) => <article key={index} className="grid gap-3 rounded-lg bg-slate-50 p-3">
            <h4 className="text-xs font-bold text-slate-600">Pertanyaan {index + 1}</h4>
            <label className={labelClass}>Pertanyaan<input required maxLength={200} value={faq.q} onChange={(event) => updateFaq(index, "q", event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Jawaban<textarea required maxLength={800} rows={3} value={faq.a} onChange={(event) => updateFaq(index, "a", event.target.value)} className={inputClass} /></label>
            <button type="button" onClick={() => update("faqs", content.faqs.filter((_, itemIndex) => itemIndex !== index))} disabled={content.faqs.length <= 1} className="w-fit text-xs font-bold text-rose-700 hover:underline disabled:cursor-not-allowed disabled:opacity-40">Hapus pertanyaan</button>
          </article>)}
        </div>
        <button type="button" onClick={() => update("faqs", [...content.faqs, { q: "Pertanyaan baru", a: "Jawaban baru." }])} disabled={content.faqs.length >= 12} className="w-fit rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">Tambah FAQ</button>
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <div><h3 className="text-sm font-extrabold text-[#102a61]">Kontak</h3><p className="mt-1 text-xs text-slate-500">Informasi ini digunakan di bagian footer landing page.</p></div>
        <label className={labelClass}>Judul kontak<input required maxLength={80} value={content.contactHeading} onChange={(event) => update("contactHeading", event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Email bantuan<input required type="email" value={content.supportEmail} onChange={(event) => update("supportEmail", event.target.value)} className={inputClass} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Tautan Instagram<input required type="url" value={content.instagramUrl} onChange={(event) => update("instagramUrl", event.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Tautan YouTube<input required type="url" value={content.youtubeUrl} onChange={(event) => update("youtubeUrl", event.target.value)} className={inputClass} /></label>
          <label className={`${labelClass} sm:col-span-2`}>Tautan WhatsApp<input required type="url" value={content.whatsappUrl} onChange={(event) => update("whatsappUrl", event.target.value)} className={inputClass} /></label>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <div><h3 className="text-sm font-extrabold text-[#102a61]">CTA / Ajakan</h3><p className="mt-1 text-xs text-slate-500">Teks ajakan pada bagian bawah landing page.</p></div>
        <label className={labelClass}>Judul CTA<textarea required maxLength={240} rows={2} value={content.ctaHeading} onChange={(event) => update("ctaHeading", event.target.value)} className={inputClass} /></label>
        <label className={labelClass}>Deskripsi CTA<textarea required maxLength={400} rows={2} value={content.ctaDescription} onChange={(event) => update("ctaDescription", event.target.value)} className={inputClass} /></label>
      </section>
    </div>
  );
}

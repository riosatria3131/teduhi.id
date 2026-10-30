"use client";

import { useEffect, useState } from "react";
import { BuildingsIcon, MailIcon, WhatsAppIcon } from "@/components/icons";
import { getSupabaseClient } from "@/lib/supabaseClient";

type OfficerContact = {
  id: string;
  department: string;
  whatsapp: string;
  email: string | null;
  service_area: string;
};

function getWhatsAppHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || /^0+$/.test(digits)) return null;
  return `https://wa.me/${digits.startsWith("0") ? `62${digits.slice(1)}` : digits}`;
}

export function PortalImportantContacts() {
  const [contacts, setContacts] = useState<OfficerContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadContacts() {
      try {
        const { data, error } = await getSupabaseClient()
          .from("officer_contacts")
          .select("id, department, whatsapp, email, service_area")
          .eq("status", "Aktif")
          .order("department");
        if (error) throw error;
        if (active) setContacts((data ?? []) as OfficerContact[]);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadContacts();
    return () => { active = false; };
  }, []);

  return (
    <section aria-labelledby="important-contacts-title" className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)] sm:rounded-3xl sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><BuildingsIcon width={21} height={21} /></span>
        <div className="min-w-0">
          <h2 id="important-contacts-title" className="text-base font-extrabold text-[#102a61] sm:text-lg">Kontak Penting</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">Hubungi petugas sesuai instansi dan wilayah tugasnya.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {loading && <p role="status" className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Memuat kontak petugas…</p>}
        {!loading && loadError && <p role="status" className="rounded-xl bg-amber-50 px-4 py-5 text-center text-sm leading-relaxed text-amber-900">Kontak belum dapat dimuat. Silakan coba kembali beberapa saat lagi.</p>}
        {!loading && !loadError && contacts.length === 0 && <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm leading-relaxed text-slate-500">Belum ada kontak petugas aktif yang tersedia.</p>}
        {!loading && !loadError && contacts.map((contact) => {
          const whatsappHref = getWhatsAppHref(contact.whatsapp);
          return (
            <article key={contact.id} className="min-w-0 rounded-xl border border-slate-100 bg-[#fbfdff] p-3.5 sm:p-4">
              <h3 className="break-words text-sm font-bold text-[#102a61]">{contact.department}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">Wilayah tugas: <span className="font-semibold text-slate-700">{contact.service_area}</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"><WhatsAppIcon width={17} height={17} />WhatsApp</a>}
                {contact.email && <a href={`mailto:${contact.email}`} className="inline-flex min-h-10 min-w-0 max-w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 transition hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"><MailIcon width={16} height={16} /><span className="break-all">Email</span></a>}
                {!whatsappHref && !contact.email && <span className="text-xs text-slate-400">Kanal kontak belum tersedia</span>}
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-slate-400">Kontak yang ditampilkan dikelola oleh petugas TEDUHI.</p>
    </section>
  );
}
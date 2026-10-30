"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MailIcon, PlusIcon, SearchIcon, TrashIcon, UserIcon, WhatsAppIcon } from "@/components/icons";
import { getSupabaseClient } from "@/lib/supabaseClient";

type OfficerContact = {
  id: string;
  department: string;
  whatsapp: string;
  email: string;
  service_area: string;
  status: "Aktif" | "Nonaktif";
};

type ContactForm = Omit<OfficerContact, "id">;

const EMPTY_FORM: ContactForm = {
  department: "",
  whatsapp: "",
  email: "",
  service_area: "",
  status: "Aktif",
};
const fieldClass = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400";

export function AdminOfficerContacts() {
  const [contacts, setContacts] = useState<OfficerContact[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadContacts() {
    const { data, error: queryError } = await getSupabaseClient()
      .from("officer_contacts")
      .select("id, department, whatsapp, email, service_area, status")
      .order("department");
    if (queryError) throw queryError;
    setContacts((data ?? []) as OfficerContact[]);
  }

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void loadContacts().catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Kontak petugas gagal dimuat.");
      }).finally(() => {
        if (active) setLoading(false);
      });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function openEditForm(contact: OfficerContact) {
    setEditingId(contact.id);
    setForm({
      department: contact.department,
      whatsapp: contact.whatsapp,
      email: contact.email,
      service_area: contact.service_area,
      status: contact.status,
    });
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  async function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const supabase = getSupabaseClient();
    const values = {
      ...form,
      department: form.department.trim(),
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim().toLowerCase(),
      service_area: form.service_area.trim(),
    };
    const result = editingId
      ? await supabase.from("officer_contacts").update(values).eq("id", editingId)
      : await supabase.from("officer_contacts").insert(values);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    try {
      await loadContacts();
      setNotice(editingId ? "Kontak petugas berhasil diperbarui." : "Kontak petugas berhasil ditambahkan.");
      setFormOpen(false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Data tersimpan, tetapi daftar kontak gagal dimuat ulang.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(contact: OfficerContact) {
    const nextStatus = contact.status === "Aktif" ? "Nonaktif" : "Aktif";
    setError("");
    setNotice("");
    const { error: updateError } = await getSupabaseClient()
      .from("officer_contacts")
      .update({ status: nextStatus })
      .eq("id", contact.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    try {
      await loadContacts();
      setNotice(`Status ${contact.department} sekarang ${nextStatus.toLowerCase()}.`);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Status berubah, tetapi data kontak gagal dimuat ulang.");
    }
  }

  async function deleteContact(contact: OfficerContact) {
    if (!window.confirm(`Hapus kontak ${contact.department}?`)) return;
    setError("");
    setNotice("");
    const { error: deleteError } = await getSupabaseClient()
      .from("officer_contacts")
      .delete()
      .eq("id", contact.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    try {
      await loadContacts();
      setNotice(`Kontak ${contact.department} berhasil dihapus.`);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Kontak dihapus, tetapi daftar gagal dimuat ulang.");
    }
  }

  const visibleContacts = contacts.filter((contact) => {
    const text = `${contact.department} ${contact.service_area} ${contact.email}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (statusFilter === "Semua Status" || contact.status === statusFilter);
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <label className="relative block w-full sm:max-w-sm"><span className="sr-only">Cari kontak petugas</span><SearchIcon width={17} height={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari instansi, wilayah, atau email..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-400 focus:bg-white" /></label>
        <div className="flex flex-wrap items-center gap-2"><select aria-label="Filter status petugas" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"><option>Semua Status</option><option>Aktif</option><option>Nonaktif</option></select><button type="button" onClick={openCreateForm} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800"><PlusIcon width={17} height={17} />Tambah Instansi</button></div>
      </div>

      {formOpen && <form onSubmit={saveContact} className="grid gap-3 border-b border-blue-100 bg-blue-50/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1 text-xs font-bold text-slate-600">Nama instansi<input required maxLength={120} value={form.department} onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))} className={fieldClass} placeholder="Contoh: BPBD Kota Bogor" /></label>
        <label className="grid gap-1 text-xs font-bold text-slate-600">Nomor WhatsApp untuk tautan chat<input required type="tel" maxLength={30} value={form.whatsapp} onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))} className={fieldClass} placeholder="Contoh: 081234567890" /></label>
        <label className="grid gap-1 text-xs font-bold text-slate-600">Email<input type="email" maxLength={254} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className={fieldClass} placeholder="petugas@instansi.go.id" /></label>
        <label className="grid gap-1 text-xs font-bold text-slate-600 sm:col-span-2">Wilayah tugas<input required maxLength={180} value={form.service_area} onChange={(event) => setForm((current) => ({ ...current, service_area: event.target.value }))} className={fieldClass} placeholder="Contoh: Kecamatan Bogor Barat" /></label>
        <label className="grid gap-1 text-xs font-bold text-slate-600">Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ContactForm["status"] }))} className={fieldClass}><option>Aktif</option><option>Nonaktif</option></select></label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3"><button disabled={saving} className="h-10 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white disabled:opacity-60">{saving ? "Menyimpan…" : editingId ? "Simpan Perubahan" : "Simpan Instansi"}</button><button type="button" onClick={() => setFormOpen(false)} className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600">Batal</button></div>
      </form>}

      {error && <p role="alert" className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      {notice && <p role="status" className="m-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}

      <div className="grid gap-3 p-4 sm:p-5">
        {visibleContacts.map((contact) => {
          const whatsappNumber = contact.whatsapp.replace(/\D/g, "").replace(/^0/, "62");
          const whatsappHref = `https://wa.me/${whatsappNumber}`;
          const isActive = contact.status === "Aktif";
          const contactIconClass = "inline-flex size-10 items-center justify-center rounded-lg";
          return <article key={contact.id} className="grid gap-4 rounded-xl border border-slate-100 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex min-w-0 items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700"><UserIcon width={20} height={20} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-[#102a61]">{contact.department}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{contact.status}</span></div><p className="mt-1 text-xs text-slate-500">Wilayah tugas: <span className="font-semibold text-slate-700">{contact.service_area}</span></p><div className="mt-3 flex flex-wrap gap-2">{contact.email && (isActive ? <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contact.email.trim())}`} target="_blank" rel="noreferrer" aria-label={`Kirim email ke ${contact.email}`} title={`Buka Gmail untuk mengirim email ke ${contact.email}`} className={`${contactIconClass} bg-blue-50 text-blue-700 hover:bg-blue-100`}><MailIcon width={18} height={18} /></a> : <span aria-label="Email tidak tersedia karena petugas nonaktif" title="Petugas nonaktif" className={`${contactIconClass} cursor-not-allowed bg-slate-100 text-slate-400`}><MailIcon width={18} height={18} /></span>)}{isActive ? <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label={`Hubungi ${contact.department} melalui WhatsApp`} title="Hubungi melalui WhatsApp" className={`${contactIconClass} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}><WhatsAppIcon width={19} height={19} /></a> : <span aria-label="WhatsApp tidak tersedia karena petugas nonaktif" title="Petugas nonaktif" className={`${contactIconClass} cursor-not-allowed bg-slate-100 text-slate-400`}><WhatsAppIcon width={19} height={19} /></span>}</div></div></div>
            <div className="flex flex-wrap gap-2 sm:justify-end"><button type="button" onClick={() => openEditForm(contact)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Edit</button><button type="button" onClick={() => void toggleStatus(contact)} className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">{contact.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}</button><button type="button" onClick={() => void deleteContact(contact)} aria-label={`Hapus kontak ${contact.department}`} className="grid size-9 place-items-center rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50"><TrashIcon width={16} height={16} /></button></div>
          </article>;
        })}
        {!loading && visibleContacts.length === 0 && <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">{search || statusFilter !== "Semua Status" ? "Tidak ada kontak yang sesuai pencarian/filter." : "Belum ada instansi. Tambahkan instansi untuk mulai mengelola direktori."}</p>}
        {loading && <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">Memuat kontak petugas…</p>}
      </div>
      <p className="border-t border-slate-100 px-5 py-2.5 text-[11px] text-slate-400">Kontak petugas dikelola melalui database Supabase.</p>
    </section>
  );
}

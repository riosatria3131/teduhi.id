"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PlusIcon, SearchIcon } from "@/components/icons";

export type AdminTableRow = { id: string; values: string[]; status?: string; href?: string };
type AdminDataTableProps = { columns: string[]; rows: AdminTableRow[]; searchPlaceholder: string; addLabel?: string; filters?: string[]; footerMessage?: string; allowRowActions?: boolean };

function statusClass(status?: string) {
  if (!status) return "bg-slate-100 text-slate-600";
  if (["Selesai", "Aktif"].includes(status)) return "bg-emerald-50 text-emerald-700";
  if (["Dalam Proses", "Menunggu"].includes(status)) return "bg-amber-50 text-amber-700";
  if (["Baru", "Nonaktif", "Ditolak"].includes(status)) return "bg-rose-50 text-rose-700";
  return "bg-blue-50 text-blue-700";
}

export function AdminDataTable({ columns, rows, searchPlaceholder, addLabel, filters = [], footerMessage = "Data contoh antarmuka admin, belum terhubung ke backend.", allowRowActions = false }: AdminDataTableProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Semua Status");
  const [showForm, setShowForm] = useState(false);
  const [draftRows, setDraftRows] = useState<AdminTableRow[]>([]);
  const [draft, setDraft] = useState<string[]>(columns.map(() => ""));
  const [page, setPage] = useState(1);
  const [liveRows, setLiveRows] = useState<AdminTableRow[]>(rows);
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  useEffect(() => {
    setLiveRows(rows);
  }, [rows]);

  const allRows = useMemo(() => [...draftRows, ...liveRows], [draftRows, liveRows]);
  const filteredRows = allRows.filter((row) => `${row.id} ${row.values.join(" ")}`.toLowerCase().includes(query.toLowerCase()) && (filter === "Semua Status" || !row.status || row.status === filter));
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / 5));
  const visibleRows = filteredRows.slice((page - 1) * 5, page * 5);

  function addRow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraftRows((current) => [{ id: `DEMO-${Date.now()}`, values: draft, status: draft[columns.findIndex((column) => column.toLowerCase() === "status")] }, ...current]);
    setDraft(columns.map(() => ""));
    setShowForm(false);
    setPage(1);
  }

  function toggleRowStatus(rowId: string) {
    setLiveRows((current) => current.map((row) => {
      if (row.id !== rowId || !row.status) return row;
      const nextStatus = row.status === "Aktif" ? "Nonaktif" : "Aktif";
      return { ...row, status: nextStatus, values: row.values.map((value, index) => index === columns.findIndex((column) => column.toLowerCase().includes("status")) ? nextStatus : value) };
    }));
    setOpenActionId(null);
  }

  function deleteRow(rowId: string) {
    setLiveRows((current) => current.filter((row) => row.id !== rowId));
    setOpenActionId(null);
  }

  return <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_-26px_rgba(16,39,92,0.45)]">
    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><label className="relative block w-full sm:max-w-sm"><SearchIcon width={17} height={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={searchPlaceholder} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white" /></label><div className="flex flex-wrap items-center gap-2">{filters.length > 0 && <select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }} aria-label="Filter status" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-blue-400"><option>Semua Status</option>{filters.map((item) => <option key={item}>{item}</option>)}</select>}{addLabel && <button type="button" onClick={() => setShowForm(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white transition hover:bg-blue-800"><PlusIcon width={17} height={17} />{addLabel}</button>}</div></div>
    {showForm && <form onSubmit={addRow} className="grid gap-3 border-b border-blue-100 bg-blue-50/50 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">{columns.map((column, index) => <label key={column} className="grid gap-1 text-xs font-bold text-slate-600">{column}<input required value={draft[index]} onChange={(event) => setDraft((current) => current.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-blue-400" /></label>)}<div className="flex items-end gap-2"><button className="h-9 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white">Simpan demo</button><button type="button" onClick={() => setShowForm(false)} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600">Batal</button></div></form>}
    <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="w-12 px-4 py-3 text-center">No</th>{columns.map((column) => <th key={column} className="px-4 py-3 font-extrabold">{column}</th>)}<th className="px-4 py-3 text-right font-extrabold">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleRows.map((row, rowIndex) => <tr key={row.id} className="transition hover:bg-slate-50/70"><td className="px-4 py-3.5 text-center text-xs text-slate-400">{(page - 1) * 5 + rowIndex + 1}</td>{row.values.map((value, index) => <td key={`${row.id}-${index}`} className="px-4 py-3.5 text-slate-600">{columns[index]?.toLowerCase().includes("status") && row.status ? <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(row.status)}`}>{value}</span> : <span className={index === 0 ? "font-bold text-[#102a61]" : ""}>{value}</span>}</td>)}<td className="px-4 py-3.5 text-right"><div className="relative inline-block text-left">{row.href ? <Link href={row.href} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50">Detail</Link> : <button type="button" aria-label={`Aksi untuk ${row.id}`} aria-expanded={openActionId === row.id} onClick={() => setOpenActionId((current) => current === row.id ? null : row.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50">•••</button>}{allowRowActions && !row.href && openActionId === row.id && <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"><button type="button" onClick={() => toggleRowStatus(row.id)} className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">{row.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}</button><button type="button" onClick={() => { if (window.confirm("Hapus data ini?")) deleteRow(row.id); }} className="mt-1 w-full rounded-lg px-2.5 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50">Hapus</button></div>}</div></td></tr>)}{visibleRows.length === 0 && <tr><td colSpan={columns.length + 2} className="px-4 py-12 text-center text-sm text-slate-500">Tidak ada data yang cocok dengan pencarian.</td></tr>}</tbody></table></div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3.5 sm:px-5"><p className="text-xs text-slate-500">Menampilkan {filteredRows.length ? (page - 1) * 5 + 1 : 0}–{Math.min(page * 5, filteredRows.length)} dari {filteredRows.length} data</p><div className="flex items-center gap-1"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} className="size-8 rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50" aria-label="Halaman sebelumnya">‹</button>{Array.from({ length: pageCount }, (_, index) => <button key={index} type="button" onClick={() => setPage(index + 1)} className={`size-8 rounded-lg text-xs font-bold ${page === index + 1 ? "bg-blue-700 text-white" : "text-slate-500 hover:bg-slate-50"}`}>{index + 1}</button>)}<button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="size-8 rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50" aria-label="Halaman berikutnya">›</button></div></div>
    <p className="border-t border-slate-100 px-5 py-2.5 text-[11px] text-slate-400">{footerMessage}</p>
  </section>;
}
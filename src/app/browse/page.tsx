"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { CATEGORIES, STATES, LISTING_TYPES } from "@/lib/data";
import { api, ProductCard, Empty, VoiceSearch, type Listing } from "@/components/ui";

function BrowseInner() {
  const { t } = useLang();
  const sp = useSearchParams();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ q: sp.get("q") || "", type: sp.get("type") || "", category: sp.get("category") || "", state: sp.get("state") || "", district: "", min: "", max: "", condition: "", sort: "newest" });

  async function load(filters = f) {
    setLoading(true);
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v) qs.set(k, v);
    try { const d = await api(`/api/listings?${qs}`); setItems(d.listings); } catch { setItems([]); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  const upd = (k: string, v: string) => { const nf = { ...f, [k]: v }; setF(nf); load(nf); };
  const inputCls = "w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-green-950 lg:text-3xl">{t("browse")}</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border border-green-100 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <h2 className="font-bold text-green-950">{t("filters")}</h2>
          <div className="mt-4 space-y-3">
            <div className="flex gap-2"><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} onKeyDown={(e) => e.key === "Enter" && load()} placeholder={t("searchPlaceholder")} className={inputCls} /><VoiceSearch onResult={(v) => upd("q", v)} /></div>
            <select value={f.type} onChange={(e) => upd("type", e.target.value)} className={inputCls}><option value="">{t("allTypes")}</option>{LISTING_TYPES.map((x) => <option key={x} value={x}>{x === "sell" ? t("sellT") : x === "rent" ? t("rentT") : x === "exchange" ? t("exchange") : x === "free" ? t("free") : t("wanted")}</option>)}</select>
            <select value={f.category} onChange={(e) => upd("category", e.target.value)} className={inputCls}><option value="">{t("category")}</option>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.en}</option>)}</select>
            <select value={f.state} onChange={(e) => upd("state", e.target.value)} className={inputCls}><option value="">{t("state")}</option>{Object.keys(STATES).map((s) => <option key={s}>{s}</option>)}</select>
            {f.state && <select value={f.district} onChange={(e) => upd("district", e.target.value)} className={inputCls}><option value="">{t("district")}</option>{(STATES[f.state] || []).map((d) => <option key={d}>{d}</option>)}</select>}
            <div className="grid grid-cols-2 gap-2"><input type="number" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} placeholder={t("minPrice")} className={inputCls} /><input type="number" value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} placeholder={t("maxPrice")} className={inputCls} /></div>
            <select value={f.condition} onChange={(e) => upd("condition", e.target.value)} className={inputCls}><option value="">{t("condition")}</option><option value="new">{t("new")}</option><option value="used">{t("used")}</option><option value="refurbished">{t("refurbished")}</option></select>
            <select value={f.sort} onChange={(e) => upd("sort", e.target.value)} className={inputCls}><option value="newest">{t("newest")}</option><option value="oldest">{t("oldest")}</option><option value="priceLow">{t("priceLow")}</option><option value="priceHigh">{t("priceHigh")}</option><option value="views">{t("mostViewed")}</option></select>
            <button onClick={() => { const nf = { q: "", type: "", category: "", state: "", district: "", min: "", max: "", condition: "", sort: "newest" }; setF(nf); load(nf); }} className="w-full rounded-xl border border-green-200 py-2.5 text-sm font-semibold text-green-900 hover:bg-green-50">{t("clearFilters")}</button>
          </div>
        </aside>
        <div>
          <p className="mb-4 text-sm text-slate-600">{items.length} {t("results")}</p>
          {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-green-100" />)}</div>
            : items.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((l) => <ProductCard key={l.id} l={l} />)}</div>
            : <Empty>{t("noResults")}</Empty>}
        </div>
      </div>
    </div>
  );
}
export default function Browse() { return <Suspense><BrowseInner /></Suspense>; }

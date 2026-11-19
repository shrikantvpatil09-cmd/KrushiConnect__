"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { CATEGORIES, STATES, UNITS, LISTING_TYPES } from "@/lib/data";
import { api, Toast, useToast } from "@/components/ui";

export default function Sell() {
  const { t } = useLang();
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState<any>({ title: "", listingType: "sell", categorySlug: "seeds", description: "", price: "", quantity: 1, unit: "piece", condition: "new", brand: "", state: "", district: "", taluka: "", village: "", pincode: "", images: "", hourlyPrice: "", dailyPrice: "", weeklyPrice: "", securityDeposit: "", exchangeFor: "", rentalTerms: "", manufacturer: "", licenceDetails: "", batchNo: "", expiryDate: "" });
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  const inputCls = "w-full rounded-xl border border-green-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600";
  const labelCls = "mb-1 block text-sm font-semibold text-green-950";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const d = await api("/api/listings", { method: "POST", body: JSON.stringify({ ...f, images: f.images.split("\n").map((s: string) => s.trim()).filter(Boolean) }) });
      toast.show(t("listingCreated"));
      setTimeout(() => router.push(`/listing/${d.listing.id}`), 800);
    } catch (err: any) { toast.show(err.message); }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Toast msg={toast.msg} />
      <h1 className="text-2xl font-extrabold text-green-950 lg:text-3xl">{t("createListing")}</h1>
      <form onSubmit={submit} className="mt-6 space-y-5 rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <div><label className={labelCls}>{t("listingTitle")} *</label><input required value={f.title} onChange={(e) => set("title", e.target.value)} className={inputCls} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelCls}>{t("listingType")}</label><select value={f.listingType} onChange={(e) => set("listingType", e.target.value)} className={inputCls}>{LISTING_TYPES.map((x) => <option key={x} value={x}>{x === "sell" ? t("sellT") : x === "rent" ? t("rentT") : x === "exchange" ? t("exchange") : x === "free" ? t("free") : t("wanted")}</option>)}</select></div>
          <div><label className={labelCls}>{t("category")}</label><select value={f.categorySlug} onChange={(e) => set("categorySlug", e.target.value)} className={inputCls}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.en}</option>)}</select></div>
        </div>
        <div><label className={labelCls}>{t("description")}</label><textarea value={f.description} onChange={(e) => set("description", e.target.value)} className={inputCls} rows={4} placeholder={f.listingType === "wanted" ? t("buyRequestNote") : ""} /></div>
        <div><label className={labelCls}>{t("images")}</label><textarea value={f.images} onChange={(e) => set("images", e.target.value)} className={inputCls} rows={2} placeholder="https://…" /></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className={labelCls}>{t("price")} (₹)</label><input type="number" value={f.price} onChange={(e) => set("price", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>{t("quantity")}</label><input type="number" value={f.quantity} onChange={(e) => set("quantity", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>{t("unit")}</label><select value={f.unit} onChange={(e) => set("unit", e.target.value)} className={inputCls}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelCls}>{t("condition")}</label><select value={f.condition} onChange={(e) => set("condition", e.target.value)} className={inputCls}><option value="new">{t("new")}</option><option value="used">{t("used")}</option><option value="refurbished">{t("refurbished")}</option></select></div>
          <div><label className={labelCls}>{t("brand")}</label><input value={f.brand} onChange={(e) => set("brand", e.target.value)} className={inputCls} /></div>
        </div>
        {f.listingType === "rent" && <div className="space-y-4 rounded-2xl bg-green-50 p-4">
          <div className="grid gap-4 sm:grid-cols-3"><div><label className={labelCls}>{t("hourlyPrice")}</label><input type="number" value={f.hourlyPrice} onChange={(e) => set("hourlyPrice", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>{t("dailyPrice")}</label><input type="number" value={f.dailyPrice} onChange={(e) => set("dailyPrice", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>{t("weeklyPrice")}</label><input type="number" value={f.weeklyPrice} onChange={(e) => set("weeklyPrice", e.target.value)} className={inputCls} /></div></div>
          <div><label className={labelCls}>{t("securityDeposit")}</label><input type="number" value={f.securityDeposit} onChange={(e) => set("securityDeposit", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>{t("rentalTerms")}</label><textarea value={f.rentalTerms} onChange={(e) => set("rentalTerms", e.target.value)} className={inputCls} rows={2} /></div>
        </div>}
        {f.listingType === "exchange" && <div><label className={labelCls}>{t("exchangeFor")}</label><input value={f.exchangeFor} onChange={(e) => set("exchangeFor", e.target.value)} className={inputCls} placeholder="e.g. Soybean seeds" /></div>}
        {f.categorySlug === "pesticides" && <div className="space-y-4 rounded-2xl bg-amber-50 p-4">
          <div><label className={labelCls}>{t("manufacturer")}</label><input value={f.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>{t("licenceDetails")} *</label><input required value={f.licenceDetails} onChange={(e) => set("licenceDetails", e.target.value)} className={inputCls} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelCls}>{t("batchNo")}</label><input value={f.batchNo} onChange={(e) => set("batchNo", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>{t("expiryDate")}</label><input type="date" value={f.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} className={inputCls} /></div></div>
        </div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={labelCls}>{t("state")}</label><select value={f.state} onChange={(e) => set("state", e.target.value)} className={inputCls}><option value="">—</option>{Object.keys(STATES).map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className={labelCls}>{t("district")}</label><select value={f.district} onChange={(e) => set("district", e.target.value)} className={inputCls}><option value="">—</option>{(STATES[f.state] || []).map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label className={labelCls}>{t("taluka")}</label><input value={f.taluka} onChange={(e) => set("taluka", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>{t("village")}</label><input value={f.village} onChange={(e) => set("village", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>{t("pincode")}</label><input value={f.pincode} onChange={(e) => set("pincode", e.target.value)} className={inputCls} /></div>
        </div>
        <button className="w-full rounded-full bg-green-800 py-3.5 font-bold text-white hover:bg-green-900">{t("addListing")}</button>
      </form>
    </div>
  );
}

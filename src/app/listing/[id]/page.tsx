"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, MapPin, Star, BadgeCheck, ShieldAlert, CalendarDays } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { fmtINR } from "@/lib/data";
import { api, Toast, useToast, Stars, Empty, type Listing } from "@/components/ui";

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useLang();
  const router = useRouter();
  const toast = useToast();
  const [l, setL] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [start, setStart] = useState(""); const [end, setEnd] = useState("");
  const [wished, setWished] = useState(false);
  const [reportOpen, setReportOpen] = useState(false); const [reason, setReason] = useState("fake");
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => { api(`/api/listings/${id}`).then((d) => { setL(d.listing); setSeller(d.listing.seller); setReviews(d.reviews); }).catch(() => {}); }, [id]);

  if (!l) return <div className="mx-auto max-w-7xl px-4 py-20"><div className="h-96 animate-pulse rounded-3xl bg-green-100" /></div>;
  const days = start && end ? Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000)) : 0;
  const est = days * Number(l.dailyPrice || l.price || 0);

  async function act(action: string, extra: any = {}) {
    try { const d = await api(`/api/listings/${id}`, { method: "POST", body: JSON.stringify({ action, ...extra }) });
      if (action === "wishlist") { setWished(d.wished); toast.show(d.wished ? t("addedWishlist") : t("removedWishlist")); }
      if (action === "purchase") toast.show(t("purchaseRequested"));
      if (action === "rental") toast.show(t("rentalSubmitted"));
      if (action === "report") { toast.show(t("saved")); setReportOpen(false); }
    } catch (e: any) { toast.show(e.message); }
  }
  async function contact() {
    try { const d = await api("/api/messages", { method: "POST", body: JSON.stringify({ listingId: id, body: note || `Hi, I am interested in "${l!.title}"` }) }); router.push(`/messages?conv=${d.message.conversationId}`); }
    catch (e: any) { toast.show(e.message); }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Toast msg={toast.msg} />
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl bg-green-50"><img src={l.images?.[imgIdx] || l.images?.[0]} alt={l.title} className="h-80 w-full object-cover lg:h-[420px]" /></div>
          {l.images?.length > 1 && <div className="mt-3 flex gap-2">{l.images.map((im, i) => <button key={i} onClick={() => setImgIdx(i)} className={`h-16 w-20 overflow-hidden rounded-xl border-2 ${i === imgIdx ? "border-green-700" : "border-transparent"}`}><img src={im} className="h-full w-full object-cover" /></button>)}</div>}
        </div>
        <div>
          <span className="rounded-full bg-green-800 px-3 py-1 text-xs font-bold text-white">{l.listingType}</span>
          <h1 className="mt-3 text-3xl font-extrabold text-green-950">{l.title}</h1>
          <p className="mt-2 text-3xl font-extrabold text-green-800">{l.listingType === "free" ? t("free") : l.listingType === "exchange" ? t("exchange") : `${fmtINR(l.price)} / ${l.unit}`}</p>
          {l.listingType === "rent" && <div className="mt-2 space-y-1 text-sm text-slate-700">{l.hourlyPrice && <p>{t("hourlyPrice")}: {fmtINR(l.hourlyPrice)}{t("perHour")}</p>}{l.dailyPrice && <p>{t("dailyPrice")}: {fmtINR(l.dailyPrice)}{t("perDay")}</p>}{l.weeklyPrice && <p>{t("weeklyPrice")}: {fmtINR(l.weeklyPrice)}{t("perWeek")}</p>}{l.securityDeposit && <p>{t("securityDeposit")}: {fmtINR(l.securityDeposit)}</p>}</div>}
          {l.exchangeFor && <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm"><b>{t("exchangeFor")}:</b> {l.exchangeFor}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <p><b>{t("condition")}:</b> {l.condition}</p><p><b>{t("quantity")}:</b> {l.quantity} {l.unit}</p>
            {l.brand && <p><b>{t("brand")}:</b> {l.brand}</p>}
            <p className="flex items-center gap-1"><MapPin size={14} />{[l.village, l.district, l.state].filter(Boolean).join(", ")}</p>
            <p><b>{t("listedOn")}:</b> {new Date(l.createdAt).toLocaleDateString()}</p>
          </div>
          <p className="mt-4 whitespace-pre-line rounded-2xl bg-white p-4 text-slate-700 shadow-sm">{l.description}</p>
          {l.rentalTerms && <p className="mt-3 rounded-2xl bg-white p-4 text-sm text-slate-600"><b>{t("rentalTerms")}:</b> {l.rentalTerms}</p>}

          <div className="mt-5 rounded-2xl border border-green-100 bg-white p-4">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-green-800 font-bold text-white">{seller?.name?.[0]}</span>
              <div><p className="flex items-center gap-1 font-bold text-green-950">{seller?.name} {seller?.isVerified && <BadgeCheck size={16} className="text-green-700" />}</p>
              <p className="flex items-center gap-1 text-xs text-slate-500"><Star size={12} className="fill-amber-400 text-amber-400" />{Number(l.sellerRating || 0).toFixed(1)} · {seller?.userType}</p></div></div>
          </div>

          <div className="mt-5 space-y-3">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("typeMessage")} className="w-full rounded-xl border border-green-200 p-3 text-sm" rows={2} />
            <div className="flex flex-wrap gap-2">
              <button onClick={contact} className="flex items-center gap-2 rounded-full bg-green-800 px-5 py-3 font-bold text-white"><MessageCircle size={18} />{t("contactSeller")}</button>
              <button onClick={() => act("wishlist")} className="flex items-center gap-2 rounded-full border border-green-300 px-5 py-3 font-bold text-green-900"><Heart size={18} className={wished ? "fill-red-500 text-red-500" : ""} />{t("addToWishlist")}</button>
              <button onClick={() => setReportOpen(!reportOpen)} className="flex items-center gap-2 rounded-full border border-red-200 px-5 py-3 font-bold text-red-700"><ShieldAlert size={18} />{t("reportListing")}</button>
            </div>
            {reportOpen && <div className="flex gap-2"><select value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-xl border p-2.5 text-sm"><option value="fake">Fake product</option><option value="fraud">Fraudulent seller</option><option value="incorrect">Incorrect description</option><option value="prohibited">Prohibited product</option><option value="other">Other</option></select><button onClick={() => act("report", { reason })} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white">{t("submitReport")}</button></div>}

            {(l.listingType === "sell" || l.listingType === "free" || l.listingType === "exchange") && (
              <div className="rounded-2xl bg-green-50 p-4">
                <label className="text-sm font-semibold">{t("reqQty")} ({t("qtyAvailable")}: {l.quantity})</label>
                <div className="mt-2 flex gap-2"><input type="number" min={1} max={l.quantity} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-28 rounded-xl border p-2.5" />
                <button onClick={() => act("purchase", { quantity: qty, note })} className="rounded-xl bg-yellow-400 px-5 py-2.5 font-bold text-green-950">{l.listingType === "free" ? t("claimFree") : t("requestPurchase")}</button></div>
              </div>
            )}
            {l.listingType === "rent" && (
              <div className="rounded-2xl bg-green-50 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm font-semibold">{t("startDate")}<input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5" /></label>
                  <label className="text-sm font-semibold">{t("endDate")}<input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5" /></label>
                </div>
                {days > 0 && <p className="mt-3 text-sm"><b>{t("estimatedCost")}:</b> {fmtINR(est)} + {t("securityDeposit")}: {fmtINR(l.securityDeposit || 0)}</p>}
                <button onClick={() => act("rental", { startDate: start, endDate: end, note })} className="mt-3 flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-2.5 font-bold text-green-950"><CalendarDays size={18} />{t("submitRental")}</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {reviews.length > 0 && <div className="mt-12"><h2 className="text-xl font-extrabold text-green-950">{t("reviews")}</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{reviews.map((r) => <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm"><Stars n={r.rating} /><p className="mt-2 text-sm text-slate-700">{r.comment}</p><p className="mt-1 text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p></div>)}</div></div>}
    </div>
  );
}

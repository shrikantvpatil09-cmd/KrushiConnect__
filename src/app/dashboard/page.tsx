"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LayoutDashboard, List, ShoppingBag, TrendingUp, Truck, Heart, Bell, User, Languages, Settings, Star, Plus, Pause, Play, CheckCircle, Trash2 } from "lucide-react";
import { useLang, LANGS } from "@/lib/i18n";
import { fmtINR, STATES } from "@/lib/data";
import { api, Toast, useToast, ProductCard, Empty, Stars } from "@/components/ui";

function DashInner() {
  const { t, lang, setLang } = useLang();
  const sp = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState(sp.get("tab") || (sp.get("wishlist") ? "wishlist" : "overview"));
  const [profile, setProfile] = useState<any>({});
  const [reviewTx, setReviewTx] = useState<string | null>(null);
  const [rating, setRating] = useState(5); const [comment, setComment] = useState("");

  async function load() {
    try { const d = await api("/api/dashboard"); setData(d); const m = await api("/api/me"); setUser(m.user); setProfile(m.user); }
    catch (err: unknown) { if (err instanceof Error && /Authentication|Unauthorized|401/i.test(err.message)) router.push("/login"); }
  }
  useEffect(() => { load(); }, []);

  async function patch(body: any) { try { await api("/api/dashboard", { method: "PATCH", body: JSON.stringify(body) }); toast.show(t("saved")); load(); } catch (e: any) { toast.show(e.message); } }
  async function listingPatch(id: string, body: any) { try { await api(`/api/listings/${id}`, { method: "PATCH", body: JSON.stringify(body) }); toast.show(t("statusUpdated")); load(); } catch (e: any) { toast.show(e.message); } }
  async function listingDelete(id: string) { if (!confirm(t("confirmDelete"))) return; try { await api(`/api/listings/${id}`, { method: "DELETE" }); toast.show(t("deleted")); load(); } catch (e: any) { toast.show(e.message); } }

  if (!data) return <div className="mx-auto max-w-7xl px-4 py-20"><div className="h-64 animate-pulse rounded-3xl bg-green-100" /></div>;
  const s = data.stats;
  const tabs = [
    { id: "overview", label: t("overview"), icon: LayoutDashboard }, { id: "profile", label: t("myProfile"), icon: User },
    { id: "listings", label: t("myListings"), icon: List }, { id: "purchases", label: t("myPurchases"), icon: ShoppingBag },
    { id: "sales", label: t("mySales"), icon: TrendingUp }, { id: "rentals", label: t("myRentals"), icon: Truck },
    { id: "rentals-in", label: t("rentalRequests"), icon: Truck }, { id: "wishlist", label: t("wishlist"), icon: Heart },
    { id: "notifications", label: t("notifications"), icon: Bell }, { id: "reviews", label: t("reviews"), icon: Star },
    { id: "language", label: t("languageSettings"), icon: Languages }, { id: "settings", label: t("accountSettings"), icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Toast msg={toast.msg} />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl border border-green-100 bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <div className="mb-4 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-green-800 font-bold text-white">{user?.name?.[0]}</span><div><p className="font-bold text-green-950">{user?.name}</p><p className="text-xs text-slate-500">{user?.email}</p></div></div>
          <nav className="space-y-1">{tabs.map((x) => <button key={x.id} onClick={() => setTab(x.id)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${tab === x.id ? "bg-green-800 text-white" : "text-green-950 hover:bg-green-50"}`}><x.icon size={16} />{x.label}</button>)}</nav>
          <Link href="/sell" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-yellow-400 py-2.5 text-sm font-bold text-green-950"><Plus size={16} />{t("createListing")}</Link>
        </aside>

        <div>
          {tab === "overview" && <div>
            <h1 className="text-2xl font-extrabold text-green-950">{t("overview")}</h1>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[[t("totalListings"), s.totalListings], [t("activeListings"), s.activeListings], [t("productsSold"), s.productsSold], [t("productsPurchased"), s.productsPurchased], [t("equipmentListed"), s.equipmentListed], [t("equipmentRented"), s.equipmentRented], [t("pendingRequests"), s.pendingRequests], [t("completedTx"), s.completedTx]].map(([label, val]) => (
                <div key={label as string} className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"><p className="text-3xl font-extrabold text-green-800">{val}</p><p className="mt-1 text-sm text-slate-600">{label}</p></div>
              ))}
            </div>
            <h2 className="mt-8 font-bold text-green-950">{t("myListings")}</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.myListings.slice(0, 3).map((l: any) => <ProductCard key={l.id} l={l} />)}</div>
          </div>}

          {tab === "listings" && <div><h1 className="text-2xl font-extrabold text-green-950">{t("myListings")}</h1>
            {data.myListings.length ? <div className="mt-5 space-y-3">{data.myListings.map((l: any) => (
              <div key={l.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
                <img src={l.images?.[0]} className="h-16 w-20 rounded-xl object-cover" alt="" />
                <div className="min-w-0 flex-1"><Link href={`/listing/${l.id}`} className="font-bold text-green-950 hover:underline">{l.title}</Link><p className="text-xs text-slate-500">{l.listingType} · {fmtINR(l.price)} · {l.status} · {l.views} views</p></div>
                <div className="flex gap-2">
                  {l.status === "active" && <button onClick={() => listingPatch(l.id, { status: "paused" })} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><Pause size={13} />{t("pause")}</button>}
                  {l.status === "paused" && <button onClick={() => listingPatch(l.id, { status: "active" })} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><Play size={13} />{t("resume")}</button>}
                  <button onClick={() => listingPatch(l.id, { status: "sold" })} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><CheckCircle size={13} />{t("markSold")}</button>
                  <button onClick={() => listingDelete(l.id)} className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700"><Trash2 size={13} />{t("remove")}</button>
                </div>
              </div>))}</div> : <div className="mt-5"><Empty>{t("noResults")}</Empty></div>}
          </div>}

          {tab === "purchases" && <TxList title={t("myPurchases")} items={data.purchases} patch={patch} t={t} reviewTx={reviewTx} setReviewTx={setReviewTx} rating={rating} setRating={setRating} comment={comment} setComment={setComment} />}
          {tab === "sales" && <TxList title={t("mySales")} items={data.sales} patch={patch} t={t} reviewTx={reviewTx} setReviewTx={setReviewTx} rating={rating} setRating={setRating} comment={comment} setComment={setComment} />}

          {tab === "rentals" && <RentalList title={t("myRentals")} items={data.myRentals} patch={patch} t={t} />}
          {tab === "rentals-in" && <RentalList title={t("rentalRequests")} items={data.rentalsIn} patch={patch} t={t} owner />}

          {tab === "wishlist" && <div><h1 className="text-2xl font-extrabold text-green-950">{t("wishlist")}</h1>{data.wishlist.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.wishlist.map((l: any) => <ProductCard key={l.id} l={l} />)}</div> : <div className="mt-5"><Empty>{t("noResults")}</Empty></div>}</div>}

          {tab === "notifications" && <div><div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold text-green-950">{t("notifications")}</h1><button onClick={() => patch({ action: "notif-read", all: true })} className="text-sm font-bold text-green-800">{t("markAllRead")}</button></div>
            {data.notifications.length ? <div className="mt-5 space-y-3">{data.notifications.map((n: any) => <div key={n.id} className={`rounded-2xl border p-4 ${n.isRead ? "bg-white" : "border-green-300 bg-green-50"}`}><p className="font-bold text-green-950">{n.title}</p><p className="text-sm text-slate-600">{n.body}</p><p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>{!n.isRead && <button onClick={() => patch({ action: "notif-read", id: n.id })} className="mt-2 text-xs font-bold text-green-800">{t("markAllRead")}</button>}</div>)}</div> : <div className="mt-5"><Empty>{t("noNotifications")}</Empty></div>}</div>}

          {tab === "reviews" && <div><h1 className="text-2xl font-extrabold text-green-950">{t("reviews")} ({s.avgRating} ★)</h1>{data.reviews.length ? <div className="mt-5 space-y-3">{data.reviews.map((r: any) => <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm"><Stars n={r.rating} /><p className="mt-2 text-sm">{r.comment}</p></div>)}</div> : <div className="mt-5"><Empty>{t("noResults")}</Empty></div>}</div>}

          {tab === "profile" && <div><h1 className="text-2xl font-extrabold text-green-950">{t("myProfile")}</h1>
            <form onSubmit={(e) => { e.preventDefault(); patch({ action: "profile", ...profile }); }} className="mt-5 grid max-w-xl gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
              <div><label className="mb-1 block text-sm font-semibold">{t("fullName")}</label><input value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full rounded-xl border p-2.5" /></div>
              <div><label className="mb-1 block text-sm font-semibold">{t("mobile")}</label><input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full rounded-xl border p-2.5" /></div>
              <div><label className="mb-1 block text-sm font-semibold">{t("state")}</label><select value={profile.state || ""} onChange={(e) => setProfile({ ...profile, state: e.target.value })} className="w-full rounded-xl border p-2.5"><option value="">—</option>{Object.keys(STATES).map((x) => <option key={x}>{x}</option>)}</select></div>
              <div><label className="mb-1 block text-sm font-semibold">{t("district")}</label><select value={profile.district || ""} onChange={(e) => setProfile({ ...profile, district: e.target.value })} className="w-full rounded-xl border p-2.5"><option value="">—</option>{(STATES[profile.state] || []).map((x) => <option key={x}>{x}</option>)}</select></div>
              <div><label className="mb-1 block text-sm font-semibold">{t("village")}</label><input value={profile.village || ""} onChange={(e) => setProfile({ ...profile, village: e.target.value })} className="w-full rounded-xl border p-2.5" /></div>
              <div><label className="mb-1 block text-sm font-semibold">{t("pincode")}</label><input value={profile.pincode || ""} onChange={(e) => setProfile({ ...profile, pincode: e.target.value })} className="w-full rounded-xl border p-2.5" /></div>
              <button className="rounded-full bg-green-800 py-3 font-bold text-white sm:col-span-2">{t("saved")}</button>
            </form></div>}

          {tab === "language" && <div><h1 className="text-2xl font-extrabold text-green-950">{t("languageSettings")}</h1><div className="mt-5 flex gap-3">{LANGS.map((l) => <button key={l.code} onClick={() => { setLang(l.code); patch({ action: "profile", preferredLanguage: l.code }); }} className={`rounded-2xl border px-6 py-4 font-bold ${lang === l.code ? "border-green-800 bg-green-800 text-white" : "bg-white"}`}>{l.label}</button>)}</div></div>}

          {tab === "settings" && <div><h1 className="text-2xl font-extrabold text-green-950">{t("accountSettings")}</h1><div className="mt-5 max-w-xl rounded-2xl bg-white p-6 shadow-sm"><p className="text-sm text-slate-600">{t("email")}: {user?.email}</p><p className="mt-1 text-sm text-slate-600">{t("userType")}: {user?.userType}</p><p className="mt-1 text-sm text-slate-600">{t("verified")}: {user?.isVerified ? "✓" : "—"}</p></div></div>}
        </div>
      </div>
    </div>
  );
}

function TxList({ title, items, patch, t, reviewTx, setReviewTx, rating, setRating, comment, setComment }: any) {
  return <div><h1 className="text-2xl font-extrabold text-green-950">{title}</h1>
    {items.length ? <div className="mt-5 space-y-3">{items.map(({ t: tx, title: lt }: any) => (
      <div key={tx.id} className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-bold text-green-950">{lt || tx.type}</p><p className="text-xs text-slate-500">{tx.type} · {fmtINR(tx.agreedPrice)} · {tx.quantity} · {new Date(tx.createdAt).toLocaleDateString()}</p></div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-900">{tx.status}</span></div>
        <div className="mt-3 flex flex-wrap gap-2">
          {tx.status === "pending" && <><button onClick={() => patch({ action: "tx", id: tx.id, status: "accepted" })} className="rounded-lg bg-green-800 px-3 py-2 text-xs font-bold text-white">{t("accept")}</button><button onClick={() => patch({ action: "tx", id: tx.id, status: "rejected" })} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">{t("reject")}</button></>}
          {tx.status === "accepted" && <button onClick={() => patch({ action: "tx", id: tx.id, status: "completed" })} className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-bold text-green-950">{t("complete")}</button>}
          {tx.status === "completed" && <button onClick={() => setReviewTx(reviewTx === tx.id ? null : tx.id)} className="rounded-lg border px-3 py-2 text-xs font-bold">{t("reviews")}</button>}
        </div>
        {reviewTx === tx.id && <div className="mt-3 flex flex-wrap items-center gap-2"><Stars n={rating} /><input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-16 rounded-lg border p-2" /><input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("comment") || "Review…"} className="flex-1 rounded-lg border p-2" /><button onClick={() => patch({ action: "review", transactionId: tx.id, rating, comment })} className="rounded-lg bg-green-800 px-4 py-2 text-xs font-bold text-white">{t("send")}</button></div>}
      </div>))}</div> : <div className="mt-5"><Empty>{t("noResults")}</Empty></div>}
  </div>;
}

function RentalList({ title, items, patch, t, owner }: any) {
  return <div><h1 className="text-2xl font-extrabold text-green-950">{title}</h1>
    {items.length ? <div className="mt-5 space-y-3">{items.map(({ r, title: lt }: any) => (
      <div key={r.id} className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-bold text-green-950">{lt}</p><p className="text-xs text-slate-500">{r.startDate} → {r.endDate} · {fmtINR(r.estimatedAmount)} + {fmtINR(r.deposit)} {t("securityDeposit")}</p></div><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-900">{r.status}</span></div>
        {r.status === "pending" && <div className="mt-3 flex gap-2"><button onClick={() => patch({ action: "rental", id: r.id, status: "confirmed" })} className="rounded-lg bg-green-800 px-3 py-2 text-xs font-bold text-white">{t("accept")}</button><button onClick={() => patch({ action: "rental", id: r.id, status: "rejected" })} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">{t("reject")}</button></div>}
        {r.status === "confirmed" && <button onClick={() => patch({ action: "rental", id: r.id, status: "active" })} className="mt-3 rounded-lg bg-yellow-400 px-3 py-2 text-xs font-bold text-green-950">{t("active")}</button>}
        {r.status === "active" && <button onClick={() => patch({ action: "rental", id: r.id, status: "completed" })} className="mt-3 rounded-lg bg-yellow-400 px-3 py-2 text-xs font-bold text-green-950">{t("complete")}</button>}
      </div>))}</div> : <div className="mt-5"><Empty>{t("noResults")}</Empty></div>}
  </div>;
}

export default function Dashboard() { return <Suspense><DashInner /></Suspense>; }

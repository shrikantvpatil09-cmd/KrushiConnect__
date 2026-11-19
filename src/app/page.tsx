"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sprout, Leaf, Shield, Truck, Cog, Droplets, Wheat, Recycle, Beef, Wrench, SprayCan, Zap, ArrowRight, CheckCircle2, Users, MapPin, Languages, BadgeCheck, Mic } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { CATEGORIES, HERO_IMG, STATES } from "@/lib/data";
import { api, ProductCard, VoiceSearch, type Listing } from "@/components/ui";

const ICONS: Record<string, any> = { Sprout, Leaf, Shield, Truck, Cog, Droplets, Wheat, Recycle, Beef, Wrench, SprayCan, Zap };

export default function Home() {
  const { t, lang } = useLang();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [recent, setRecent] = useState<Listing[]>([]);
  const [rentals, setRentals] = useState<Listing[]>([]);
  const [nearby, setNearby] = useState<Listing[]>([]);
  const [user, setUser] = useState<any>(null);

  async function load() {
    try {
      const [f, r, rt] = await Promise.all([
        api("/api/listings?type=sell"), api("/api/listings?sort=newest"), api("/api/listings?type=rent"),
      ]);
      setFeatured(f.listings.slice(0, 4)); setRecent(r.listings.slice(0, 4)); setRentals(rt.listings.slice(0, 4));
    } catch {}
  }
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      api("/api/seed", { method: "POST" }).catch(() => {}).finally(() => { void load(); });
    } else {
      void load();
    }
    api("/api/me").then((d) => setUser(d.user)).catch(() => {});
  }, []);
  useEffect(() => {
    if (user?.state) api(`/api/listings?state=${encodeURIComponent(user.state)}`).then((d) => setNearby(d.listings.slice(0, 4))).catch(() => {});
  }, [user]);

  const catName = (c: any) => lang === "hi" ? c.hi : lang === "mr" ? c.mr : c.en;
  const testimonials = [
    { name: "Ramesh Patil, Pune", text: "I rented a tractor for my farm through KrishiConnect. Very easy and trusted." },
    { name: "Sunita Deshmukh, Nashik", text: "Sold my vermicompost directly to nearby farmers. No middlemen!" },
    { name: "Anil Jadhav, Kolhapur", text: "Found soybean seeds at a fair price in my own village." },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img src={HERO_IMG} alt="Indian farmer in wheat field" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-950/90 via-green-900/70 to-green-900/30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:py-28">
          <p className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-green-950"><Sprout size={14} /> KrishiConnect</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight text-white lg:text-6xl">{t("tagline")}</h1>
          <p className="mt-4 max-w-xl text-lg text-green-100">{t("heroSub")}</p>
          <form className="mt-8 flex max-w-xl gap-2" onSubmit={(e) => { e.preventDefault(); router.push(`/browse?q=${encodeURIComponent(q)}`); }}>
            <div className="relative flex-1"><Search className="absolute left-3 top-3.5 text-green-700" size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} className="w-full rounded-full py-3.5 pl-10 pr-4 text-sm shadow-lg outline-none" /></div>
            <VoiceSearch onResult={(v) => { setQ(v); router.push(`/browse?q=${encodeURIComponent(v)}`); }} />
            <button className="rounded-full bg-yellow-400 px-6 font-bold text-green-950 shadow-lg hover:bg-yellow-300">{t("search")}</button>
          </form>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/browse" className="rounded-full bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-600">{t("browseProducts")}</Link>
            <Link href="/sell" className="rounded-full bg-white px-6 py-3 font-bold text-green-900 hover:bg-green-50">{t("sellProducts")}</Link>
            <Link href="/browse?type=rent" className="rounded-full border-2 border-white px-6 py-3 font-bold text-white hover:bg-white/10">{t("rentEquipment")}</Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-green-950 lg:text-3xl">{t("popularCategories")}</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => { const Icon = ICONS[c.icon] || Sprout; return (
            <Link key={c.slug} href={`/browse?category=${c.slug}`} className="group rounded-2xl border border-green-100 bg-white p-4 text-center shadow-sm transition hover:border-green-400 hover:shadow-md">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-green-100 text-green-800 group-hover:bg-green-800 group-hover:text-white"><Icon size={24} /></span>
              <p className="mt-2 text-sm font-semibold text-green-950">{catName(c)}</p>
            </Link>); })}
        </div>
      </section>

      {/* FEATURED */}
      <Section title={t("featuredProducts")} items={featured} href="/browse?type=sell" />
      {/* RECENT */}
      <Section title={t("recentlyAdded")} items={recent} href="/browse" />
      {/* RENTALS */}
      <Section title={t("equipmentForRent")} items={rentals} href="/browse?type=rent" />
      {/* NEARBY */}
      {user?.state ? <Section title={t("nearbyProducts")} items={nearby} href={`/browse?state=${encodeURIComponent(user.state)}`} note={t("homeNearby")} /> : (
        <section className="mx-auto max-w-7xl px-4 py-6"><div className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-800">{t("setLocationHint")}</div></section>
      )}

      {/* HOW IT WORKS */}
      <section className="bg-green-50 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-extrabold text-green-950 lg:text-3xl">{t("howItWorks")}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[["step1", "step1d"], ["step2", "step2d"], ["step3", "step3d"], ["step4", "step4d"], ["step5", "step5d"]].map(([a, b], i) => (
              <div key={a} className="rounded-2xl bg-white p-5 text-center shadow-sm"><span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-green-800 font-bold text-white">{i + 1}</span><h3 className="mt-3 font-bold text-green-950">{t(a)}</h3><p className="mt-1 text-sm text-slate-600">{t(b)}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-center text-2xl font-extrabold text-green-950 lg:text-3xl">{t("whyChoose")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[[Users, "why1", "why1d"], [MapPin, "why2", "why2d"], [Truck, "why3", "why3d"], [Languages, "why4", "why4d"], [BadgeCheck, "why5", "why5d"]].map(([Icon, a, b]: any) => (
            <div key={a} className="rounded-2xl border border-green-100 bg-white p-5 text-center shadow-sm"><Icon className="mx-auto text-green-700" size={30} /><h3 className="mt-3 font-bold text-green-950">{t(a)}</h3><p className="mt-1 text-sm text-slate-600">{t(b)}</p></div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-green-950 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-extrabold text-white lg:text-3xl">{t("testimonials")}</h2>
          <p className="mt-2 text-center text-xs text-green-300">{t("sampleNote")}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((x) => <div key={x.name} className="rounded-2xl bg-green-900 p-6"><p className="text-green-100">“{x.text}”</p><p className="mt-4 font-bold text-yellow-400">{x.name}</p></div>)}
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, items, href, note }: { title: string; items: Listing[]; href: string; note?: string }) {
  const { t } = useLang();
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-end justify-between"><div><h2 className="text-2xl font-extrabold text-green-950">{title}</h2>{note && <p className="text-sm text-slate-500">{note}</p>}</div><Link href={href} className="flex items-center gap-1 font-bold text-green-800 hover:underline">{t("viewDetails")} <ArrowRight size={16} /></Link></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((l) => <ProductCard key={l.id} l={l} />)}</div>
    </section>
  );
}

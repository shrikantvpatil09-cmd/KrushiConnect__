
"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sprout, Heart, MessageCircle, Bell, Menu, X, Globe, LayoutDashboard, LogOut, Star, MapPin, Search, Mic } from "lucide-react";
import { useLang, LANGS, type Lang } from "@/lib/i18n";
import { fmtINR } from "@/lib/data";

export function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-green-900 px-5 py-3 text-sm font-medium text-white shadow-2xl">{msg}</div>;
}

export function useToast() {
  const [msg, setMsg] = useState("");

  const show = useCallback((m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  }, []);

  return { msg, show };
}

export async function api(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function Navbar() {
  const { t, lang, setLang } = useLang();
  const [user, setUser] = useState<any>(null);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const path = usePathname();

  const refresh = useCallback(async () => {
    try {
      const d = await api("/api/me");
      setUser(d.user);
      setUnread(d.unread || 0);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const i = setInterval(() => void refresh(), 15000);
    return () => clearInterval(i);
  }, [path, refresh]);

  async function logout() {
    await api("/api/auth", {
      method: "POST",
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/", label: t("home") },
    { href: "/browse", label: t("browse") },
    { href: "/browse?type=sell", label: t("buy") },
    { href: "/sell", label: t("sell") },
    { href: "/browse?type=rent", label: t("rent") },
    { href: "/browse", label: t("categories") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-green-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-800 text-white">
            <Sprout size={22} />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold text-green-900">KrishiConnect</span>
            <span className="hidden text-[10px] text-green-700 sm:block">{t("tagline")}</span>
          </span>
        </Link>

        <form
          className="mx-2 hidden flex-1 md:flex"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/browse?q=${encodeURIComponent(q)}`);
          }}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 text-green-700" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-full border border-green-200 bg-green-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-green-600"
            />
          </div>
        </form>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.label} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-green-900 hover:bg-green-50">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="relative">
          <button className="flex items-center gap-1 rounded-full border border-green-200 px-3 py-2 text-sm font-semibold text-green-900">
            <Globe size={16} />
            {LANGS.find((l) => l.code === lang)?.label}
          </button>
          <div className="group relative">
            <div className="invisible absolute right-0 top-full z-50 w-36 rounded-xl border bg-white p-1 opacity-0 shadow-xl group-hover:visible group-hover:opacity-100">
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-green-50">
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {user ? (
          <>
            <Link href="/dashboard?wishlist=1" className="relative rounded-full p-2 text-green-900 hover:bg-green-50">
              <Heart size={20} />
            </Link>
            <Link href="/messages" className="relative rounded-full p-2 text-green-900 hover:bg-green-50">
              <MessageCircle size={20} />
              {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-red-600 text-[10px] font-bold text-white">{unread}</span>}
            </Link>
            <Link href="/dashboard?tab=notifications" className="relative rounded-full p-2 text-green-900 hover:bg-green-50">
              <Bell size={20} />
              {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-red-600 text-[10px] font-bold text-white">{unread}</span>}
            </Link>
            <div className="group relative">
              <button className="grid h-9 w-9 place-items-center rounded-full bg-green-800 font-bold text-white">
                {user.name?.[0]?.toUpperCase()}
              </button>
              <div className="invisible absolute right-0 top-full z-50 w-48 rounded-xl border bg-white p-1 opacity-0 shadow-xl group-hover:visible group-hover:opacity-100">
                <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-green-50">
                  <LayoutDashboard size={16} />{t("dashboard")}
                </Link>
                {user.isAdmin && <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm hover:bg-green-50">{t("admin")}</Link>}
                <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50">
                  <LogOut size={16} />{t("logout")}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-green-900 hover:bg-green-50">{t("login")}</Link>
            <Link href="/register" className="rounded-full bg-green-800 px-4 py-2 text-sm font-semibold text-white hover:bg-green-900">{t("register")}</Link>
          </>
        )}

        <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-white px-4 py-3 lg:hidden">
          {links.map((l) => (
            <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium text-green-900 hover:bg-green-50">
              {l.label}
            </Link>
          ))}
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              router.push(`/browse?q=${encodeURIComponent(q)}`);
            }}
          >
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} className="flex-1 rounded-full border px-4 py-2.5 text-sm" />
            <button className="rounded-full bg-green-800 px-4 text-white">{t("search")}</button>
          </form>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const { t, lang, setLang } = useLang();

  return (
    <footer className="mt-16 bg-green-950 text-green-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-green-700 text-white"><Sprout size={20} /></span>
            <b className="text-white">KrishiConnect</b>
          </div>
          <p className="mt-3 text-sm text-green-200">{t("footerText")}</p>
        </div>
        <div>
          <b className="text-white">{t("aboutUs")}</b>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/help">{t("help")}</Link></li>
            <li><Link href="/help">{t("faq")}</Link></li>
            <li><Link href="/help">{t("reportIssue")}</Link></li>
          </ul>
        </div>
        <div>
          <b className="text-white">{t("contactUs")}</b>
          <ul className="mt-3 space-y-2 text-sm">
            <li>support@krishiconnect.in</li>
            <li>+91 98765 43210</li>
            <li>India</li>
          </ul>
        </div>
        <div>
          <b className="text-white">{t("terms")} / {t("privacy")}</b>
          <div className="mt-3 flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code as Lang)} className={`rounded-full border px-3 py-1.5 text-xs ${lang === l.code ? "border-yellow-400 bg-yellow-400 text-green-950" : "border-green-700"}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-green-900 py-4 text-center text-xs text-green-300">{t("rights")}</div>
    </footer>
  );
}

export type Listing = {
  id: string;
  title: string;
  description: string;
  listingType: string;
  price: string;
  quantity: number;
  unit: string;
  condition: string;
  brand: string | null;
  state: string | null;
  district: string | null;
  village: string | null;
  images: string[];
  status: string;
  views: number;
  createdAt: string;
  sellerName?: string;
  sellerRating?: number;
  sellerVerified?: boolean;
  categoryName?: string;
  hourlyPrice?: string | null;
  dailyPrice?: string | null;
  weeklyPrice?: string | null;
  exchangeFor?: string | null;
  securityDeposit?: string | null;
  rentalTerms?: string | null;
  seller?: any;
};

export function ProductCard({ l }: { l: Listing }) {
  const { t } = useLang();
  const typeLabel: Record<string, string> = {
    sell: t("sellT"),
    rent: t("rentT"),
    exchange: t("exchange"),
    free: t("free"),
    wanted: t("wanted"),
  };
  const price =
    l.listingType === "free" ? t("free") :
    l.listingType === "exchange" ? t("exchange") :
    l.listingType === "rent" ? `${fmtINR(l.dailyPrice || l.price)}${t("perDay")}` :
    fmtINR(l.price);

  return (
    <Link href={`/listing/${l.id}`} className="group overflow-hidden rounded-2xl border border-green-100 bg-white shadow-sm transition hover:shadow-lg">
      <div className="relative h-44 overflow-hidden bg-green-50">
        <img
          src={l.images?.[0] || "https://images.pexels.com/photos/20445169/pexels-photo-20445169.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"}
          alt={l.title}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-2 top-2 rounded-full bg-green-800 px-2.5 py-1 text-[11px] font-bold text-white">{typeLabel[l.listingType] || l.listingType}</span>
        {l.status !== "active" && <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">{l.status === "sold" ? t("sold") : t("paused")}</span>}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-bold text-green-950">{l.title}</h3>
        <p className="mt-1 text-lg font-extrabold text-green-800">{price} <span className="text-xs font-medium text-slate-500">/ {l.unit}</span></p>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1"><MapPin size={13} />{[l.village, l.district, l.state].filter(Boolean).join(", ") || "India"}</span>
          {l.sellerRating ? <span className="flex items-center gap-1 font-semibold text-amber-600"><Star size={13} fill="currentColor" />{Number(l.sellerRating).toFixed(1)}</span> : null}
        </div>
        <p className="mt-1 text-xs text-slate-500">{l.sellerName}{l.sellerVerified ? " ✓" : ""}</p>
      </div>
    </Link>
  );
}

export function VoiceSearch({ onResult }: { onResult: (q: string) => void }) {
  const { t, lang } = useLang();
  const [err, setErr] = useState("");

  function start() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErr(t("voiceUnsupported"));
      return;
    }
    const rec = new SR();
    rec.lang = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
    rec.onresult = (e: any) => onResult(e.results[0][0].transcript);
    rec.onerror = () => setErr(t("voiceUnsupported"));
    rec.start();
  }

  return (
    <span>
      <button type="button" onClick={start} title={t("voiceSearch")} className="rounded-full border border-green-200 p-2.5 text-green-800">
        <Mic size={18} />
      </button>
      {err && <span className="ml-2 text-xs text-red-600">{err}</span>}
    </span>
  );
}

export function Stars({ n }: { n: number }) {
  return <span className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} className={i <= n ? "fill-amber-400 text-amber-400" : "text-slate-300"} />)}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/50 py-14 text-center text-slate-600">{children}</div>;
}

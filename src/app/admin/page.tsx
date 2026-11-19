
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { api, Toast, useToast, Empty } from "@/components/ui";

export default function Admin() {
  const { t } = useLang();
  const router = useRouter();
  const toast = useToast();
  const [d, setD] = useState<any>(null);
  const [tab, setTab] = useState("users");
  const [cat, setCat] = useState({ slug: "", nameEn: "", nameHi: "", nameMr: "" });

  const load = useCallback(async () => {
    try {
      setD(await api("/api/admin"));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      if (/Authentication|Access denied|401|403/i.test(msg)) {
        router.push("/login");
      } else {
        toast.show(msg);
      }
    }
  }, [router, toast.show]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  async function patch(body: any) {
    try {
      await api("/api/admin", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      toast.show(t("saved"));
      void load();
    } catch (e: any) {
      toast.show(e.message);
    }
  }

  if (!d) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">
        <div className="h-64 animate-pulse rounded-3xl bg-green-100" />
      </div>
    );
  }

  const s = d.stats;
  const tabs = [
    ["users", t("manageUsers")],
    ["listings", t("manageListings")],
    ["categories", t("manageCategories")],
    ["reports", t("manageReports")],
    ["reviews", t("manageReviews")],
    ["logs", t("auditLogs")],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Toast msg={toast.msg} />
      <h1 className="text-2xl font-extrabold text-green-950">{t("admin")} — KrishiConnect</h1>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          [t("totalUsers"), s.totalUsers],
          [t("farmer"), s.farmers],
          [t("supplier"), s.suppliers],
          [t("dealer"), s.dealers],
          [t("totalListings"), s.totalListings],
          [t("activeListings"), s.activeListings],
          [t("myRentals"), s.totalRentals],
          [t("completedTx"), s.completedTx],
          [t("pendingRequests"), s.pendingRequests],
          [t("reportedListings"), s.reportedListings],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
            <p className="text-2xl font-extrabold text-green-800">{v}</p>
            <p className="text-xs text-slate-500">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${tab === id ? "bg-green-800 text-white" : "bg-white border"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="mt-5 space-y-2">
          {d.users.map((u: any) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex-1">
                <p className="font-bold">{u.name} {u.isVerified && "✓"}</p>
                <p className="text-xs text-slate-500">{u.email} · {u.userType} · {u.state || ""}</p>
              </div>
              {u.isSuspended ? (
                <button onClick={() => patch({ action: "activate-user", id: u.id })} className="rounded-lg bg-green-800 px-3 py-2 text-xs font-bold text-white">{t("activate")}</button>
              ) : (
                <button onClick={() => patch({ action: "suspend-user", id: u.id })} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">{t("suspend")}</button>
              )}
              {!u.isVerified && (
                <button onClick={() => patch({ action: "verify-user", id: u.id })} className="rounded-lg border px-3 py-2 text-xs font-bold">{t("verified")}</button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "listings" && (
        <div className="mt-5 space-y-2">
          {d.listings.map((l: any) => (
            <div key={l.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex-1">
                <p className="font-bold">{l.title}</p>
                <p className="text-xs text-slate-500">{l.listingType} · {l.status} · ₹{l.price}</p>
              </div>
              <button onClick={() => patch({ action: "remove-listing", id: l.id })} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">{t("remove")}</button>
            </div>
          ))}
        </div>
      )}

      {tab === "categories" && (
        <div className="mt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void patch({ action: "add-category", ...cat });
            }}
            className="flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-sm"
          >
            <input required placeholder="slug" value={cat.slug} onChange={(e) => setCat({ ...cat, slug: e.target.value })} className="rounded-lg border p-2" />
            <input required placeholder="English" value={cat.nameEn} onChange={(e) => setCat({ ...cat, nameEn: e.target.value })} className="rounded-lg border p-2" />
            <input placeholder="हिंदी" value={cat.nameHi} onChange={(e) => setCat({ ...cat, nameHi: e.target.value })} className="rounded-lg border p-2" />
            <input placeholder="मराठी" value={cat.nameMr} onChange={(e) => setCat({ ...cat, nameMr: e.target.value })} className="rounded-lg border p-2" />
            <button className="rounded-lg bg-green-800 px-4 py-2 text-sm font-bold text-white">+ {t("category")}</button>
          </form>

          <div className="mt-3 space-y-2">
            {d.categories.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <p className="flex-1 font-bold">{c.nameEn} / {c.nameHi} / {c.nameMr}</p>
                <span className="text-xs">{c.isActive ? t("active") : t("paused")}</span>
                <button onClick={() => patch({ action: "toggle-category", id: c.id })} className="rounded-lg border px-3 py-2 text-xs font-bold">{t("edit")}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="mt-5 space-y-2">
          {d.reports.length ? d.reports.map((r: any) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex-1">
                <p className="font-bold">{r.reason}</p>
                <p className="text-xs text-slate-500">{r.details} · {r.status}</p>
              </div>
              <button onClick={() => patch({ action: "resolve-report", id: r.id, status: "resolved" })} className="rounded-lg bg-green-800 px-3 py-2 text-xs font-bold text-white">{t("complete")}</button>
            </div>
          )) : <Empty>{t("noResults")}</Empty>}
        </div>
      )}

      {tab === "reviews" && (
        <div className="mt-5 space-y-2">
          {d.reviews.map((r: any) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex-1">
                <p className="font-bold">{r.rating} ★ {r.isHidden ? "(hidden)" : ""}</p>
                <p className="text-sm text-slate-600">{r.comment}</p>
              </div>
              <button onClick={() => patch({ action: "hide-review", id: r.id })} className="rounded-lg border px-3 py-2 text-xs font-bold">{t("remove")}</button>
            </div>
          ))}
        </div>
      )}

      {tab === "logs" && (
        <div className="mt-5 space-y-2">
          {d.logs.map((l: any) => (
            <div key={l.id} className="rounded-2xl bg-white p-4 text-sm shadow-sm">
              <b>{l.action}</b> · {l.targetType} · {new Date(l.createdAt).toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n";
import { api, Toast, useToast } from "@/components/ui";

export default function Login() {
  const { t } = useLang();
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState({ email: "", password: "" });
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try { const d = await api("/api/auth", { method: "POST", body: JSON.stringify({ action: "login", ...f }) }); if (d.user?.preferredLanguage) localStorage.setItem("kc_lang", d.user.preferredLanguage); router.push("/dashboard"); router.refresh(); }
    catch (err: any) { toast.show(err.message); }
  }
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <Toast msg={toast.msg} />
      <div className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-green-950">{t("welcomeBack")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("loginSub")}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="mb-1 block text-sm font-semibold">{t("email")}</label><input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="w-full rounded-xl border border-green-200 px-3 py-2.5" /></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("password")}</label><input required type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className="w-full rounded-xl border border-green-200 px-3 py-2.5" /></div>
          <button className="w-full rounded-full bg-green-800 py-3 font-bold text-white">{t("login")}</button>
        </form>
        <p className="mt-4 rounded-xl bg-green-50 p-3 text-center text-xs text-green-800">Demo: demo@krishiconnect.in / demo1234</p>
        <p className="mt-4 text-center text-sm">{t("noAccount")} <Link href="/register" className="font-bold text-green-800">{t("register")}</Link></p>
      </div>
    </div>
  );
}

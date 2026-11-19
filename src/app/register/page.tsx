"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang, LANGS } from "@/lib/i18n";
import { STATES } from "@/lib/data";
import { api, Toast, useToast } from "@/components/ui";

export default function Register() {
  const { t } = useLang();
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState<any>({ name: "", email: "", phone: "", password: "", confirmPassword: "", userType: "farmer", state: "", district: "", taluka: "", village: "", pincode: "", preferredLanguage: "en" });
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  const inputCls = "w-full rounded-xl border border-green-200 px-3 py-2.5 text-sm";
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.password !== f.confirmPassword) { toast.show(t("passwordMismatch")); return; }
    try { await api("/api/auth", { method: "POST", body: JSON.stringify({ action: "register", ...f }) }); router.push("/dashboard"); router.refresh(); }
    catch (err: any) { toast.show(err.message); }
  }
  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <Toast msg={toast.msg} />
      <div className="rounded-3xl border border-green-100 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-green-950">{t("register")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("registerSub")}</p>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="mb-1 block text-sm font-semibold">{t("fullName")} *</label><input required value={f.name} onChange={(e) => set("name", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("email")} *</label><input required type="email" value={f.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("mobile")}</label><input value={f.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("password")} *</label><input required type="password" value={f.password} onChange={(e) => set("password", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("confirmPassword")} *</label><input required type="password" value={f.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("userType")}</label><select value={f.userType} onChange={(e) => set("userType", e.target.value)} className={inputCls}><option value="farmer">{t("farmer")}</option><option value="supplier">{t("supplier")}</option><option value="equipment_owner">{t("equipmentOwner")}</option><option value="dealer">{t("dealer")}</option></select></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("preferredLanguage")}</label><select value={f.preferredLanguage} onChange={(e) => set("preferredLanguage", e.target.value)} className={inputCls}>{LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("state")}</label><select value={f.state} onChange={(e) => set("state", e.target.value)} className={inputCls}><option value="">—</option>{Object.keys(STATES).map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("district")}</label><select value={f.district} onChange={(e) => set("district", e.target.value)} className={inputCls}><option value="">—</option>{(STATES[f.state] || []).map((d) => <option key={d}>{d}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("taluka")}</label><input value={f.taluka} onChange={(e) => set("taluka", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("village")}</label><input value={f.village} onChange={(e) => set("village", e.target.value)} className={inputCls} /></div>
          <div><label className="mb-1 block text-sm font-semibold">{t("pincode")}</label><input value={f.pincode} onChange={(e) => set("pincode", e.target.value)} className={inputCls} /></div>
          <button className="rounded-full bg-green-800 py-3 font-bold text-white sm:col-span-2">{t("createAccount")}</button>
        </form>
        <p className="mt-4 text-center text-sm">{t("alreadyHave")} <Link href="/login" className="font-bold text-green-800">{t("login")}</Link></p>
      </div>
    </div>
  );
}

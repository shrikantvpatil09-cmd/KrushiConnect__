"use client";
import { useLang } from "@/lib/i18n";

export default function Help() {
  const { t } = useLang();
  const faqs = [
    { q: "How do I sell on KrishiConnect?", a: "Register, go to Sell, fill the listing form with photos and price, then publish." },
    { q: "How does equipment rental work?", a: "Find a rental listing, choose dates, submit a request. The owner accepts, then you coordinate pickup. Payment is direct between buyer and seller." },
    { q: "Is payment handled on the platform?", a: "No. KrishiConnect coordinates direct buyer-seller deals (cash/offline). No card data is stored." },
    { q: "Can I use KrishiConnect in Hindi or Marathi?", a: "Yes! Use the language switcher in the navbar — English, हिंदी, मराठी." },
    { q: "How do I report a fake listing?", a: "Open the listing and click Report Listing. Our admin team reviews all reports." },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-green-950">{t("help")} & {t("faq")}</h1>
      <div className="mt-6 space-y-4">{faqs.map((f) => <div key={f.q} className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"><h3 className="font-bold text-green-950">{f.q}</h3><p className="mt-2 text-sm text-slate-600">{f.a}</p></div>)}</div>
      <div className="mt-8 rounded-2xl bg-green-50 p-6"><h2 className="font-bold text-green-950">{t("contactUs")}</h2><p className="mt-2 text-sm">support@krishiconnect.in · +91 98765 43210</p><p className="mt-1 text-sm">{t("aboutUs")}: {t("footerText")}</p></div>
    </div>
  );
}

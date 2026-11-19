"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { api, Empty } from "@/components/ui";

function MsgInner() {
  const { t } = useLang();
  const sp = useSearchParams();
  const [convs, setConvs] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(sp.get("conv"));
  const [msgs, setMsgs] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [me, setMe] = useState<any>(null);

  async function loadConvs() { try { const d = await api("/api/messages"); setConvs(d.conversations); if (!active && d.conversations[0]) setActive(d.conversations[0].id); } catch {} }
  async function loadMsgs(id: string) { try { const d = await api(`/api/messages?conv=${id}`); setMsgs(d.messages); } catch {} }
  useEffect(() => { api("/api/me").then((d) => setMe(d.user)).catch(() => {}); loadConvs(); }, []);
  useEffect(() => { if (active) { loadMsgs(active); const i = setInterval(() => loadMsgs(active), 8000); return () => clearInterval(i); } }, [active]);

  async function send(e: React.FormEvent) { e.preventDefault(); if (!body.trim() || !active) return; await api("/api/messages", { method: "POST", body: JSON.stringify({ conversationId: active, body }) }); setBody(""); loadMsgs(active); loadConvs(); }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-extrabold text-green-950">{t("messages")}</h1>
      <div className="mt-5 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2">{convs.length ? convs.map((c) => <button key={c.id} onClick={() => setActive(c.id)} className={`w-full rounded-2xl border p-4 text-left ${active === c.id ? "border-green-700 bg-green-50" : "bg-white"}`}><p className="font-bold text-green-950">{c.listingTitle || "Conversation"}</p><p className="line-clamp-1 text-sm text-slate-500">{c.lastMessage}</p></button>) : <Empty>{t("noConversations")}</Empty>}</div>
        <div className="flex h-[520px] flex-col rounded-2xl border border-green-100 bg-white shadow-sm">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m) => <div key={m.id} className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.senderId === me?.id ? "ml-auto bg-green-800 text-white" : "bg-green-50"}`}><p>{m.body}</p><p className="mt-1 text-[10px] opacity-70">{m.senderName} · {new Date(m.createdAt).toLocaleTimeString()}</p></div>)}
            {!msgs.length && <Empty>{t("noConversations")}</Empty>}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t p-3"><input value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("typeMessage")} className="flex-1 rounded-full border border-green-200 px-4 py-2.5 text-sm" /><button className="flex items-center gap-2 rounded-full bg-green-800 px-5 font-bold text-white"><Send size={16} />{t("send")}</button></form>
        </div>
      </div>
    </div>
  );
}
export default function Messages() { return <Suspense><MsgInner /></Suspense>; }

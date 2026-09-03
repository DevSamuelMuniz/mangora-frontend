"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, LoaderCircle, Send, Sparkles } from "lucide-react";

import { apiRequest } from "@/lib/api/client";

type Message = { role: "assistant" | "user"; text: string };

const SUGGESTIONS = [
  "Como estão as vendas hoje?",
  "O que está com estoque baixo?",
  "Como está o financeiro?",
  "Como aumentar as vendas?",
];

export default function AiManager() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Olá! Sou o Gerente de IA da sua loja. Acompanho vendas, produtos, estoque, financeiro e pedidos em tempo real — e estou aqui para ajudar a fazer sua loja crescer. Como posso ajudar?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, loading]);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const result = await apiRequest<{ reply: string }>("/ai-manager/chat", { method: "POST", body: JSON.stringify({ message: question }) });
      setMessages((prev) => [...prev, { role: "assistant", text: result.reply }]);
    } catch (cause) {
      setMessages((prev) => [...prev, { role: "assistant", text: cause instanceof Error ? cause.message : "Não consegui responder agora. Tente de novo em instantes." }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <div>
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-orange-600"><Bot className="size-3.5" />Gerente de IA</p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl">Seu especialista em finanças e marketing</h1>
        <p className="mt-1 text-xs text-slate-500">Conhece sua loja inteira: vendas, produtos, estoque, financeiro e pedidos. Pergunte o que quiser.</p>
      </div>

      <div ref={listRef} className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[85%] gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
              {message.role === "assistant" && <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl bg-[#123d2b] text-white"><Bot className="size-4" /></span>}
              <div className={`rounded-2xl px-4 py-3 text-xs leading-5 whitespace-pre-line ${message.role === "user" ? "bg-orange-600 text-white" : "border border-slate-200 bg-slate-50 text-slate-800"}`}>{message.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] gap-2">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl bg-[#123d2b] text-white"><Bot className="size-4" /></span>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400"><LoaderCircle className="size-4 animate-spin text-orange-500" />Consultando sua loja...</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => void ask(suggestion)} disabled={loading} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 transition hover:border-orange-400 hover:text-orange-600 disabled:opacity-50"><Sparkles className="size-3 text-orange-500" />{suggestion}</button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-2 flex gap-2">
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Pergunte sobre vendas, estoque, finanças ou como crescer..." disabled={loading} className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 disabled:opacity-60" />
        <button type="submit" disabled={loading || !input.trim()} className="flex h-12 items-center gap-1.5 rounded-xl bg-[#123d2b] px-4 text-xs font-black text-white transition hover:bg-[#147a45] disabled:opacity-50"><Send className="size-3.5" />Enviar</button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, Pencil, X } from "lucide-react";

import { STORE_FONTS, type PublicStore } from "@/types/public-store";

type FieldType = "text" | "textarea" | "url" | "color" | "select" | "toggle";
type Field = { field: string; label: string; type: FieldType; options?: string[] };

const SECTIONS: { title: string; fields: Field[] }[] = [
  {
    title: "Conteúdo",
    fields: [
      { field: "tradeName", label: "Nome da loja", type: "text" },
      { field: "publicTagline", label: "Lema / subtítulo", type: "text" },
      { field: "publicDescription", label: "Descrição", type: "textarea" },
      { field: "publicAnnouncement", label: "Anúncio (barra do topo)", type: "text" },
      { field: "publicHours", label: "Horário de funcionamento", type: "text" },
      { field: "publicFooterNote", label: "Mensagem do rodapé", type: "text" },
      { field: "publicInstagram", label: "Instagram", type: "text" },
      { field: "publicWhatsapp", label: "WhatsApp", type: "text" },
    ],
  },
  {
    title: "Imagens",
    fields: [
      { field: "publicLogoUrl", label: "Logo (link)", type: "url" },
      { field: "publicCoverUrl", label: "Imagem de capa (link)", type: "url" },
    ],
  },
  {
    title: "Cores",
    fields: [
      { field: "publicBrandColor", label: "Cor principal", type: "color" },
      { field: "publicTitleColor", label: "Cor do título", type: "color" },
      { field: "publicTextColor", label: "Cor do texto", type: "color" },
      { field: "publicBackgroundColor", label: "Cor de fundo", type: "color" },
      { field: "publicPanelColor", label: "Cor das superfícies", type: "color" },
    ],
  },
  {
    title: "Aparência",
    fields: [
      { field: "publicTheme", label: "Tema", type: "select", options: ["light", "dark"] },
      { field: "publicFont", label: "Fonte", type: "select", options: ["moderno", "classico", "mono"] },
      { field: "publicCoverEnabled", label: "Fundo do topo", type: "toggle" },
    ],
  },
];

const STORE_KEY: Record<string, keyof PublicStore["company"]> = {
  tradeName: "tradeName",
  publicLogoUrl: "logoUrl",
  publicCoverUrl: "coverUrl",
  publicTagline: "tagline",
  publicDescription: "description",
  publicAnnouncement: "announcement",
  publicHours: "hours",
  publicFooterNote: "footerNote",
  publicInstagram: "instagram",
  publicWhatsapp: "whatsapp",
};

function valueOf(company: PublicStore["company"], field: string): string {
  switch (field) {
    case "publicBrandColor": return company.brandColor ?? "";
    case "publicTitleColor": return company.titleColor ?? "";
    case "publicTextColor": return company.textColor ?? "";
    case "publicBackgroundColor": return company.backgroundColor ?? "";
    case "publicPanelColor": return company.panelColor ?? "";
    case "publicTheme": return company.theme;
    case "publicFont": return company.font;
    case "publicCoverEnabled": return company.coverEnabled ? "true" : "false";
    default: return String(company[STORE_KEY[field]] ?? "");
  }
}

function optionLabel(field: string, value: string): string {
  if (field === "publicTheme") return value === "dark" ? "🌙 Escuro" : "☀️ Claro";
  if (field === "publicFont") return STORE_FONTS[value]?.label ?? value;
  return value;
}

type EditDrawerProps = {
  open: boolean;
  focusField: string | null;
  company: PublicStore["company"];
  onClose: () => void;
  onSave: (changes: Record<string, string>) => Promise<void>;
};

/** Drawer lateral com todas as possibilidades de edição da página. */
export default function EditDrawer({ open, focusField, company, onClose, onSave }: EditDrawerProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const original = useMemo(() => Object.fromEntries(SECTIONS.flatMap((s) => s.fields).map((f) => [f.field, valueOf(company, f.field)])), [company]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const target = listRef.current?.querySelector<HTMLElement>(`[data-field="${focusField}"]`);
      target?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setDraft(original);
    setError("");
    onClose();
  }

  async function save() {
    const changes = Object.fromEntries(Object.entries(draft).filter(([field, value]) => value !== original[field]));
    if (!Object.keys(changes).length) { close(); return; }
    setSaving(true); setError("");
    try {
      await onSave(changes);
      close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={close} className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[var(--panel)] shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Editar página"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
          <div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-xl text-white" style={{ backgroundColor: "var(--brand)" }}><Pencil className="size-4" /></span><div><p className="text-sm font-black">Editar página</p><p className="text-[9px] text-[var(--muted)]">Tudo o que aparece na sua loja online.</p></div></div>
          <button type="button" onClick={close} aria-label="Fechar editor" className="flex size-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--line)]"><X className="size-4" /></button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4">
          {SECTIONS.map((section) => (
            <section key={section.title} className="mb-5">
              <p className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">{section.title}</p>
              <div className="space-y-3">
                {section.fields.map((field) => (
                  <FieldRow key={field.field} field={field} value={draft[field.field] ?? original[field.field]} focused={focusField === field.field} onChange={(value) => setDraft((prev) => ({ ...prev, [field.field]: value }))} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="border-t border-[var(--line)] px-5 py-4">
          {error && <p role="alert" className="mb-2 rounded-xl bg-red-50 p-2.5 text-[10px] font-semibold text-red-700">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={close} disabled={saving} className="h-11 flex-1 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] disabled:opacity-50">Cancelar</button>
            <button type="button" onClick={() => void save()} disabled={saving} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black text-white disabled:opacity-60" style={{ backgroundColor: "var(--brand)" }}>{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Pencil className="size-3.5" />}Salvar alterações</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function FieldRow({ field, value, focused, onChange }: { field: Field; value: string; focused: boolean; onChange: (value: string) => void }) {
  const inputClass = `h-10 w-full rounded-xl border bg-[var(--bg)] px-3 text-xs text-[var(--ink)] outline-none transition focus:ring-2 focus:ring-[var(--brand)]/30 ${focused ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/30" : "border-[var(--line)]"}`;
  return (
    <label data-field={field.field} className={`block rounded-xl border p-3 transition ${focused ? "border-[var(--brand)]/60 bg-[var(--brand)]/5" : "border-transparent"}`}>
      <span className="mb-1.5 block text-[10px] font-bold text-[var(--ink)]">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className={`${inputClass} h-auto resize-none py-2`} placeholder="Digite o texto" />
      ) : field.type === "select" ? (
        <select value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>{field.options?.map((option) => <option key={option} value={option}>{optionLabel(field.field, option)}</option>)}</select>
      ) : field.type === "toggle" ? (
        <button type="button" onClick={() => onChange(value === "true" ? "false" : "true")} className={`flex h-10 w-full items-center justify-between rounded-xl border px-3 text-xs font-bold ${value === "true" ? "border-[var(--brand)] text-[var(--ink)]" : "border-[var(--line)] text-[var(--muted)]"}`}>
          <span>Fundo do topo</span><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${value === "true" ? "text-white" : ""}`} style={value === "true" ? { backgroundColor: "var(--brand)" } : undefined}>{value === "true" ? "Ligado" : "Desligado"}</span>
        </button>
      ) : field.type === "color" ? (
        <div className="flex items-center gap-2">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ff6b1a"} onChange={(event) => onChange(event.target.value)} aria-label={`Cor de ${field.label}`} className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--line)] bg-white p-0.5" />
          <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="#RRGGBB (vazio = tema)" className={`${inputClass} font-mono`} />
          {value && <button type="button" onClick={() => onChange("")} className="shrink-0 text-[10px] font-bold text-[var(--muted)] hover:text-red-500">Limpar</button>}
        </div>
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} type={field.type === "url" ? "url" : "text"} placeholder={field.type === "url" ? "https://…" : "Digite o texto"} className={inputClass} />
      )}
    </label>
  );
}

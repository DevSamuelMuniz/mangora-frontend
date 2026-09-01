"use client";

import { useState } from "react";
import { Check, ImageIcon, LayoutTemplate, LoaderCircle, Palette, Pencil, Type, X } from "lucide-react";
import Link from "next/link";

import { STORE_FONTS, type PublicStore } from "@/types/public-store";
import { ELEMENTS, elementLabel } from "./storeElements";

type FieldType = "text" | "textarea" | "url" | "color" | "select" | "toggle";
type FieldInfo = { label: string; type: FieldType; options?: string[] };

export const FIELD_INFO: Record<string, FieldInfo> = {
    tradeName: { label: "Nome da loja", type: "text" },
    publicTagline: { label: "Lema / subtítulo", type: "text" },
    publicDescription: { label: "Descrição", type: "textarea" },
    publicAnnouncement: { label: "Anúncio (barra do topo)", type: "text" },
    publicHours: { label: "Horário de funcionamento", type: "text" },
    publicOrderNote: { label: "Orientação do pedido", type: "textarea" },
    publicFooterNote: { label: "Mensagem do rodapé", type: "text" },
    publicInstagram: { label: "Instagram", type: "text" },
    publicWhatsapp: { label: "WhatsApp", type: "text" },
    publicLogoUrl: { label: "Logo", type: "url" },
    publicCoverUrl: { label: "Imagem de capa", type: "url" },
    publicBrandColor: { label: "Cor principal", type: "color" },
    publicTitleColor: { label: "Cor do título", type: "color" },
    publicTextColor: { label: "Cor do texto", type: "color" },
    publicBackgroundColor: { label: "Cor de fundo", type: "color" },
    publicPanelColor: { label: "Cor das superfícies", type: "color" },
    publicHeaderColor: { label: "Cor do cabeçalho", type: "color" },
    publicAnnouncementColor: { label: "Cor do anúncio", type: "color" },
    publicButtonColor: { label: "Cor dos botões", type: "color" },
    publicPriceColor: { label: "Cor dos preços", type: "color" },
    publicCardColor: { label: "Cor dos cards", type: "color" },
    publicTheme: { label: "Tema", type: "select", options: ["light", "dark"] },
    publicFont: { label: "Fonte", type: "select", options: ["moderno", "classico", "mono"] },
    publicIconStyle: { label: "Estilo dos ícones", type: "select", options: ["rounded", "square", "outline"] },
    publicBackgroundPattern: { label: "Textura do fundo", type: "select", options: ["none", "dots", "grid", "waves"] },
    publicCoverEnabled: { label: "Fundo do topo", type: "toggle" },
};

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
    publicOrderNote: "orderNote",
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
        case "publicIconStyle": return company.iconStyle;
        case "publicBackgroundPattern": return company.backgroundPattern;
        case "publicCoverEnabled": return company.coverEnabled ? "true" : "false";
        case "publicHeaderColor": return company.headerColor ?? "";
        case "publicAnnouncementColor": return company.announcementColor ?? "";
        case "publicButtonColor": return company.buttonColor ?? "";
        case "publicPriceColor": return company.priceColor ?? "";
        case "publicCardColor": return company.cardColor ?? "";
        default:
            if (field.startsWith("elementColor:")) return company.elementColors?.[field.slice(14)] ?? "";
            return String(company[STORE_KEY[field]] ?? "");
    }
}

function optionLabel(field: string, value: string): string {
    if (field === "publicTheme") return value === "dark" ? "🌙 Escuro" : "☀️ Claro";
    if (field === "publicFont") return STORE_FONTS[value]?.label ?? value;
    if (field === "publicIconStyle") return ({ rounded: "Arredondados", square: "Quadrados", outline: "Contorno" }[value] ?? value);
    if (field === "publicBackgroundPattern") return ({ none: "Sem textura", dots: "Pontos", grid: "Grade", waves: "Ondas" }[value] ?? value);
    return value;
}

function fieldInfo(field: string): FieldInfo {
    if (field.startsWith("elementColor:")) return { label: `Cor de ${elementLabel(field.slice(14))}`, type: "color" };
    return FIELD_INFO[field];
}

function labelFor(field: string): string {
    if (field.startsWith("elementColor:")) return `Cor de ${elementLabel(field.slice(14))}`;
    return FIELD_INFO[field]?.label ?? field;
}

const GROUPS: { title: string; icon: typeof Type; fields: string[] }[] = [
    { title: "Textos", icon: Type, fields: ["tradeName", "publicTagline", "publicDescription", "publicAnnouncement", "publicHours", "publicOrderNote", "publicFooterNote", "publicInstagram", "publicWhatsapp"] },
    { title: "Imagens", icon: ImageIcon, fields: ["publicLogoUrl", "publicCoverUrl", "publicCoverEnabled"] },
    { title: "Cores padrão", icon: Palette, fields: ["publicBrandColor", "publicTitleColor", "publicTextColor", "publicBackgroundColor", "publicPanelColor", "publicHeaderColor", "publicAnnouncementColor", "publicButtonColor", "publicPriceColor", "publicCardColor"] },
    { title: "Cores por elemento", icon: Palette, fields: ELEMENTS.map((item) => `elementColor:${item.id}`) },
    { title: "Estilo", icon: LayoutTemplate, fields: ["publicTheme", "publicFont", "publicIconStyle", "publicBackgroundPattern"] },
];

type StorefrontSidebarProps = {
    company: PublicStore["company"];
    selectedField: string | null;
    onSelectField: (field: string | null) => void;
    onSave: (field: string, value: string) => Promise<void>;
};

/** Sidebar fixa de edição: lista todo o que pode ser editado e edita o campo selecionado. */
export default function StorefrontSidebar({ company, selectedField, onSelectField, onSave }: StorefrontSidebarProps) {
    return (
        <aside className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-[var(--line)] bg-[var(--panel)] shadow-2xl sm:w-[21.5rem]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
                <div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-xl text-white" style={{ backgroundColor: "var(--brand)" }}><Pencil className="size-4" /></span><div><p className="text-sm font-black">Editar página</p><p className="text-[9px] text-[var(--muted)]">Selecione o que quer ajustar.</p></div></div>
                <Link href="/configuracoes" className="flex h-8 items-center rounded-xl px-3 text-[10px] font-black text-white" style={{ backgroundColor: "var(--brand)" }}>Concluir</Link>
            </div>

            {selectedField && (
                <div className="border-b border-[var(--line)] px-4 py-4">
                    <FieldEditor key={selectedField} field={selectedField} info={fieldInfo(selectedField)} company={company} onSave={onSave} onCancel={() => onSelectField(null)} />
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4">
                {GROUPS.map(({ title, icon: Icon, fields }) => (
                    <section key={title} className="mb-5">
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[var(--muted)]"><Icon className="size-3.5" />{title}</div>
                        <div className="grid grid-cols-1 gap-1.5">
                            {fields.map((field) => (
                                <button key={field} type="button" onClick={() => onSelectField(field)} className={`flex min-h-9 items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-left text-[10px] font-bold transition ${selectedField === field ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]" : "border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--brand)]"}`}>
                                    <span className="truncate">{labelFor(field)}</span>
                                    {selectedField === field && <Check className="size-3.5 shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </aside>
    );
}

function FieldEditor({ field, info, company, onSave, onCancel }: { field: string; info: FieldInfo; company: PublicStore["company"]; onSave: (field: string, value: string) => Promise<void>; onCancel: () => void }) {
    const [value, setValue] = useState(() => valueOf(company, field));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function save() {
        setSaving(true); setError("");
        try {
            await onSave(field, value);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Não foi possível salvar.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-black text-[var(--ink)]">Editar {info.label}</p>
                <button type="button" onClick={onCancel} aria-label="Fechar editor" className="flex size-6 items-center justify-center rounded-md text-[var(--muted)] hover:bg-[var(--line)]"><X className="size-3.5" /></button>
            </div>
            {error && <p role="alert" className="mb-2 rounded-lg bg-red-50 p-2 text-[10px] font-semibold text-red-700">{error}</p>}
            <FieldRow field={field} info={info} value={value} onChange={setValue} />
            <div className="mt-3 flex gap-2">
                <button type="button" onClick={onCancel} disabled={saving} className="h-9 flex-1 rounded-lg border border-[var(--line)] text-[10px] font-bold text-[var(--muted)] disabled:opacity-50">Cancelar</button>
                <button type="button" onClick={() => void save()} disabled={saving} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-[10px] font-black text-white disabled:opacity-60" style={{ backgroundColor: "var(--brand)" }}>{saving ? <LoaderCircle className="size-3.5 animate-spin" /> : <Pencil className="size-3" />}Salvar</button>
            </div>
        </div>
    );
}

function FieldRow({ field, info, value, onChange }: { field: string; info: FieldInfo; value: string; onChange: (value: string) => void }) {
    const inputClass = "h-10 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 text-xs text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30";
    return (
        <div>
            {info.type === "textarea" ? (
                <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} autoFocus className={`${inputClass} h-auto resize-none py-2.5`} placeholder="Digite o texto" />
            ) : info.type === "select" ? (
                <select value={value} onChange={(event) => onChange(event.target.value)} autoFocus className={inputClass}>{info.options?.map((option) => <option key={option} value={option}>{optionLabel(field, option)}</option>)}</select>
            ) : info.type === "toggle" ? (
                <button type="button" onClick={() => onChange(value === "true" ? "false" : "true")} className={`flex h-11 w-full items-center justify-between rounded-lg border px-3 text-xs font-bold ${value === "true" ? "border-[var(--brand)] text-[var(--ink)]" : "border-[var(--line)] text-[var(--muted)]"}`}>
                    <span>Fundo do topo</span><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${value === "true" ? "text-white" : ""}`} style={value === "true" ? { backgroundColor: "var(--brand)" } : undefined}>{value === "true" ? "Ligado" : "Desligado"}</span>
                </button>
            ) : info.type === "color" ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ff6b1a"} onChange={(event) => onChange(event.target.value)} aria-label={`Cor de ${info.label}`} className="h-11 w-14 cursor-pointer rounded-lg border border-[var(--line)] bg-white p-1" />
                        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="#RRGGBB (vazio = padrão)" className={`${inputClass} font-mono`} />
                    </div>
                    {value && <button type="button" onClick={() => onChange("")} className="text-[10px] font-bold text-[var(--muted)] hover:text-red-500">Limpar (usar cor padrão)</button>}
                </div>
            ) : (
                <input value={value} onChange={(event) => onChange(event.target.value)} autoFocus type={info.type === "url" ? "url" : "text"} placeholder={info.type === "url" ? "https://…" : "Digite o texto"} className={inputClass} />
            )}
        </div>
    );
}

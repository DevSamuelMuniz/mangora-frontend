"use client";

import { useState } from "react";
import { ImageIcon, LayoutTemplate, LoaderCircle, Palette, Pencil, Type, X } from "lucide-react";

import { STORE_FONTS, type PublicStore } from "@/types/public-store";
import { ELEMENTS, elementLabel } from "./storeElements";

type FieldType = "text" | "textarea" | "url" | "color" | "select" | "toggle";
type FieldInfo = { label: string; type: FieldType; options?: string[] };

const FIELD_INFO: Record<string, FieldInfo> = {
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

type EditDrawerProps = {
    open: boolean;
    focusField: string | null;
    focusColorField?: string | null;
    company: PublicStore["company"];
    onClose: () => void;
    onSave: (field: string, value: string) => Promise<void>;
    onSelectField: (field: string) => void;
};

/** Drawer lateral que desliza com a edição apenas do componente clicado. */
export default function EditDrawer({ open, focusField, focusColorField, company, onClose, onSave, onSelectField }: EditDrawerProps) {
    const info = focusField ? fieldInfo(focusField) : null;
    return (
        <div className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
            <div onClick={onClose} className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
            <aside
                className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[var(--panel)] shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
                role="dialog"
                aria-modal="true"
                aria-label="Editar componente"
            >
                {open && focusField === "__all" && <FieldMenu onClose={onClose} onSelect={onSelectField} />}
                {open && info && focusField && (
                    <FieldEditor key={`${focusField}:${focusColorField ?? ""}`} field={focusField} info={info} colorField={focusColorField} company={company} onClose={onClose} onSave={onSave} />
                )}
            </aside>
        </div>
    );
}

function fieldInfo(field: string): FieldInfo {
    if (field.startsWith("elementColor:")) return { label: `Cor de ${elementLabel(field.slice(14))}`, type: "color" };
    return FIELD_INFO[field];
}

function labelFor(field: string): string {
    if (field.startsWith("elementColor:")) return `Cor de ${elementLabel(field.slice(14))}`;
    return FIELD_INFO[field]?.label ?? field;
}

const GROUPS = [
    { title: "Textos", icon: Type, fields: ["tradeName", "publicTagline", "publicDescription", "publicAnnouncement", "publicHours", "publicOrderNote", "publicFooterNote", "publicInstagram", "publicWhatsapp"] },
    { title: "Imagens", icon: ImageIcon, fields: ["publicLogoUrl", "publicCoverUrl", "publicCoverEnabled"] },
    { title: "Cores padrão", icon: Palette, fields: ["publicBrandColor", "publicTitleColor", "publicTextColor", "publicBackgroundColor", "publicPanelColor", "publicHeaderColor", "publicAnnouncementColor", "publicButtonColor", "publicPriceColor", "publicCardColor"] },
    { title: "Cores por elemento", icon: Palette, fields: ELEMENTS.map((item) => `elementColor:${item.id}`) },
    { title: "Estilo", icon: LayoutTemplate, fields: ["publicTheme", "publicFont", "publicIconStyle", "publicBackgroundPattern"] },
];

function FieldMenu({ onClose, onSelect }: { onClose: () => void; onSelect: (field: string) => void }) {
    return <><div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4"><div><p className="text-sm font-black">Personalizar página</p><p className="mt-0.5 text-[9px] text-[var(--muted)]">Escolha o que deseja ajustar.</p></div><button type="button" onClick={onClose} aria-label="Fechar" className="grid size-8 place-items-center rounded-lg hover:bg-[var(--line)]"><X className="size-4" /></button></div><div className="flex-1 space-y-6 overflow-y-auto p-5">{GROUPS.map(({ title, icon: Icon, fields }) => <section key={title}><div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[var(--muted)]"><Icon className="size-3.5" />{title}</div><div className="grid grid-cols-2 gap-2">{fields.map((field) => <button key={field} type="button" onClick={() => onSelect(field)} className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-left text-[10px] font-bold text-[var(--ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]">{labelFor(field)}</button>)}</div></section>)}</div></>;
}

function FieldEditor({ field, info, colorField, company, onClose, onSave }: { field: string; info: FieldInfo; colorField?: string | null; company: PublicStore["company"]; onClose: () => void; onSave: (field: string, value: string) => Promise<void> }) {
    const related = colorField && colorField !== field ? colorField : null;
    const relatedInfo = related ? fieldInfo(related) : null;
    const [draft, setDraft] = useState<Record<string, string>>(() => {
        const base: Record<string, string> = { [field]: valueOf(company, field) };
        if (related) base[related] = valueOf(company, related);
        return base;
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    function setValue(key: string, value: string) {
        setDraft((prev) => ({ ...prev, [key]: value }));
    }

    async function save() {
        setSaving(true); setError("");
        try {
            for (const [key, value] of Object.entries(draft)) {
                if (value !== valueOf(company, key)) await onSave(key, value);
            }
            onClose();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Não foi possível salvar.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
                <div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-xl text-white" style={{ backgroundColor: "var(--brand)" }}><Pencil className="size-4" /></span><div><p className="text-sm font-black">Editar {info.label}</p><p className="text-[9px] text-[var(--muted)]">Alteração aplicada direto na sua loja.</p></div></div>
                <button type="button" onClick={onClose} aria-label="Fechar editor" className="flex size-8 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--line)]"><X className="size-4" /></button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
                <FieldRow field={field} info={info} value={draft[field] ?? valueOf(company, field)} onChange={(value) => setValue(field, value)} />
                {related && relatedInfo && <FieldRow field={related} info={relatedInfo} value={draft[related] ?? valueOf(company, related)} onChange={(value) => setValue(related, value)} />}
            </div>

            <div className="border-t border-[var(--line)] px-5 py-4">
                {error && <p role="alert" className="mb-2 rounded-xl bg-red-50 p-2.5 text-[10px] font-semibold text-red-700">{error}</p>}
                <div className="flex gap-2">
                    <button type="button" onClick={onClose} disabled={saving} className="h-11 flex-1 rounded-xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] disabled:opacity-50">Cancelar</button>
                    <button type="button" onClick={() => void save()} disabled={saving} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black text-white disabled:opacity-60" style={{ backgroundColor: "var(--brand)" }}>{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Pencil className="size-3.5" />}Salvar</button>
                </div>
            </div>
        </>
    );
}

function FieldRow({ field, info, value, onChange }: { field: string; info: FieldInfo; value: string; onChange: (value: string) => void }) {
    const inputClass = "h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 text-xs text-[var(--ink)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30";
    return (
        <div>
            <p className="mb-2 text-[10px] font-bold text-[var(--ink)]">{info.label}</p>
            {info.type === "textarea" ? (
                <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} autoFocus className={`${inputClass} h-auto resize-none py-2.5`} placeholder="Digite o texto" />
            ) : info.type === "select" ? (
                <select value={value} onChange={(event) => onChange(event.target.value)} autoFocus className={inputClass}>{info.options?.map((option) => <option key={option} value={option}>{optionLabel(field, option)}</option>)}</select>
            ) : info.type === "toggle" ? (
                <button type="button" onClick={() => onChange(value === "true" ? "false" : "true")} className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 text-xs font-bold ${value === "true" ? "border-[var(--brand)] text-[var(--ink)]" : "border-[var(--line)] text-[var(--muted)]"}`}>
                    <span>Fundo do topo</span><span className={`rounded-full px-3 py-1 text-[10px] font-black ${value === "true" ? "text-white" : ""}`} style={value === "true" ? { backgroundColor: "var(--brand)" } : undefined}>{value === "true" ? "Ligado" : "Desligado"}</span>
                </button>
            ) : info.type === "color" ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#ff6b1a"} onChange={(event) => onChange(event.target.value)} aria-label={`Cor de ${info.label}`} className="h-12 w-16 cursor-pointer rounded-xl border border-[var(--line)] bg-white p-1" />
                        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="#RRGGBB (vazio = tema)" className={`${inputClass} font-mono`} />
                    </div>
                    {value && <button type="button" onClick={() => onChange("")} className="text-[10px] font-bold text-[var(--muted)] hover:text-red-500">Limpar (usar cor do tema)</button>}
                </div>
            ) : (
                <input value={value} onChange={(event) => onChange(event.target.value)} autoFocus type={info.type === "url" ? "url" : "text"} placeholder={info.type === "url" ? "https://…" : "Digite o texto"} className={inputClass} />
            )}
        </div>
    );
}

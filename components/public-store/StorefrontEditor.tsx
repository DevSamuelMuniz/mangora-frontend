"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";

import { useCompanySettings, useSaveCompanySettings } from "@/features/settings/hooks/useSettings";
import { useSaleOptions } from "@/features/sales/hooks/useSales";
import { useToast } from "@/components/ui/toast";
import type { PublicStore } from "@/types/public-store";
import PublicStorefront from "./PublicStorefront";

/** Editor visual da página: monta a loja com as settings atuais e salva cada campo via PATCH. */
export default function StorefrontEditor() {
    const { data: company, isLoading: loadingCompany } = useCompanySettings();
    const { data: options, isLoading: loadingOptions } = useSaleOptions();
    const save = useSaveCompanySettings();
    const toast = useToast();
    const [overrides, setOverrides] = useState<Record<string, string>>({});

    if (loadingCompany || loadingOptions || !company || !options) {
        return (
            <div className="flex min-h-screen items-center justify-center text-sm text-[#123d2b]">
                <LoaderCircle className="mr-2 size-5 animate-spin text-orange-500" /> Carregando editor...
            </div>
        );
    }

    const products: PublicStore["products"] = options.products
        .filter((product) => product.active && product.publicVisible && (!product.trackStock || product.stock - product.reservedStock > 0))
        .map((product) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            description: product.description,
            price: Number(product.price),
            imageUrl: product.imageUrl,
            available: product.trackStock ? product.stock - product.reservedStock : null,
        }));

    const pick = (field: string, fallback: string | null) => (field in overrides ? overrides[field] : fallback);
    const store: PublicStore = {
        company: {
            tradeName: pick("tradeName", company.tradeName) || company.tradeName,
            slug: company.slug,
            description: pick("publicDescription", company.publicDescription),
            whatsapp: pick("publicWhatsapp", company.publicWhatsapp),
            phone: company.phone,
            city: company.city,
            state: company.state,
            pickupEnabled: company.publicPickupEnabled,
            deliveryEnabled: company.publicDeliveryEnabled,
            brandColor: pick("publicBrandColor", company.publicBrandColor) || company.publicBrandColor,
            logoUrl: pick("publicLogoUrl", company.publicLogoUrl),
            coverUrl: pick("publicCoverUrl", company.publicCoverUrl),
            announcement: pick("publicAnnouncement", company.publicAnnouncement),
            hours: pick("publicHours", company.publicHours),
            footerNote: pick("publicFooterNote", company.publicFooterNote),
            tagline: pick("publicTagline", company.publicTagline),
            instagram: pick("publicInstagram", company.publicInstagram),
            theme: (pick("publicTheme", company.publicTheme) || "light") as "light" | "dark",
            orderNote: pick("publicOrderNote", company.publicOrderNote),
            titleColor: pick("publicTitleColor", company.publicTitleColor),
            textColor: pick("publicTextColor", company.publicTextColor),
            backgroundColor: pick("publicBackgroundColor", company.publicBackgroundColor),
            panelColor: pick("publicPanelColor", company.publicPanelColor),
            font: pick("publicFont", company.publicFont) || "moderno",
            iconStyle: (pick("publicIconStyle", company.publicIconStyle) || "rounded") as PublicStore["company"]["iconStyle"],
            backgroundPattern: (pick("publicBackgroundPattern", company.publicBackgroundPattern) || "none") as PublicStore["company"]["backgroundPattern"],
            coverEnabled: "publicCoverEnabled" in overrides ? overrides.publicCoverEnabled === "true" : company.publicCoverEnabled,
            headerColor: pick("publicHeaderColor", company.publicHeaderColor),
            announcementColor: pick("publicAnnouncementColor", company.publicAnnouncementColor),
            buttonColor: pick("publicButtonColor", company.publicButtonColor),
            priceColor: pick("publicPriceColor", company.publicPriceColor),
            cardColor: pick("publicCardColor", company.publicCardColor),
            elementColors: {
                ...(company.publicElementColors ?? {}),
                ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key.startsWith("elementColor:")).map(([key, value]) => [key.slice(14), value])),
            },
        },
        products,
    };

    async function handleEdit(field: string, value: string) {
        if (field === "tradeName" && !value.trim()) {
            toast.error("O nome da loja não pode ficar vazio.");
            throw new Error("Nome vazio.");
        }
        setOverrides((prev) => ({ ...prev, [field]: value }));
        try {
            const payload = field.startsWith("elementColor:")
                ? { publicElementColors: { ...(company?.publicElementColors ?? {}), [field.slice(14)]: value } }
                : field === "publicCoverEnabled"
                    ? { [field]: value === "true" }
                    : { [field]: value || null };
            await save.mutateAsync(payload);
            toast.success("Salvo");
        } catch (cause) {
            setOverrides((prev) => { const next = { ...prev }; delete next[field]; return next; });
            toast.error(cause instanceof Error ? cause.message : "Não foi possível salvar.");
            throw cause;
        }
    }

    return (
        <div>
            <PublicStorefront store={store} editable onEdit={handleEdit} />
        </div>
    );
}

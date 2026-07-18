"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ImageIcon,
  LoaderCircle,
  PackagePlus,
  Save,
} from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import type { Product, ProductInput } from "@/types/product";
import type { Category } from "@/types/category";

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const editing = Boolean(productId);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([apiRequest<Category[]>("/categories?itemType=PRODUCT"), productId ? apiRequest<Product>(`/products/${productId}`) : Promise.resolve(null)])
      .then(([categoryData, data]) => {
        if (mounted) { setCategories(categoryData.filter((item) => item.active || item.id === data?.categoryId)); setProduct(data); }
      })
      .catch((requestError: unknown) => {
        if (mounted) {
          setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o produto.");
        }
      })
      .finally(() => {
        if (mounted) setLoadingProduct(false);
      });

    return () => {
      mounted = false;
    };
  }, [productId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const sku = String(formData.get("sku") ?? "").trim().toUpperCase();
    const categoryId = String(formData.get("categoryId") ?? "");
    const category = categories.find((item) => item.id === categoryId)?.name ?? "";
    const price = Number(formData.get("price"));
    const stock = productId ? (product?.stock ?? 0) : Number(formData.get("stock"));
    const minimumStock = Number(formData.get("minimumStock"));

    if (name.length < 2) {
      setError("Informe um nome de produto válido.");
      return;
    }
    if (sku.length < 2) {
      setError("Informe um SKU válido.");
      return;
    }
    if (!category) {
      setError("Selecione uma categoria.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Informe um preço maior que zero.");
      return;
    }
    if ((!productId && (!Number.isInteger(stock) || stock < 0)) || !Number.isInteger(minimumStock) || minimumStock < 0) {
      setError("Os valores de estoque devem ser números inteiros iguais ou maiores que zero.");
      return;
    }

    const optional = (field: string) => String(formData.get(field) ?? "").trim() || null;
    const payload: ProductInput = {
      name,
      sku,
      category,
      categoryId,
      price,
      minimumStock,
      trackStock: true,
      active: formData.get("status") === "active",
      barcode: optional("barcode"),
      description: optional("description"),
      imageUrl: optional("imageUrl"),
      publicVisible: formData.get("publicVisible") === "on",
      ...(!productId && { stock }),
    };

    try {
      setLoading(true);
      await apiRequest<Product>(productId ? `/products/${productId}` : "/products", {
        method: productId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      router.push("/produtos");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar o produto.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingProduct) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <LoaderCircle className="size-6 animate-spin text-violet-600" />
        <span className="ml-2 text-sm font-semibold text-slate-500">Carregando produto...</span>
      </div>
    );
  }

  if (editing && !product) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-bold text-red-700">{error || "Produto não encontrado."}</p>
        <Link href="/produtos" className="mt-4 inline-flex h-10 items-center rounded-xl bg-white px-4 text-xs font-bold text-violet-600 shadow-sm">
          Voltar para produtos
        </Link>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="flex items-start gap-3">
        <Link href="/produtos" aria-label="Voltar para produtos" className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-violet-600">
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Catálogo</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {editing ? "Editar produto" : "Novo produto"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {editing ? "Atualize as informações do produto selecionado." : "Preencha as informações para cadastrar o produto."}
          </p>
        </div>
      </div>

      <form key={product?.id ?? "new"} onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><PackagePlus className="size-4" /></div>
            <div>
              <h2 className="text-sm font-bold text-slate-950">Informações principais</h2>
              <p className="mt-0.5 text-[10px] text-slate-400">Dados usados para identificar e vender o produto.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nome do produto" id="name">
              <input id="name" name="name" type="text" required minLength={2} maxLength={160} defaultValue={product?.name} placeholder="Ex.: Camiseta básica preta" className={inputClassName} />
            </Field>
            <Field label="SKU" id="sku">
              <input id="sku" name="sku" type="text" required minLength={2} maxLength={64} defaultValue={product?.sku} placeholder="Ex.: CAM-001" className={inputClassName} />
            </Field>
            <Field label="Categoria" id="categoryId">
              <select id="categoryId" name="categoryId" required defaultValue={product?.categoryId ?? ""} className={inputClassName}>
                <option value="" disabled>Selecione uma categoria</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
            <Field label="Status" id="status">
              <select id="status" name="status" defaultValue={product?.active === false ? "inactive" : "active"} className={inputClassName}>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </Field>
            <Field label="Preço de venda" id="price">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                <input id="price" name="price" type="number" required min="0.01" step="0.01" defaultValue={product?.price} placeholder="0,00" className={`${inputClassName} pl-10`} />
              </div>
            </Field>
            <Field label="Código de barras (opcional)" id="barcode">
              <input id="barcode" name="barcode" type="text" maxLength={64} defaultValue={product?.barcode ?? ""} placeholder="7890000000000" className={inputClassName} />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-sm font-bold text-slate-950">Estoque</h2>
            <p className="mt-0.5 text-[10px] text-slate-400">Defina a quantidade atual e o alerta de reposição.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {editing ? (
                <div>
                  <p className="mb-1.5 text-xs font-bold text-slate-700">Estoque atual</p>
                  <div className="flex h-11 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5">
                    <span className="text-sm font-black text-slate-800">{product?.stock ?? 0} un.</span>
                    <Link href={`/estoque/movimentacao?productId=${product?.id ?? ""}`} className="text-[10px] font-bold text-violet-600">Movimentar estoque</Link>
                  </div>
                </div>
              ) : (
                <Field label="Estoque inicial" id="stock">
                  <input id="stock" name="stock" type="number" required min="0" step="1" defaultValue="0" className={inputClassName} />
                </Field>
              )}
              <Field label="Estoque mínimo" id="minimumStock">
                <input id="minimumStock" name="minimumStock" type="number" required min="0" step="1" defaultValue={product?.minimumStock ?? 0} className={inputClassName} />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2"><ImageIcon className="size-4 text-cyan-600" /><h2 className="text-sm font-bold text-slate-950">Imagem</h2></div>
            <p className="mt-1 text-[10px] text-slate-400">Informe uma imagem pública em HTTP ou HTTPS.</p>
            <Field label="URL da imagem (opcional)" id="imageUrl" className="mt-4">
              <input id="imageUrl" name="imageUrl" type="url" defaultValue={product?.imageUrl ?? ""} placeholder="https://..." className={inputClassName} />
            </Field>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><span><span className="block text-xs font-bold text-slate-700">Exibir na página online</span><span className="text-[9px] text-slate-400">Permite que clientes vejam e peçam este item.</span></span><input type="checkbox" name="publicVisible" defaultChecked={product?.publicVisible ?? true} className="size-4 accent-violet-600" /></label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <Field label="Descrição (opcional)" id="description">
            <textarea id="description" name="description" rows={3} maxLength={2000} defaultValue={product?.description ?? ""} placeholder="Informações adicionais sobre o produto..." className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
          </Field>
        </div>

        {!categories.length && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">Crie uma categoria de produto antes de continuar. <Link href="/categorias" className="font-bold underline">Gerenciar categorias</Link></div>}
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/produtos" className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Cancelar</Link>
          <button type="submit" disabled={loading || !categories.length} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0">
            {loading ? <><LoaderCircle className="size-4 animate-spin" />Salvando...</> : <><Save className="size-4" />{editing ? "Salvar alterações" : "Salvar produto"}</>}
          </button>
        </div>
      </form>
    </section>
  );
}

const inputClassName = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100";

function Field({ label, id, children, className = "" }: { label: string; id: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

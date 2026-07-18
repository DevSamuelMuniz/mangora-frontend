"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  MoreHorizontal,
  Package,
  PackagePlus,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { apiRequest } from "@/lib/api/client";
import type { Product } from "@/types/product";

const PAGE_SIZE = 6;
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type StockFilter = "all" | "available" | "low" | "out";
type StatusFilter = "all" | "active" | "inactive";

export default function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setProducts((await apiRequest<Product[]>("/products")).filter((item) => item.itemType === "PRODUCT"));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os produtos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    apiRequest<Product[]>("/products")
      .then((data) => {
        if (mounted) setProducts(data.filter((item) => item.itemType === "PRODUCT"));
      })
      .catch((requestError: unknown) => {
        if (mounted) {
          setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os produtos.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        product.sku.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        product.barcode?.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      const matchesCategory = category === "all" || product.category === category;
      const matchesStatus =
        status === "all" || (status === "active" ? product.active : !product.active);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "available" && product.trackStock && product.stock - product.reservedStock > product.minimumStock) ||
        (stockFilter === "low" && product.trackStock && product.stock - product.reservedStock > 0 && product.stock - product.reservedStock <= product.minimumStock) ||
        (stockFilter === "out" && product.trackStock && product.stock - product.reservedStock === 0);

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [category, products, search, status, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setStockFilter("all");
    setPage(1);
  }

  async function confirmDelete() {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      setError("");
      await apiRequest<void>(`/products/${productToDelete.id}`, { method: "DELETE" });
      setProducts((current) => current.filter((product) => product.id !== productToDelete.id));
      setSelectedProduct((current) => (current?.id === productToDelete.id ? null : current));
      setProductToDelete(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível excluir o produto.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600">Catálogo</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Produtos</h1>
            <p className="mt-1 text-xs text-slate-500">Organize produtos, preços e disponibilidade em estoque.</p>
          </div>
          <Link href="/produtos/novo" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl">
            <PackagePlus className="size-4" />
            Novo produto
          </Link>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_190px_150px_170px]">
            <label className="relative">
              <span className="sr-only">Buscar produtos</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por nome, SKU ou código..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100" />
            </label>
            <FilterSelect label="Categoria" value={category} onChange={(value) => { setCategory(value); setPage(1); }} options={categories.map((item) => ({ value: item, label: item }))} />
            <FilterSelect label="Status" value={status} onChange={(value) => { setStatus(value as StatusFilter); setPage(1); }} options={[{ value: "active", label: "Ativos" }, { value: "inactive", label: "Inativos" }]} />
            <FilterSelect label="Estoque" value={stockFilter} onChange={(value) => { setStockFilter(value as StockFilter); setPage(1); }} options={[{ value: "available", label: "Disponível" }, { value: "low", label: "Estoque baixo" }, { value: "out", label: "Sem estoque" }]} />
          </div>
        </div>

        {error && products.length > 0 && (
          <div role="alert" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            <span>{error}</span>
            <button type="button" onClick={() => void loadProducts()} className="shrink-0 font-bold underline">Tentar novamente</button>
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center text-slate-500">
              <LoaderCircle className="size-5 animate-spin text-violet-600" />
              <span className="ml-2 text-xs font-semibold">Carregando produtos...</span>
            </div>
          ) : error && products.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-600"><AlertTriangle className="size-5" /></div>
              <h2 className="mt-4 text-sm font-bold text-slate-900">Não foi possível carregar o catálogo</h2>
              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{error}</p>
              <button type="button" onClick={() => void loadProducts()} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-violet-600 hover:bg-violet-50"><RefreshCw className="size-3.5" />Tentar novamente</button>
            </div>
          ) : visibleProducts.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] border-collapse text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    <tr><th className="px-5 py-3">Produto</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Preço</th><th className="px-4 py-3">Estoque</th><th className="px-4 py-3">Status</th><th className="w-16 px-4 py-3 text-center">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleProducts.map((product) => {
                      const availableStock = product.stock - product.reservedStock;
                      const lowStock = product.trackStock && availableStock > 0 && availableStock <= product.minimumStock;
                      return (
                        <tr key={product.id} className="transition hover:bg-slate-50">
                          <td className="px-5 py-3.5"><div className="flex items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-cyan-50 text-violet-600"><Package className="size-4.5" /></div><div className="min-w-0"><p className="max-w-64 truncate text-xs font-bold text-slate-800">{product.name}</p><p className="mt-1 text-[10px] text-slate-400">SKU: {product.sku}</p></div></div></td>
                          <td className="px-4 py-3.5 text-xs text-slate-600">{product.category}</td>
                          <td className="px-4 py-3.5 text-xs font-bold text-slate-800">{currencyFormatter.format(product.price)}</td>
                          <td className="px-4 py-3.5"><div className="flex items-center gap-2"><span className={`text-xs font-bold ${product.trackStock && availableStock === 0 ? "text-red-600" : lowStock ? "text-amber-600" : "text-slate-800"}`}>{product.trackStock ? `${availableStock} disp.${product.reservedStock ? ` · ${product.reservedStock} reserv.` : ""}` : "Não controlado"}</span>{lowStock && <AlertTriangle className="size-3.5 text-amber-500" />}</div></td>
                          <td className="px-4 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${product.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{product.active ? "Ativo" : "Inativo"}</span></td>
                          <td className="px-4 py-3.5 text-center">
                            <details className="relative inline-block text-left">
                              <summary aria-label={`Ações do produto ${product.name}`} className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal className="size-4" /></summary>
                              <div className="absolute right-0 z-20 mt-1 w-36 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl">
                                <button type="button" onClick={() => setSelectedProduct(product)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Eye className="size-3.5" />Visualizar</button>
                                <Link href={`/produtos/${product.id}/editar`} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Pencil className="size-3.5" />Editar</Link>
                                <button type="button" onClick={() => setProductToDelete(product)} className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" />Excluir</button>
                              </div>
                            </details>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-[11px] text-slate-500">Mostrando {visibleProducts.length} de {filteredProducts.length} produto(s)</p>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Página anterior" disabled={currentPage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="size-4" /></button>
                  <span className="min-w-20 text-center text-[11px] font-semibold text-slate-600">Página {currentPage} de {totalPages}</span>
                  <button type="button" aria-label="Próxima página" disabled={currentPage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="size-4" /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Package className="size-5" /></div>
              <h2 className="mt-4 text-sm font-bold text-slate-900">Nenhum produto encontrado</h2>
              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{products.length === 0 ? "Cadastre o primeiro produto para começar seu catálogo." : "Ajuste os filtros para visualizar o catálogo."}</p>
              {products.length === 0 ? <Link href="/produtos/novo" className="mt-4 inline-flex h-10 items-center rounded-xl bg-violet-600 px-4 text-xs font-bold text-white">Cadastrar produto</Link> : <button type="button" onClick={clearFilters} className="mt-4 h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-violet-600 transition hover:bg-violet-50">Limpar filtros</button>}
            </div>
          )}
        </div>
      </section>

      {selectedProduct && <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      {productToDelete && <DeleteProductModal product={productToDelete} loading={deleting} onCancel={() => setProductToDelete(null)} onConfirm={() => void confirmDelete()} />}
    </>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return (
    <label><span className="sr-only">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"><option value="all">{label}: todos</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
  );
}

function ProductDetailsModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Detalhes do produto</p><h2 className="mt-1 text-lg font-black text-slate-950">{product.name}</h2></div><button type="button" onClick={onClose} aria-label="Fechar detalhes" className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"><X className="size-4" /></button></div>
        <dl className="mt-5 grid grid-cols-2 gap-3">
          {[["SKU", product.sku], ["Categoria", product.category], ["Preço", currencyFormatter.format(product.price)], ["Estoque físico", product.trackStock ? `${product.stock} unidade(s)` : "Não controlado"], ["Reservado", `${product.reservedStock} unidade(s)`], ["Disponível", `${product.stock - product.reservedStock} unidade(s)`], ["Estoque mínimo", `${product.minimumStock} unidade(s)`], ["Status", product.active ? "Ativo" : "Inativo"], ["Código de barras", product.barcode || "Não informado"]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><dt className="text-[10px] font-semibold text-slate-400">{label}</dt><dd className="mt-1 break-words text-xs font-bold text-slate-800">{value}</dd></div>)}
        </dl>
        {product.description && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{product.description}</p>}
        <div className="mt-5 flex justify-end"><Link href={`/produtos/${product.id}/editar`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-bold text-white"><Pencil className="size-3.5" />Editar produto</Link></div>
      </div>
    </div>
  );
}

function DeleteProductModal({ product, loading, onCancel, onConfirm }: { product: Product; loading: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div onMouseDown={(event) => { if (!loading && event.target === event.currentTarget) onCancel(); }} className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><Trash2 className="size-4.5" /></div>
        <h2 className="mt-4 text-base font-black text-slate-950">Excluir produto?</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">O produto <strong className="text-slate-700">{product.name}</strong> será removido permanentemente do catálogo desta empresa.</p>
        <div className="mt-5 flex justify-end gap-2"><button type="button" disabled={loading} onClick={onCancel} className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Cancelar</button><button type="button" disabled={loading} onClick={onConfirm} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60">{loading && <LoaderCircle className="size-3.5 animate-spin" />}{loading ? "Excluindo..." : "Excluir"}</button></div>
      </div>
    </div>
  );
}

export default async function StockMovementPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;
  const { redirect } = await import("next/navigation");
  redirect(`/estoque?acao=movimentar${productId ? `&productId=${encodeURIComponent(productId)}` : ""}`);
}

import { getProducts } from "./actions";
import ProductsClientPage from "./ClientPage";

export const metadata = {
  title: "Productos — ikaZa Import",
};

export default async function ProductsPage() {
  const result = await getProducts(1, 20);
  const data = result.success ? result.data : { products: [], totalCount: 0, totalPages: 0, categories: [], brands: [] };

  return <ProductsClientPage data={data} />;
}

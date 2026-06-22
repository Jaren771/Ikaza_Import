import { getProducts } from "./actions";
import ProductsClientPage from "./ClientPage";

export const metadata = {
  title: "Productos — ikaZa Import",
};

export default async function ProductsPage() {
  const result = await getProducts();
  const data = result.success ? result.data : { products: [], categories: [], brands: [] };

  return <ProductsClientPage data={data} />;
}

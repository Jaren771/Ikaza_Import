import { getBrands } from "./actions";
import BrandsClientPage from "./ClientPage";

export const metadata = {
  title: "Marcas — ikaZa Import",
};

export default async function BrandsPage() {
  const result = await getBrands();
  const brands = result.success ? result.data : [];

  return <BrandsClientPage initialBrands={brands || []} />;
}

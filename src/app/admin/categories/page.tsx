import { getCategories } from "./actions";
import CategoriesClientPage from "./ClientPage";

export const metadata = {
  title: "Categorías — ikaZa Import",
};

export default async function CategoriesPage() {
  const result = await getCategories();
  return <CategoriesClientPage initialCategories={result.success ? (result.data || []) : []} />;
}

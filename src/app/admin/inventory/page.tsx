import { getInventory } from "./actions";
import ClientPage from "./ClientPage";

export const metadata = { title: "Inventario — ikaZa Import" };

export default async function Page() {
  const result = await getInventory();
  return <ClientPage initialData={result.success ? result.data : []} />;
}

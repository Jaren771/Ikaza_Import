import { getSuppliers } from "./actions";
import ClientPage from "./ClientPage";

export const metadata = { title: "Proveedores — ikaZa Import" };

export default async function Page() {
  const result = await getSuppliers();
  return <ClientPage initialData={result.success ? result.data : []} />;
}

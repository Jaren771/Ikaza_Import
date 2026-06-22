import { getOrders } from "./actions";
import ClientPage from "./ClientPage";

export const metadata = { title: "Pedidos — ikaZa Import" };

export default async function Page() {
  const result = await getOrders();
  return <ClientPage initialData={result.success ? result.data : []} />;
}

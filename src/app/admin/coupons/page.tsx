import { getCoupons } from "./actions";
import ClientPage from "./ClientPage";

export const metadata = { title: "Cupones — ikaZa Import" };

export default async function Page() {
  const result = await getCoupons();
  return <ClientPage initialData={result.success ? result.data : []} />;
}

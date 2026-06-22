import { getBanners } from "./actions";
import ClientPage from "./ClientPage";

export const metadata = { title: "Banners — ikaZa Import" };

export default async function Page() {
  const result = await getBanners();
  return <ClientPage initialData={result.success ? result.data : []} />;
}

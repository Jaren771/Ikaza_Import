import { getDashboardStats } from "./actions";
import ClientPage from "./ClientPage";

export const metadata = { title: "Estadísticas — ikaZa Import" };

export default async function Page() {
  const result = await getDashboardStats();
  return <ClientPage data={result.success ? result.data : {}} />;
}

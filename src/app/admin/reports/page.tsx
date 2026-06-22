import { getReportsData } from "./actions";
import ClientPage from "./ClientPage";

export const metadata = { title: "Reportes — ikaZa Import" };

export default async function Page() {
  const result = await getReportsData();
  return <ClientPage data={result.success ? result.data : {}} />;
}

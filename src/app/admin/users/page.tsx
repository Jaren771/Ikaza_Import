import { getUsers } from "./actions";
import ClientPage from "./ClientPage";

export const metadata = { title: "Usuarios — ikaZa Import" };

export default async function Page() {
  const result = await getUsers();
  return <ClientPage initialData={result.success ? result.data : []} />;
}

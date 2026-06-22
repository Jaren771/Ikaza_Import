import { getWishlist } from "./actions";
import { redirect } from "next/navigation";
import ClientPage from "./ClientPage";

export const metadata = { title: "Lista de Deseos — ikaZa Import" };

export default async function Page() {
  const result = await getWishlist();
  
  if (!result.success) {
    redirect("/login");
  }

  return <ClientPage initialData={result.data} />;
}

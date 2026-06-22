import { getUserProfile } from "./actions";
import { redirect } from "next/navigation";
import ClientPage from "./ClientPage";

export const metadata = { title: "Mi Perfil — ikaZa Import" };

export default async function Page() {
  const result = await getUserProfile();
  
  if (!result.success) {
    redirect("/login");
  }

  return <ClientPage initialData={result.data} />;
}

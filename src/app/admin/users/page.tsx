import { getUsers } from "./actions";
import ClientPage from "./ClientPage";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Usuarios — ikaZa Import" };

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  const result = await getUsers();
  return <ClientPage initialData={result.success ? (result.data || []) : []} currentUserRole={session.user.role as string} />;
}

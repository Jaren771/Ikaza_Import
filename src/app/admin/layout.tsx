import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

// Layout del Panel Administrativo — Sidebar + Content
// Solo accesible para ADMIN y SUPER_ADMIN (middleware también lo protege)
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role ?? "")) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#fbf9f8" }}>
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

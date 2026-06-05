import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Importaciones — ikaZa Import",
};

// =============================================================================
// Layout del Sistema de Importación
// Separado del admin general, enfocado en contenedores y logística
// =============================================================================

export default async function ImporterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  
  // Accesible para ADMIN, SUPER_ADMIN y MANAGER (Gerente de importaciones)
  if (!["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f5f3f3" }}>
      {/* Reutilizamos el sidebar del admin porque tiene las opciones agrupadas */}
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

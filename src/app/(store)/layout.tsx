import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Layout del portal de la tienda pública
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

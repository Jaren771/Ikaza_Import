import { Package } from "lucide-react";
import Link from "next/link";

// Layout para páginas de autenticación — Pantalla dividida
// Basado en wireframes "Acceso" y "Registro" de Stitch
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Lado izquierdo — Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #002022 0%, #006065 60%, #0d7a80 100%)" }}
      >
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute -top-32 -left-32 h-96 w-96 rounded-full"
            style={{ backgroundColor: "#7dd4db" }}
          />
          <div
            className="absolute bottom-0 right-0 h-64 w-64 rounded-full"
            style={{ backgroundColor: "#feb562" }}
          />
        </div>

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Package className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="font-headline text-2xl font-bold">ikaZa</p>
            <p className="text-sm text-white/70">Import</p>
          </div>
        </Link>

        {/* Contenido central */}
        <div className="relative">
          <h2 className="font-headline text-4xl font-bold leading-tight mb-4">
            Productos importados
            <br />
            <span style={{ color: "#feb562" }}>de calidad superior</span>
          </h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Descubre miles de productos para el hogar, cocina y tecnología. 
            Envío rápido a todo el Perú.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20">
            {[
              { value: "+5K", label: "Productos" },
              { value: "+200", label: "Marcas" },
              { value: "+10K", label: "Clientes felices" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-headline text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-white/60 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer del panel */}
        <p className="relative text-sm text-white/50">
          © 2026 ikaZa Import. Todos los derechos reservados.
        </p>
      </div>

      {/* Lado derecho — Formulario */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12" style={{ backgroundColor: "#fbf9f8" }}>
        {/* Logo mobile */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #006065, #0d7a80)" }}>
            <Package className="h-6 w-6 text-white" />
          </div>
          <span className="font-headline text-xl font-bold" style={{ color: "#006065" }}>
            ikaZa Import
          </span>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

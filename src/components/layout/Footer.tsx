import Link from "next/link";
import { Package, Mail, Phone, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t" style={{ backgroundColor: "#1b1c1c", color: "#e4e2e2" }}>
      <div className="ikaza-container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "linear-gradient(135deg, #006065, #0d7a80)" }}>
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-headline text-xl font-bold text-white">ikaZa</p>
                <p className="text-xs" style={{ color: "#7dd4db" }}>Import</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#bdc9c9" }}>
              Tu destino de confianza para productos importados de calidad. 
              Hogar, cocina, tecnología y más.
            </p>
            <div className="flex gap-3">
              {[
                { href: SITE_CONFIG.social.facebook, id: "fb", label: "Facebook" },
                { href: SITE_CONFIG.social.instagram, id: "ig", label: "Instagram" },
                { href: SITE_CONFIG.social.youtube, id: "yt", label: "YouTube" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                  style={{ backgroundColor: "#004f53" }}
                  aria-label={social.label}
                >
                  {social.id === "fb" && <svg className="h-4 w-4" style={{ fill: "#7dd4db" }} viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>}
                  {social.id === "ig" && <svg className="h-4 w-4" style={{ stroke: "#7dd4db", fill: "none", strokeWidth: "2" }} viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>}
                  {social.id === "yt" && <svg className="h-4 w-4" style={{ stroke: "#7dd4db", fill: "none", strokeWidth: "2" }} viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>}
                </a>
              ))}
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h3 className="font-headline text-sm font-semibold uppercase tracking-wider mb-4 text-white">
              Tienda
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/catalog", label: "Catálogo" },
                { href: "/catalog?category=hogar", label: "Hogar" },
                { href: "/catalog?category=cocina", label: "Cocina" },
                { href: "/catalog?category=tecnologia", label: "Tecnología" },
                { href: "/catalog?isFeatured=true", label: "Ofertas" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "#bdc9c9" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cuenta */}
          <div>
            <h3 className="font-headline text-sm font-semibold uppercase tracking-wider mb-4 text-white">
              Mi Cuenta
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/login", label: "Iniciar Sesión" },
                { href: "/register", label: "Registrarme" },
                { href: "/profile", label: "Mi Perfil" },
                { href: "/orders", label: "Mis Pedidos" },
                { href: "/wishlist", label: "Lista de Deseos" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "#bdc9c9" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-headline text-sm font-semibold uppercase tracking-wider mb-4 text-white">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#7dd4db" }} />
                <span className="text-sm" style={{ color: "#bdc9c9" }}>
                  {SITE_CONFIG.address}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" style={{ color: "#7dd4db" }} />
                <a href={`tel:${SITE_CONFIG.phone}`} className="text-sm transition-colors hover:text-white" style={{ color: "#bdc9c9" }}>
                  {SITE_CONFIG.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" style={{ color: "#7dd4db" }} />
                <a href={`mailto:${SITE_CONFIG.email}`} className="text-sm transition-colors hover:text-white" style={{ color: "#bdc9c9" }}>
                  {SITE_CONFIG.email}
                </a>
              </li>
            </ul>

            {/* Métodos de pago */}
            <div className="mt-6">
              <p className="text-xs font-medium mb-2 text-white">Métodos de pago</p>
              <div className="flex gap-2 flex-wrap">
                {["Visa", "MC", "PayPal", "Culqi"].map((method) => (
                  <span
                    key={method}
                    className="rounded px-2 py-1 text-xs font-medium"
                    style={{ backgroundColor: "#004f53", color: "#7dd4db" }}
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6"
          style={{ borderColor: "#3e4949" }}>
          <p className="text-xs" style={{ color: "#6e797a" }}>
            © {currentYear} ikaZa Import. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            {[
              { href: "/terms", label: "Términos" },
              { href: "/privacy", label: "Privacidad" },
              { href: "/faq", label: "Ayuda" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs transition-colors hover:text-white"
                style={{ color: "#6e797a" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

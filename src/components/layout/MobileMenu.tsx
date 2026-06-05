"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, Grid3X3, ShoppingCart, Heart, User, Package, LogIn } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface MobileMenuProps {
  isLoggedIn: boolean;
}

export function MobileMenu({ isLoggedIn }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/catalog", icon: Grid3X3, label: "Catálogo" },
    { href: "/cart", icon: ShoppingCart, label: "Carrito" },
    { href: "/wishlist", icon: Heart, label: "Lista de deseos" },
    ...(isLoggedIn
      ? [{ href: "/profile", icon: User, label: "Mi Perfil" }, { href: "/orders", icon: Package, label: "Mis Pedidos" }]
      : [{ href: "/login", icon: LogIn, label: "Iniciar Sesión" }]),
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-0">
        <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
        {/* Header del drawer */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ background: "linear-gradient(135deg, #002022, #006065)" }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-headline text-lg font-bold text-white">ikaZa</p>
            <p className="text-xs text-white/70">Import</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col p-4 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Categorías */}
        <div className="px-4 pb-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categorías
          </p>
          {["Hogar", "Cocina", "Tecnología", "Decoración", "Jardín"].map((cat) => (
            <Link
              key={cat}
              href={`/catalog?category=${cat.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {cat}
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

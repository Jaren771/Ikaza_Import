"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart3,
  Settings, Image, Ticket, Boxes, TrendingUp, LogOut, ChevronLeft,
  ChevronRight, Shield, Truck, Store
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

// =============================================================================
// Admin Sidebar — Panel Administrativo
// Basado en wireframe "Panel de Control - ikaZa Admin"
// =============================================================================

const navItems = [
  { label: "Ver Tienda Web", href: "/", icon: Store, exact: true },
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  {
    label: "Productos",
    href: "/admin/products",
    icon: Package,
    badge: null,
  },
  { label: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
  { label: "Usuarios", href: "/admin/users", icon: Users },
  { label: "Categorías", href: "/admin/categories", icon: Tag },
  { label: "Inventario", href: "/admin/inventory", icon: Boxes },
  { label: "Cupones", href: "/admin/coupons", icon: Ticket },
  { label: "Banners", href: "/admin/banners", icon: Image },
  { label: "Reportes", href: "/admin/reports", icon: BarChart3 },
  { label: "Estadísticas", href: "/admin/stats", icon: TrendingUp },
];

const importerItems = [
  { label: "Importaciones", href: "/importer", icon: Truck },
  { label: "Proveedores", href: "/importer/suppliers", icon: Users },
  { label: "Marcas", href: "/importer/brands", icon: Shield },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== "/admin";
  };

  const isAdminActive = pathname === "/admin";

  return (
    <aside
      className={cn(
        "admin-sidebar flex flex-col transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
      style={{ minHeight: "100vh" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "#004f53" }}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#0d7a80" }}>
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-headline text-sm font-bold" style={{ color: "#c7fbff" }}>ikaZa Admin</p>
              <p className="text-xs" style={{ color: "#7dd4db" }}>Panel de control</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          style={{ color: "#7dd4db" }}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {/* Admin items */}
        {navItems.map((item) => {
          const active = item.exact ? isAdminActive : isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "text-white"
                  : "text-[#7dd4db] hover:text-white hover:bg-white/10",
                collapsed && "justify-center"
              )}
              style={active ? { backgroundColor: "#006065" } : {}}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-[#7dd4db]")} />
              {!collapsed && (
                <span>{item.label}</span>
              )}
            </Link>
          );
        })}

        {/* Separador Importadora */}
        <div className="pt-4 pb-2">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#3e4949" }}>
              Importadora
            </p>
          )}
        </div>

        {importerItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "text-white"
                  : "text-[#7dd4db] hover:text-white hover:bg-white/10",
                collapsed && "justify-center"
              )}
              style={active ? { backgroundColor: "#006065" } : {}}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "text-[#7dd4db]")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — Configuración + Usuario */}
      <div className="border-t p-3 space-y-1" style={{ borderColor: "#004f53" }}>
        <Link
          href="/admin/settings"
          title={collapsed ? "Configuración" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-[#7dd4db] hover:text-white hover:bg-white/10",
            collapsed && "justify-center"
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && "Configuración"}
        </Link>

        {/* User info */}
        <div className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback
              className="text-xs font-bold text-white"
              style={{ backgroundColor: "#0d7a80" }}
            >
              {getInitials(user.name ?? user.email ?? "A")}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs truncate" style={{ color: "#7dd4db" }}>{user.role}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title={collapsed ? "Cerrar Sesión" : undefined}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-red-900/30",
            collapsed && "justify-center"
          )}
          style={{ color: "#ff897d" }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Cerrar Sesión"}
        </button>
      </div>
    </aside>
  );
}

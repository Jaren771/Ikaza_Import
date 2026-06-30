"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { User, Settings, Package, Heart, LogOut, ChevronDown, Shield, MapPin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const isManager = user.role === "MANAGER";

  const handleLogout = async () => {
    await signOut({ redirectTo: "/" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-muted"
          id="user-menu-trigger"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Usuario"} />
            <AvatarFallback
              className="text-xs font-semibold text-white"
              style={{ backgroundColor: "#006065" }}
            >
              {getInitials(user.name ?? user.email ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold leading-none truncate max-w-24">
              {user.name?.split(" ")[0] ?? "Usuario"}
            </p>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground font-normal truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Mi Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/orders" className="cursor-pointer">
              <Package className="mr-2 h-4 w-4" />
              Mis Pedidos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/addresses" className="cursor-pointer">
              <MapPin className="mr-2 h-4 w-4" />
              Mis Direcciones
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/wishlist" className="cursor-pointer">
              <Heart className="mr-2 h-4 w-4" />
              Lista de Deseos
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {(isAdmin || isManager) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="cursor-pointer">
                    <Shield className="mr-2 h-4 w-4" style={{ color: "#006065" }} />
                    <span style={{ color: "#006065" }}>Panel Admin</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {(isAdmin || isManager) && (
                <DropdownMenuItem asChild>
                  <Link href="/importer" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Importadora
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

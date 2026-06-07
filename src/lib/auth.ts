import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // -------------------------------------------------------------------------
    // Google OAuth
    // -------------------------------------------------------------------------
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER" as UserRole,
        };
      },
    }),

    // -------------------------------------------------------------------------
    // Credenciales (email + password)
    // -------------------------------------------------------------------------
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales inválidas");
        }

        // =====================================================================
        // MOCK ADMIN BYPASS (Para poder entrar sin base de datos)
        // =====================================================================
        if (credentials.email === "admin@gmail.com" && credentials.password === "admin123") {
          return {
            id: "mock-admin-id",
            name: "Admin Demo",
            email: "admin@gmail.com",
            image: null,
            role: "ADMIN" as UserRole,
          };
        }
        // =====================================================================

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) {
            throw new Error("Usuario no encontrado");
          }

          if (user.status === "BANNED") {
            throw new Error("Cuenta suspendida");
          }

          if (user.status === "INACTIVE") {
            throw new Error("Cuenta inactiva");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            throw new Error("Contraseña incorrecta");
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("DB Error in NextAuth:", error);
          throw new Error("Error de conexión a BD. Usa admin@gmail.com / admin123");
        }
      },
    }),
  ],

  callbacks: {
    // Añadir rol y ID al JWT
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = ((user as { role?: string }).role ?? "CUSTOMER") as any;
      }

      // Permitir actualización de sesión desde el cliente
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }

      return token;
    },

    // Exponer datos en la sesión del cliente
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },

  events: {
    // Crear wishlist y carrito automáticamente al registrarse
    async createUser({ user }) {
      await Promise.all([
        prisma.wishlist.create({ data: { userId: user.id! } }),
        prisma.cart.create({ data: { userId: user.id! } }),
      ]);
    },
  },
});

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

        try {
          // =====================================================================
          // MAGIA DEL SÚPER ADMIN (Basado estrictamente en .env.local)
          // =====================================================================
          const superEmail = process.env.SUPERADMIN_EMAIL;
          const superPass = process.env.SUPERADMIN_PASSWORD;

          if (
            superEmail && 
            superPass && 
            credentials.email === superEmail && 
            credentials.password === superPass
          ) {
            // Es el Súper Admin. Verificamos si existe en la BD.
            let user = await prisma.user.findUnique({ where: { email: superEmail } });
            
            if (!user) {
              // Lo creamos silenciosamente para que tenga un ID real en la BD
              const hashed = await bcrypt.hash(superPass, 12);
              user = await prisma.user.create({
                data: {
                  name: "Súper Admin",
                  email: superEmail,
                  password: hashed,
                  role: "SUPER_ADMIN",
                  status: "ACTIVE",
                  emailVerified: new Date(),
                }
              });
            } else {
              // Si ya existía pero con otro password o rol, lo sincronizamos
              const hashed = await bcrypt.hash(superPass, 12);
              user = await prisma.user.update({
                where: { email: superEmail },
                data: { password: hashed, role: "SUPER_ADMIN", status: "ACTIVE", failedLoginAttempts: 0, lockoutUntil: null }
              });
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: "SUPER_ADMIN",
            };
          }
          // =====================================================================

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
        
        let assignedRole = ((user as { role?: string }).role ?? "CUSTOMER") as any;

        // LÓGICA DE SUPER ADMIN EXCLUSIVO
        const superAdminEmail = process.env.SUPERADMIN_EMAIL;
        if (superAdminEmail && user.email === superAdminEmail) {
          // Si el correo coincide con el del .env.local, es el único Súper Admin
          assignedRole = "SUPER_ADMIN";
        } else if (assignedRole === "SUPER_ADMIN") {
          // Si otro usuario tiene el rol en la BD por algún motivo, lo degradamos a ADMIN por seguridad
          assignedRole = "ADMIN";
        }

        token.role = assignedRole;
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

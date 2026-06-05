import { handlers } from "@/lib/auth";

// Expone los endpoints GET y POST de NextAuth en /api/auth/*
export const { GET, POST } = handlers;

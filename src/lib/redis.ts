import { Redis } from "@upstash/redis";

// Solo intentamos crear la instancia si existe la URL para que no rompa el desarrollo
export const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

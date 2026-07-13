import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// Exportamos un rate limiter genérico que permite 10 peticiones cada 10 segundos por IP
export const rateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    })
  : {
      // Mock en caso de no tener configurado Redis localmente
      limit: async () => ({ success: true }),
    };

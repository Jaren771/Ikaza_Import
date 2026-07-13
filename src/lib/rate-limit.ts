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
      limit: async () => ({ success: true }),
    };

// Rate limiter más estricto para registro y autenticación (5 peticiones por hora)
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "@upstash/auth-ratelimit",
    })
  : {
      limit: async () => ({ success: true }),
    };

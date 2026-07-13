/**
 * L1 (Memory) + L2 (Redis) Cache System (Patrón 12 de AGENTS.md)
 * 
 * Implementa una jerarquía estricta:
 * 1. L1 (RAM con globalThis): 0ms latencia, coste cero.
 * 2. L2 (Upstash Redis): 50ms latencia, compartido entre Serverless Functions.
 * 3. Fallback: Base de Datos (Degradación segura si Redis falla).
 * 
 * TTL: 1 hora para minimizar comandos Redis (Error Real #11 de AGENTS.md).
 * La invalidación manual via l1Cache.clear() mantiene consistencia.
 */

import { redis } from "./redis";

type CacheEntry = {
  data: any;
  expiry: number;
};

const globalForCache = globalThis as unknown as {
  ikazaCache: Map<string, CacheEntry>;
};

const cache = globalForCache.ikazaCache || new Map<string, CacheEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForCache.ikazaCache = cache;
}

const DEFAULT_TTL_MS = 3_600_000; // 1 hora (Error Real #11: TTLs cortos generan fuga de Redis)

export const l1Cache = {
  get<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    
    // Invalidación pasiva
    if (Date.now() > entry.expiry) {
      cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  },

  set(key: string, data: any, ttlMs: number = DEFAULT_TTL_MS): void {
    cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  },

  // Doble Invalidación (Patrón 12)
  async delete(key: string): Promise<void> {
    cache.delete(key); // Limpia L1
    if (redis) {
      try {
        await redis.del(key); // Limpia L2
      } catch (e) {
        console.error("[Cache L2] Error borrando key:", e);
      }
    }
  },

  async clear(): Promise<void> {
    cache.clear();
    // Limpiar Redis completo es peligroso, por lo general preferiremos borrar por keys o usar tags.
  },

  // Helper para envolver Promesas (L1 -> L2 -> BD)
  async wrap<T>(key: string, fetcher: () => Promise<T>, ttlMs: number = DEFAULT_TTL_MS): Promise<T> {
    // 1. Revisar L1 (RAM)
    const cachedL1 = this.get<T>(key);
    if (cachedL1 !== null) {
      return cachedL1;
    }

    // 2. Revisar L2 (Redis)
    if (redis) {
      try {
        const cachedL2 = await redis.get<T>(key);
        if (cachedL2) {
          // Rellenar L1 para el siguiente request en el mismo servidor
          this.set(key, cachedL2, ttlMs);
          return cachedL2;
        }
      } catch (e: any) {
        if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) {
          throw e; // Next.js necesita este error para saber que la ruta es dinámica
        }
        console.error("[Cache L2] Error leyendo key:", e);
        // Degradación Segura: Ignoramos el error y continuamos a BD
      }
    }

    // 3. Fallback a Base de Datos
    const data = await fetcher();
    
    // Rellenar L1
    this.set(key, data, ttlMs);
    
    // Rellenar L2
    if (redis) {
      try {
        await redis.set(key, data, { px: ttlMs });
      } catch (e: any) {
        if (e?.digest === 'DYNAMIC_SERVER_USAGE' || e?.message?.includes('Dynamic server usage')) {
          throw e; // Next.js necesita este error para saber que la ruta es dinámica
        }
        console.error("[Cache L2] Error guardando key:", e);
      }
    }

    return data;
  }
};

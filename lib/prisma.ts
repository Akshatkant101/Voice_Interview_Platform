import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Same reason as lib/vapi.sdk.ts: fast refresh re-evaluates modules, and a new
// PrismaClient per reload leaks a connection pool each time.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  // Prisma 7 has no `datasourceUrl` — the connection string is supplied
  // through a driver adapter instead. This is the pooled Supabase URL
  // (port 6543); migrations use DIRECT_URL via prisma.config.ts.
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add the Supabase transaction-pooler connection string to .env.local.",
    );
  }

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;

  return client;
}

// Built lazily: `next build` collects page data by importing route modules,
// and connecting (or throwing) at import time would make every build depend
// on the database being configured. The error still surfaces clearly, just
// on first query instead.
let client: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    client ??= globalForPrisma.prisma ?? createClient();
    return Reflect.get(client, prop, receiver);
  },
});

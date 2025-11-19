import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // Check if auth is disabled
  const DISABLE_AUTH = process.env.DISABLE_AUTH === "true";
  
  // If auth is disabled, create a development user
  if (DISABLE_AUTH) {
    const devUser: User = {
      id: 999,
      google_id: "dev-user",
      email: "dev@example.com",
      name: "Development User",
      picture: null,
      role: "admin",
      preferred_language: "en",
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    return {
      req: opts.req,
      res: opts.res,
      user: devUser,
    };
  }
  
  // Get user from Passport session (req.user is set by passport.deserializeUser)
  const user = (opts.req as any).user as User | undefined;

  return {
    req: opts.req,
    res: opts.res,
    user: user || null,
  };
}

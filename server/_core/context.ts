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
  // Get user from Passport session (req.user is set by passport.deserializeUser)
  const user = (opts.req as any).user as User | undefined;

  return {
    req: opts.req,
    res: opts.res,
    user: user || null,
  };
}

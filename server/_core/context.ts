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
      open_id: "dev-user",
      email: "dev@example.com",
      name: "Development User",
      login_method: "dev",
      role: "admin",
      preferred_language: "en",
      has_seen_onboarding: true,
      total_exams_completed: 0,
      total_vocabulary_learned: 0,
      total_time_spent_minutes: 0,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      is_banned: false,
      banned_at: null,
      banned_until: null,
      banned_by: null,
      ban_reason: null,
      created_at: new Date(),
      updated_at: new Date(),
      last_signed_in: new Date(),
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

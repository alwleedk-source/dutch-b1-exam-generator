// Auth router
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const authRouter = router({
    me: publicProcedure.query(opts => opts.ctx.user),

    logout: publicProcedure.mutation(async ({ ctx }) => {
        return new Promise((resolve, reject) => {
            if (ctx.req.logout) {
                ctx.req.logout((err) => {
                    if (err) {
                        console.error('[Logout] Error destroying session:', err);
                        reject(err);
                        return;
                    }

                    if (ctx.req.session) {
                        ctx.req.session.destroy((err) => {
                            if (err) {
                                console.error('[Logout] Error destroying session store:', err);
                            }
                        });
                    }

                    const cookieOptions = getSessionCookieOptions(ctx.req);
                    ctx.res.clearCookie(COOKIE_NAME, cookieOptions);

                    console.log('[Logout] Session destroyed successfully');
                    resolve({ success: true } as const);
                });
            } else {
                const cookieOptions = getSessionCookieOptions(ctx.req);
                ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
                resolve({ success: true } as const);
            }
        });
    }),

    updatePreferences: protectedProcedure
        .input(z.object({
            preferred_language: z.enum(["nl", "ar", "en", "tr"]),
        }))
        .mutation(async ({ ctx, input }) => {
            await db.updateUserPreferences(ctx.user.id, input.preferred_language);
            return { success: true };
        }),
});

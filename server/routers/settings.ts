import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

const database = await getDb();
import { systemSettings, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

/**
 * Settings router - Admin control panel
 */
export const settingsRouter = router({
  // Get a setting by key (public - anyone can read)
  getSetting: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const setting = await database
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, input.key))
        .limit(1);
      
      if (setting.length === 0) {
        return null;
      }
      
      return setting[0];
    }),
  
  // Get all settings (admin only)
  getAllSettings: adminProcedure.query(async () => {
    return await database
      .select()
      .from(systemSettings)
      .orderBy(systemSettings.key);
  }),
  
  // Update or create a setting (admin only)
  updateSetting: adminProcedure
    .input(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if setting exists
      const existing = await database
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, input.key))
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing
        await database
          .update(systemSettings)
          .set({
            value: input.value,
            description: input.description,
            updated_by: ctx.user.id,
            updated_at: new Date(),
          })
          .where(eq(systemSettings.key, input.key));
      } else {
        // Create new
        await database.insert(systemSettings).values({
          key: input.key,
          value: input.value,
          description: input.description,
          updated_by: ctx.user.id,
        });
      }
      
      return { success: true };
    }),
  
  // Toggle exam creation (admin only)
  toggleExamCreation: adminProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const key = "exam_creation_enabled";
      const value = input.enabled ? "true" : "false";
      
      // Check if setting exists
      const existing = await database
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key))
        .limit(1);
      
      if (existing.length > 0) {
        // Update
        await database
          .update(systemSettings)
          .set({
            value,
            updated_by: ctx.user.id,
            updated_at: new Date(),
          })
          .where(eq(systemSettings.key, key));
      } else {
        // Create
        await database.insert(systemSettings).values({
          key,
          value,
          description: "Enable or disable exam creation for all users",
          updated_by: ctx.user.id,
        });
      }
      
      return { success: true, enabled: input.enabled };
    }),
  
  // Check if exam creation is enabled (public)
  isExamCreationEnabled: protectedProcedure.query(async () => {
    const setting = await database
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, "exam_creation_enabled"))
      .limit(1);
    
    // Default to true if not set
    if (setting.length === 0) {
      return { enabled: true };
    }
    
    return { enabled: setting[0].value === "true" };
  }),
});

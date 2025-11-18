import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import * as db from "../db";

// Check if auth is disabled
const DISABLE_AUTH = process.env.DISABLE_AUTH === "true";

if (!DISABLE_AUTH) {
  // Validate required environment variables
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    console.warn("[Google OAuth] Missing required environment variables. Google OAuth will not be available.");
  } else {
    // Configure Google OAuth Strategy
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_REDIRECT_URI,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Extract user info from Google profile
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName;
            const googleId = profile.id;

            if (!googleId) {
              return done(new Error("No Google ID provided"));
            }

            // Upsert user in database
            await db.upsertUser({
              openId: `google_${googleId}`,
              name: name || undefined,
              email: email || undefined,
              loginMethod: "google",
              lastSignedIn: new Date(),
            });

            // Get user from database
            const user = await db.getUserByOpenId(`google_${googleId}`);

            if (!user) {
              return done(new Error("Failed to create or retrieve user"));
            }

            return done(null, user);
          } catch (error) {
            console.error("[Google OAuth] Error during authentication:", error);
            return done(error as Error);
          }
        }
      )
    );

    // Serialize user to session
    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id: number, done) => {
      try {
        const user = await db.getUserById(id);
        done(null, user || null);
      } catch (error) {
        done(error);
      }
    });

    console.log("[Google OAuth] Strategy configured successfully");
  }
} else {
  console.log("[Google OAuth] Authentication is disabled (DISABLE_AUTH=true)");
}

export default passport;

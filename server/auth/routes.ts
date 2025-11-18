import { Router } from "express";
import passport from "./google";

const router = Router();

// Check if auth is disabled
const DISABLE_AUTH = process.env.DISABLE_AUTH === "true";

if (DISABLE_AUTH) {
  // Mock authentication for development
  router.get("/auth/google", (req, res) => {
    res.send("Authentication is disabled. Set DISABLE_AUTH=false to enable Google OAuth.");
  });

  router.get("/auth/callback", (req, res) => {
    res.redirect("/");
  });

  router.get("/auth/logout", (req, res) => {
    res.redirect("/");
  });

  console.log("[Auth Routes] Authentication is disabled (DISABLE_AUTH=true)");
} else {
  // Google OAuth routes
  router.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  router.get(
    "/auth/callback",
    passport.authenticate("google", {
      failureRedirect: "/?error=auth_failed",
    }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect("/dashboard");
    }
  );

  router.get("/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  console.log("[Auth Routes] Google OAuth routes configured");
}

export default router;

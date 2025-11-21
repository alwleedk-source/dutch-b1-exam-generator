import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import session from "express-session";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import passport from "../auth/google";
import authRoutes from "../auth/routes";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { autoMigrate } from "../lib/auto-migrate";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  
  // Trust Railway proxy for secure cookies
  if (process.env.NODE_ENV === "production") {
    app.set('trust proxy', 1);
  }
  
  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "dutch-b1-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
      proxy: process.env.NODE_ENV === "production", // Trust Railway proxy
    })
  );
  
  // Run auto-migration to ensure tables exist
  await autoMigrate();
  
  // Debug middleware to log session info
  app.use((req, res, next) => {
    if (req.path.includes('/auth') || req.path.includes('/api')) {
      console.log(`[Session Debug] ${req.method} ${req.path}`);
      console.log(`[Session Debug] Session ID: ${req.sessionID || 'none'}`);
      console.log(`[Session Debug] Session exists: ${!!req.session}`);
      console.log(`[Session Debug] User in session: ${!!req.session?.passport?.user}`);
      console.log(`[Session Debug] Cookies: ${JSON.stringify(req.cookies || {})}`);
    }
    next();
  });
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Google OAuth routes
  app.use(authRoutes);
  
  // Manus OAuth callback (keep for compatibility)
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

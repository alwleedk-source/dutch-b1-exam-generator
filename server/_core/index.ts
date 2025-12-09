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

  // Security headers
  app.use((req, res, next) => {
    // Basic security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  // Simple rate limiting for API endpoints
  const apiRequestCounts = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

  app.use('/api', (req, res, next) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = apiRequestCounts.get(clientIp);
    if (!record || now > record.resetTime) {
      apiRequestCounts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else {
      record.count++;
      if (record.count > RATE_LIMIT_MAX_REQUESTS) {
        res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000).toString());
        return res.status(429).json({ error: 'Too many requests, please try again later' });
      }
    }
    next();
  });

  // Clean up old rate limit entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of apiRequestCounts.entries()) {
      if (now > record.resetTime) {
        apiRequestCounts.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  // Trust proxy for secure cookies (Coolify/Railway)
  // Always trust proxy in production
  app.set('trust proxy', 1);

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
        sameSite: "lax", // Use 'lax' for better compatibility
        domain: undefined, // Let browser handle domain
        path: '/',
      },
      proxy: true, // Always trust proxy
      name: 'connect.sid', // Explicit session cookie name
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

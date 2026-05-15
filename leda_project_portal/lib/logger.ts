/**
 * Centralised Pino logger for all API routes.
 *
 * Usage in an API handler:
 *   import { createRouteLogger } from "@/lib/logger";
 *   const log = createRouteLogger("/api/management/player");
 *
 *   log.info({ method: req.method }, "Request received");
 *   log.warn({ method: req.method }, "Method not allowed");
 *   log.error({ err: error }, "Failed to fetch players");
 *
 * Behaviour:
 *   - Development  → human-readable output via pino-pretty
 *   - Production   → structured JSON (ideal for Vercel log drains / Axiom)
 */
import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

const baseLogger = pino(
  isDev
    ? {
        level: "debug",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss",
            ignore: "pid,hostname",
            messageFormat: "[{route}] {msg}",
          },
        },
      }
    : {
        level: "info",
        // Emit level as a string label ("info", "warn", "error") instead of
        // Pino's default numeric value so Loki LogQL filters work naturally:
        //   {service="app"} | json | level="error"
        formatters: {
          level: (label) => ({ level: label }),
        },
      }
);

/**
 * Creates a child logger bound to a specific API route path.
 * All log entries will include a `route` field for easy filtering.
 */
export function createRouteLogger(route: string) {
  return baseLogger.child({ route });
}

export default baseLogger;

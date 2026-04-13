/**
 * Client-side logging: detailed messages only in development.
 * In production, avoids noisy consoles and reduces risk of leaking user-related context.
 */
export const logger = {
  devDebug(...args: unknown[]) {
    if (import.meta.env.DEV) console.log("[WeedNet]", ...args);
  },

  devWarn(...args: unknown[]) {
    if (import.meta.env.DEV) console.warn("[WeedNet]", ...args);
  },

  /**
   * Use only for rare failures (boot, boundary). Do not pass nicknames, join codes, or tokens.
   */
  error(...args: unknown[]) {
    console.error("[WeedNet]", ...args);
  },
};

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    MORALIS_API_KEY: z.string().optional(),
    NEON_DB_API_KEY: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_URL:z.string().url().optional(),
    NEXT_PUBLIC_TOKEN_SERVICE_URL: z.string().url().optional(),
    NEXT_PUBLIC_BACKEND_URL: z.string(),
    NEXT_PUBLIC_IS_BACKEND_DEPLOYED: z.preprocess((val) => val === 'true' || val === true, z.boolean()),
    NEXT_PUBLIC_WEBSOCKET_URL: z.string().optional(),
    
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    MORALIS_API_KEY: process.env.MORALIS_API_KEY,
    NEON_DB_API_KEY: process.env.NEON_DB_API_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_TOKEN_SERVICE_URL: process.env.NEXT_PUBLIC_TOKEN_SERVICE_URL,
    NEXT_PUBLIC_IS_BACKEND_DEPLOYED: process.env.NEXT_PUBLIC_IS_BACKEND_DEPLOYED,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://api.interstate.example.com/ws',
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

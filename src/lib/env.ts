/**
 * Environment variable validation.
 *
 * Validates required environment variables at startup and logs warnings
 * for missing optional ones. This prevents silent failures in production.
 */

interface EnvCheck {
  name: string;
  required: boolean;
  present: boolean;
}

export function validateEnv(): EnvCheck[] {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  const checks: EnvCheck[] = [
    { name: "GEMINI_API_KEY", required: false, present: !!process.env.GEMINI_API_KEY },
    { name: "MONGODB_URI", required: process.env.NODE_ENV === "production", present: !!mongoUri },
    { name: "AUTH_SECRET", required: process.env.NODE_ENV === "production", present: !!process.env.AUTH_SECRET },
    { name: "GEMINI_MODEL", required: false, present: !!process.env.GEMINI_MODEL },
  ];

  for (const check of checks) {
    if (check.required && !check.present) {
      console.error(
        `[env] CRITICAL: ${check.name} is required in ${process.env.NODE_ENV} mode but is not set.`,
      );
    } else if (!check.present && check.name !== "GEMINI_MODEL") {
      console.warn(
        `[env] ${check.name} is not set. Using default/fallback behavior.`,
      );
    }
  }

  return checks;
}

/**
 * Get a summary of the current environment configuration.
 */
export function getEnvSummary(): {
  gemini: "configured" | "not configured";
  mongodb: "configured" | "not configured";
  authSecret: "configured" | "using dev default";
  mode: string;
} {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  return {
    gemini: process.env.GEMINI_API_KEY ? "configured" : "not configured",
    mongodb: mongoUri ? "configured" : "not configured",
    authSecret: process.env.AUTH_SECRET ? "configured" : "using dev default",
    mode: process.env.NODE_ENV ?? "development",
  };
}

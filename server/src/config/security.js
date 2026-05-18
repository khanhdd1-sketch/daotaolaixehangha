const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000"
];

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function normalizeOrigin(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/g, "");
}

function getAllowedOrigins() {
  const configuredOrigins = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

  return Array.from(new Set([...(configuredOrigins.length ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS)]));
}

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  return getAllowedOrigins().includes(normalizeOrigin(origin));
}

function getJwtSecret() {
  const secret = String(process.env.JWT_SECRET || "").trim();

  if (secret) {
    return secret;
  }

  if (isProduction()) {
    throw new Error("JWT_SECRET must be configured in production");
  }

  return "dev-only-insecure-secret-change-me";
}

function isMockModeEnabled() {
  return String(process.env.USE_MOCK_DATA || "true").toLowerCase() === "true";
}

function assertSecureRuntimeConfig() {
  getJwtSecret();

  if (isProduction() && isMockModeEnabled()) {
    throw new Error("USE_MOCK_DATA must be disabled in production");
  }
}

module.exports = {
  assertSecureRuntimeConfig,
  getAllowedOrigins,
  getJwtSecret,
  isAllowedOrigin,
  isMockModeEnabled,
  isProduction
};

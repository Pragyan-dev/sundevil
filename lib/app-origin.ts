const DEFAULT_PRODUCTION_APP_ORIGIN = "https://sundevil.vercel.app";
const DEFAULT_DEVELOPMENT_APP_ORIGIN = "http://localhost:3000";

function normalizeOrigin(input: string) {
  return input.endsWith("/") ? input.slice(0, -1) : input;
}

export function getAppOrigin() {
  const configuredOrigin = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin);
  }

  return process.env.NODE_ENV === "production"
    ? DEFAULT_PRODUCTION_APP_ORIGIN
    : DEFAULT_DEVELOPMENT_APP_ORIGIN;
}

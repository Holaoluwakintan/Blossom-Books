export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

export function validateRuntimeConfig() {
  const required = [
    ["DATABASE_URL", ENV.databaseUrl],
    ["JWT_SECRET", ENV.cookieSecret],
    ["OAUTH_SERVER_URL", ENV.oAuthServerUrl],
    ["VITE_APP_ID", ENV.appId],
  ] as const;
  const missing = required.filter(([, value]) => !value).map(([name]) => name);
  if (!missing.length) return;
  const message = `Missing runtime configuration: ${missing.join(", ")}`;
  if (ENV.isProduction) throw new Error(message);
  console.warn(`[Config] Development mode: ${message}`);
}

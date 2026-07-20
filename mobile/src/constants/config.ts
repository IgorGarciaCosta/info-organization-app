/**
 * App configuration constants.
 *
 * API_BASE_URL points to the Python (FastAPI) backend that runs the Gemini
 * summary (/summarize). The transcription itself runs on-device and does NOT
 * need this URL.
 *
 * The value is resolved per environment so the SAME code works in development
 * and in the installed production app:
 *
 * - PRODUCTION (installed APK): the URL comes from the EXPO_PUBLIC_API_URL
 *   environment variable, baked into the build (see .env.production / eas.json).
 *   It must be a public HTTPS address of your hosted backend, because the user's
 *   phone has no access to your computer.
 *
 * - DEVELOPMENT (Expo Go / dev build): if EXPO_PUBLIC_API_URL is not set, we
 *   use the hosted Render backend so tests work without a local Python server
 *   or an ADB port reverse.
 *
 * Note: `__DEV__` is a React Native global that is `true` while developing and
 * `false` in a production build.
 */

// URL injected at build time via an EXPO_PUBLIC_* env var (Expo inlines these).
const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

// Hosted backend used by Expo Go when no environment override is provided.
const DEV_FALLBACK = 'https://transcript-api-r4jl.onrender.com';

function resolveApiBaseUrl(): string {
  // An explicit env var always wins (used by production builds).
  if (envUrl) return envUrl;

  // Without an env var, only development is supported (localhost).
  if (__DEV__) return DEV_FALLBACK;

  // Fail loudly: a production build without a configured backend URL is a bug
  // we want to catch immediately instead of shipping a broken app.
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set. Configure the production backend URL ' +
      'in .env.production or in the eas.json build profile before building.',
  );
}

export const API_BASE_URL = resolveApiBaseUrl();

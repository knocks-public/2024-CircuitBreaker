/**
 * Centralized, typed access to the runtime configuration.
 *
 * All values originate from Expo's public environment variables
 * (`EXPO_PUBLIC_*`), which Expo inlines at build time. Reading them through
 * this module keeps the source of truth in one place and lets the rest of the
 * codebase depend on plain, validated values instead of `process.env` lookups
 * scattered across files.
 */

const DEFAULT_API_URL = 'https://sindri.app/api/';
const DEFAULT_CIRCUIT_ID = '6ea50e49-065a-4dc6-b7e6-b0e1ba3665f1';

export const env = {
  sindriApiKey: process.env.EXPO_PUBLIC_SINDRI_API_KEY || '',
  sindriApiUrl: process.env.EXPO_PUBLIC_SINDRI_API_URL || DEFAULT_API_URL,
  circuitId: process.env.EXPO_PUBLIC_CIRCUIT_ID || DEFAULT_CIRCUIT_ID,
} as const;

/** Base URL for v1 of the Sindri REST API, e.g. `https://sindri.app/api/v1`. */
export const SINDRI_API_BASE_URL = `${env.sindriApiUrl}v1`;

/**
 * Whether a Sindri API key has been provided. Proof generation and
 * verification require an authenticated key; callers can use this to fail
 * fast with a clear message instead of issuing an unauthenticated request.
 */
export function isSindriConfigured(): boolean {
  return env.sindriApiKey.length > 0;
}

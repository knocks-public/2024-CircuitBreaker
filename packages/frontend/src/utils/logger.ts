/**
 * Minimal logging utility.
 *
 * In development every level is emitted to the console. In production only
 * `warn` and `error` are emitted, which keeps release builds quiet and avoids
 * leaking diagnostic detail. Callers must never pass privacy-sensitive data
 * (ages, dates of birth, PINs, proof inputs) to the logger — for an identity
 * verification app that data must stay off the logs entirely.
 */

type LogArgs = unknown[];

function isDevEnvironment(): boolean {
  // `__DEV__` is injected by React Native/Expo at build time. Under the Node
  // based test runner it is undefined, so fall back to NODE_ENV.
  if (typeof __DEV__ !== 'undefined') {
    return __DEV__;
  }
  return process.env.NODE_ENV !== 'production';
}

const isDev = isDevEnvironment();

export const logger = {
  debug(...args: LogArgs): void {
    if (isDev) {
      console.debug(...args);
    }
  },
  info(...args: LogArgs): void {
    if (isDev) {
      console.info(...args);
    }
  },
  warn(...args: LogArgs): void {
    console.warn(...args);
  },
  error(...args: LogArgs): void {
    console.error(...args);
  },
};

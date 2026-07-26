const MINUTE_IN_MS = 60 * 1000;

function getPositiveMinutes(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const SESSION_CONFIG = {
  idleTimeoutMs:
    getPositiveMinutes(process.env.NEXT_PUBLIC_SESSION_IDLE_MINUTES, 30) *
    MINUTE_IN_MS,
  examIdleTimeoutMs:
    getPositiveMinutes(process.env.NEXT_PUBLIC_EXAM_SESSION_IDLE_MINUTES, 120) *
    MINUTE_IN_MS,
  warningBeforeMs:
    getPositiveMinutes(process.env.NEXT_PUBLIC_SESSION_WARNING_MINUTES, 2) *
    MINUTE_IN_MS,
  absoluteTimeoutMs:
    getPositiveMinutes(process.env.NEXT_PUBLIC_SESSION_MAX_MINUTES, 240) *
    MINUTE_IN_MS,
};

export const SESSION_STORAGE_KEYS = {
  startedAt: 'arkanin-session-started-at',
  expiresAt: 'arkanin-session-expires-at',
  lastActivityAt: 'arkanin-session-last-activity-at',
} as const;

export interface BrowserSession {
  startedAt: number;
  expiresAt: number;
  lastActivityAt: number;
}

function readTimestamp(key: string): number | null {
  if (typeof window === 'undefined') return null;

  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parseExpiration(expiresAt?: string | null): number | null {
  if (!expiresAt) return null;

  const timestamp = Date.parse(expiresAt);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function startBrowserSession(expiresAt?: string | null): BrowserSession {
  const now = Date.now();
  const backendExpiration = parseExpiration(expiresAt);
  const session: BrowserSession = {
    startedAt: now,
    expiresAt:
      backendExpiration ?? now + SESSION_CONFIG.absoluteTimeoutMs,
    lastActivityAt: now,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(
      SESSION_STORAGE_KEYS.startedAt,
      String(session.startedAt),
    );
    localStorage.setItem(
      SESSION_STORAGE_KEYS.expiresAt,
      String(session.expiresAt),
    );
    localStorage.setItem(
      SESSION_STORAGE_KEYS.lastActivityAt,
      String(session.lastActivityAt),
    );
  }

  return session;
}

export function readBrowserSession(): BrowserSession | null {
  const startedAt = readTimestamp(SESSION_STORAGE_KEYS.startedAt);
  const expiresAt = readTimestamp(SESSION_STORAGE_KEYS.expiresAt);
  const lastActivityAt = readTimestamp(SESSION_STORAGE_KEYS.lastActivityAt);

  if (!startedAt || !expiresAt || !lastActivityAt) return null;

  return { startedAt, expiresAt, lastActivityAt };
}

export function touchBrowserSession(at = Date.now()): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_STORAGE_KEYS.lastActivityAt, String(at));
}

export function clearBrowserSession(): void {
  if (typeof window === 'undefined') return;

  Object.values(SESSION_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Transient-error retry utility for database and external-service calls.
 *
 * `withRetry` re-invokes an async operation up to `maxAttempts` times,
 * backing off exponentially between attempts.  Only errors that are
 * considered transient (network / connection issues) are retried;
 * application-level errors (constraint violations, bad input, etc.) are
 * thrown immediately.
 */

const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 100; // doubles each attempt: 100 → 200 → 400

/**
 * PostgreSQL and Node.js error codes that indicate a transient condition
 * worth retrying (connection pool exhausted, server restart, TCP reset…).
 */
const TRANSIENT_PG_CODES = new Set([
    "57P01", // admin_shutdown
    "57P02", // crash_shutdown
    "57P03", // cannot_connect_now
    "08000", // connection_exception
    "08003", // connection_does_not_exist
    "08006", // connection_failure
    "08001", // sqlclient_unable_to_establish_sqlconnection
    "08004", // sqlserver_rejected_establishment_of_sqlconnection
    "53300", // too_many_connections
]);

// pg pool exhaustion: thrown by the pg library itself (no error code)
const TRANSIENT_PG_MESSAGES = [
    "timeout exceeded when trying to connect",
    "connection pool",
];

const TRANSIENT_NODE_CODES = new Set([
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "EPIPE",
]);

function isTransient(error: unknown): boolean {
    if (error && typeof error === "object") {
        const err = error as Record<string, unknown>;
        const code = err.code as string | undefined;
        if (code && (TRANSIENT_PG_CODES.has(code) || TRANSIENT_NODE_CODES.has(code))) {
            return true;
        }
        // pg pool exhaustion errors have no code — match by message instead
        const message = (err.message as string | undefined)?.toLowerCase() ?? "";
        if (TRANSIENT_PG_MESSAGES.some((m) => message.includes(m))) {
            return true;
        }
    }
    return false;
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes `fn` up to `maxAttempts` times, retrying only on transient errors.
 *
 * @param fn          - The async operation to attempt.
 * @param maxAttempts - Maximum number of attempts (default: 5).
 * @param baseDelayMs - Base back-off delay in ms, doubles each retry (default: 100).
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxAttempts = MAX_ATTEMPTS,
    baseDelayMs = BASE_DELAY_MS
): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            const isLastAttempt = attempt === maxAttempts;
            if (isLastAttempt || !isTransient(error)) {
                throw error;
            }

            const backoff = baseDelayMs * 2 ** (attempt - 1);
            await delay(backoff);
        }
    }

    // Unreachable, but satisfies TypeScript
    throw lastError;
}

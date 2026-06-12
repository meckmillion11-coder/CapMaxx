// ──────────────────────────────────────────────────────────────────────────────
// withTimeout — race any promise against a timeout and resolve to a fallback.
//
// Used to guard server-side awaits (auth + DB queries) so a slow/hung upstream
// call can never block a route handler or server component indefinitely. The
// underlying promise keeps running; we just stop waiting on it.
// ──────────────────────────────────────────────────────────────────────────────

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

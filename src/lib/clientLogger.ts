/**
 * Client-Side Error Reporting and Telemetry Helper
 * Safely dispatches error telemetry to /api/log-error with zero unhandled throw risk.
 */
export async function reportClientError(
  error: unknown,
  context?: {
    component?: string;
    action?: string;
    additional?: Record<string, any>;
    componentStack?: string;
  }
): Promise<string | null> {
  try {
    let message = "Unknown Client Error";
    let stack: string | undefined;
    let cause: string | undefined;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack;
      cause = error.cause ? String(error.cause) : undefined;
    } else if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object") {
      try {
        message = (error as any).message || JSON.stringify(error);
        stack = (error as any).stack;
      } catch {
        message = "Unserializable client error";
      }
    }

    const payload = {
      message,
      stack,
      cause,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      componentStack: context?.componentStack,
      context: {
        component: context?.component,
        action: context?.action,
        ...context?.additional,
      },
    };

    // Use keepalive / sendBeacon or standard fetch
    const response = await fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return data.errorId || null;
    }
  } catch (err) {
    // Fail silently on telemetry reporting failure so we NEVER cause a secondary crash
    console.warn("Could not dispatch error telemetry to server:", err);
  }
  return null;
}

"use client";

import React, { useEffect, ReactNode } from "react";
import { reportClientError } from "@/lib/clientLogger";

interface GlobalErrorProviderProps {
  children: ReactNode;
}

export default function GlobalErrorProvider({ children }: GlobalErrorProviderProps) {
  useEffect(() => {
    // 1. Uncaught client-side runtime errors
    const handleGlobalError = (event: ErrorEvent) => {
      // Don't log trivial browser extension errors (e.g. ResizeObserver loop limit exceeded)
      if (event.message && event.message.includes("ResizeObserver")) {
        return;
      }

      console.warn("[GlobalErrorProvider] Caught uncaught runtime error:", event.message, event.error);

      reportClientError(event.error || event.message, {
        component: "window_onerror",
        action: "uncaught_runtime_error",
        additional: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    // 2. Unhandled Promise Rejections (e.g. failed async fetch calls, aborted network requests)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.warn("[GlobalErrorProvider] Caught unhandled promise rejection:", event.reason);

      // Prevent default browser crash dialog
      // event.preventDefault();

      reportClientError(event.reason, {
        component: "window_onunhandledrejection",
        action: "unhandled_promise_rejection",
      });
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { reportClientError } from "@/lib/clientLogger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errorId, setErrorId] = useState<string | null>(null);

  useEffect(() => {
    reportClientError(error, {
      component: "GlobalError_Root",
      action: "root_layout_crash",
      additional: { digest: error.digest },
    }).then((id) => {
      if (id) setErrorId(id);
    });
    console.error("[GlobalError] Fatal layout crash caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: "24px", fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#f8fafc", color: "#0f172a" }}>
        <div style={{ maxWidth: "600px", margin: "60px auto", backgroundColor: "#ffffff", borderRadius: "24px", padding: "40px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", textAlign: "center", border: "1px solid #e2e8f0" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>
            ⚠️
          </div>

          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
            Al Rauf Health Care Portal
          </h1>
          <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", margin: "0 0 20px" }}>
            A critical interface error was intercepted by our fail-safe system. Your clinical data is safe.
          </p>

          <div style={{ padding: "10px 16px", backgroundColor: "#f1f5f9", borderRadius: "10px", fontSize: "12px", fontFamily: "monospace", color: "#334155", display: "inline-block", marginBottom: "24px", border: "1px solid #cbd5e1" }}>
            Diagnostic ID: <strong>{errorId || error.digest || "SYS_ROOT_RECOVERED"}</strong>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => reset()}
              style={{ padding: "14px 24px", backgroundColor: "#0f766e", color: "#ffffff", border: "none", borderRadius: "12px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", transition: "background 0.2s" }}
            >
              🔄 Reload Application
            </button>

            <a
              href="https://api.whatsapp.com/send?phone=923208119978&text=Assalam-o-Alaikum%20Al%20Rauf%20Health%20Care%20Reception%2C%20I%20faced%20a%20browser%20issue.%20Please%20assist%20me."
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", padding: "14px 24px", backgroundColor: "#059669", color: "#ffffff", borderRadius: "12px", fontWeight: "bold", fontSize: "14px", textDecoration: "none" }}
            >
              📱 Reach Clinic Reception on WhatsApp (0320 8119978)
            </a>

            <a
              href="tel:03158119978"
              style={{ display: "block", padding: "12px 24px", backgroundColor: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1", borderRadius: "12px", fontWeight: "bold", fontSize: "13px", textDecoration: "none" }}
            >
              📞 Call Appointment Desk: 0315-8119978
            </a>
          </div>

          <details style={{ marginTop: "24px", textAlign: "left", fontSize: "11px", color: "#64748b" }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold", outline: "none" }}>Technical Error Cause</summary>
            <div style={{ marginTop: "8px", padding: "12px", backgroundColor: "#0f172a", color: "#f8fafc", borderRadius: "8px", overflowX: "auto", fontFamily: "monospace" }}>
              <p style={{ color: "#f87171", margin: "0 0 6px" }}>{error.name}: {error.message}</p>
              {error.stack && <pre style={{ margin: 0, fontSize: "10px", color: "#94a3b8", whiteSpace: "pre-wrap" }}>{error.stack}</pre>}
            </div>
          </details>
        </div>
      </body>
    </html>
  );
}

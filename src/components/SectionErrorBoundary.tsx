"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { AlertCircle, RefreshCw, Send, ChevronDown, ChevronUp } from "lucide-react";
import { reportClientError } from "@/lib/clientLogger";
import { CLINIC_INFO } from "@/lib/constants";

interface Props {
  children: ReactNode;
  sectionName: string;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  reportedErrorId: string | null;
}

export default class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      reportedErrorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Safely dispatch diagnostic report to server logger
    reportClientError(error, {
      component: this.props.sectionName,
      componentStack: errorInfo.componentStack || undefined,
    }).then((errorId) => {
      if (errorId) {
        this.setState({ reportedErrorId: errorId });
      }
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      reportedErrorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { sectionName, fallbackTitle, fallbackMessage } = this.props;
      const { error, showDetails, reportedErrorId } = this.state;

      return (
        <section className="py-12 px-4 max-w-4xl mx-auto my-6 animate-in fade-in duration-300">
          <div className="rounded-3xl border-2 border-amber-200 bg-amber-50/80 p-6 md:p-8 text-center shadow-lg backdrop-blur-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto mb-4 text-amber-700 shadow-xs">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/70 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Section Protected · {sectionName}</span>
            </div>

            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">
              {fallbackTitle || `Temporary Display Issue in ${sectionName}`}
            </h3>

            <p className="text-sm text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
              {fallbackMessage ||
                "This section encountered an unexpected display condition. The rest of the clinic website and booking systems remain fully operational."}
            </p>

            {reportedErrorId && (
              <p className="text-xs font-mono text-amber-800 bg-amber-100/80 inline-block px-3 py-1 rounded-md mt-3 border border-amber-300">
                Diagnostic Trace ID: <strong>{reportedErrorId}</strong>
              </p>
            )}

            {/* Recovery actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload This Section</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?phone=${CLINIC_INFO.whatsappRaw}&text=${encodeURIComponent(
                  `Assalam-o-Alaikum Al Rauf Health Care Desk, I experienced a display issue in the ${sectionName} section. Please assist me directly.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Contact Clinic WhatsApp</span>
              </a>
            </div>

            {/* Error Cause Diagnostic Accordion */}
            {error && (
              <div className="mt-6 pt-4 border-t border-amber-200/80 text-left max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="flex items-center justify-between w-full text-xs font-bold text-amber-900 hover:text-amber-950 cursor-pointer"
                >
                  <span>Technical Diagnostics & Error Cause</span>
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDetails && (
                  <div className="mt-2 p-3 bg-white/80 rounded-xl border border-amber-200 text-xs font-mono text-slate-700 overflow-x-auto">
                    <p className="font-bold text-rose-700 mb-1">
                      {error.name}: {error.message}
                    </p>
                    {Boolean(error.cause) && (
                      <p className="text-amber-800 mb-1">Cause: {String(error.cause)}</p>
                    )}
                    {error.stack && (
                      <pre className="text-[11px] text-slate-500 whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

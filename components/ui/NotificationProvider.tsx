"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X, HelpCircle, AlertCircle } from "lucide-react";
import { useDolarStore } from "@/store/dolarStore";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  variant: "danger" | "warning" | "info";
  resolve: (value: boolean) => void;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface NotificationContextType {
  toast: (message: string, type?: "success" | "error" | "info") => void;
  confirm: (title: string, message: string, variant?: "danger" | "warning" | "info") => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  // Cargar cotización del dólar BNA de manera global al iniciar la aplicación
  const fetchCotizacion = useDolarStore((s) => s.fetchCotizacion);
  useEffect(() => {
    fetchCotizacion();
  }, [fetchCotizacion]);

  const toast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirm = useCallback((
    title: string,
    message: string,
    variant: "danger" | "warning" | "info" = "danger"
  ) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        open: true,
        title,
        message,
        variant,
        resolve,
      });
    });
  }, []);

  const handleConfirmClose = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(null);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Portal/Overlay for Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-premium border backdrop-blur-xl animate-in slide-in-from-right duration-300 transition-all ${
              t.type === "success"
                ? "bg-emerald-500/95 border-emerald-400 text-white"
                : t.type === "error"
                ? "bg-rose-500/95 border-rose-400 text-white"
                : "bg-slate-900/95 border-slate-800 text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === "success" && <CheckCircle2 size={20} className="shrink-0" />}
              {t.type === "error" && <AlertCircle size={20} className="shrink-0" />}
              {t.type === "info" && <Info size={20} className="shrink-0" />}
              <span className="text-sm font-bold tracking-wide">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmState && confirmState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
            onClick={() => handleConfirmClose(false)}
          />

          {/* Modal Content Card */}
          <div className="relative bg-white rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 w-full max-w-md p-8 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              {/* Icon Container */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-sm ${
                  confirmState.variant === "danger"
                    ? "bg-rose-50 text-rose-500 border border-rose-100/50"
                    : confirmState.variant === "warning"
                    ? "bg-amber-50 text-amber-500 border border-amber-100/50"
                    : "bg-blue-50 text-blue-500 border border-blue-100/50"
                }`}
              >
                {confirmState.variant === "danger" ? (
                  <AlertTriangle size={32} className="animate-pulse" />
                ) : confirmState.variant === "warning" ? (
                  <AlertTriangle size={32} />
                ) : (
                  <HelpCircle size={32} />
                )}
              </div>

              {/* Title & Message */}
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                {confirmState.title}
              </h3>
              <p className="text-slate-500 text-sm font-semibold leading-relaxed px-2 mb-8">
                {confirmState.message}
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => handleConfirmClose(false)}
                  className="py-4 px-6 rounded-2xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-xs uppercase tracking-widest cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleConfirmClose(true)}
                  className={`py-4 px-6 rounded-2xl font-black text-white active:scale-95 transition-all text-xs uppercase tracking-widest cursor-pointer shadow-sm ${
                    confirmState.variant === "danger"
                      ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/10"
                      : confirmState.variant === "warning"
                      ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10"
                  }`}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification debe usarse dentro de un NotificationProvider");
  }
  return context;
}

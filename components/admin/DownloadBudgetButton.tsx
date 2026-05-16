"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { useNotification } from "@/components/ui/NotificationProvider";

interface DownloadBudgetButtonProps {
  budgetId: string;
}

export default function DownloadBudgetButton({ budgetId }: DownloadBudgetButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useNotification();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/orders/${budgetId}`);
      if (!res.ok) throw new Error("Error al obtener los detalles del presupuesto");
      const budgetData = await res.json();
      
      const { generateBudgetPDF } = await import("@/lib/pdf-generator");
      generateBudgetPDF(budgetData);
      toast("Descarga de PDF iniciada con éxito", "success");
    } catch (error: any) {
      toast("Error al descargar el PDF: " + error.message, "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
    >
      <FileDown size={14} className={downloading ? "animate-pulse" : ""} />
      {downloading ? "Descargando..." : "Descargar PDF"}
    </button>
  );
}

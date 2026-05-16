import { create } from "zustand";

interface DolarState {
  cotizacion: number | null;
  isLoading: boolean;
  error: string | null;
  fetchCotizacion: () => Promise<number>;
  convertirAPesos: (usd: number) => number;
}

export const useDolarStore = create<DolarState>((set, get) => ({
  cotizacion: null,
  isLoading: false,
  error: null,

  fetchCotizacion: async () => {
    // Si ya tenemos cotización, no volvemos a cargarla para evitar peticiones redundantes
    if (get().cotizacion !== null && !get().error) {
      return get().cotizacion as number;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/dolar");
      if (!res.ok) {
        throw new Error(`Error en API: ${res.statusText}`);
      }
      const data = await res.json();
      
      if (data.status === "ok" && data.venta_billete) {
        const rate = data.venta_billete;
        set({ cotizacion: rate, isLoading: false });
        return rate;
      } else {
        throw new Error("Respuesta inválida de la API de cotizaciones");
      }
    } catch (err: any) {
      console.error("Fallo al obtener cotización en dolarStore:", err.message);
      set({ 
        error: err.message || "Error al cargar la cotización", 
        isLoading: false 
      });

      // Salvaguarda: usar cotización fija por defecto si falla la llamada
      const cotizacionFallback = 950;
      set({ cotizacion: cotizacionFallback });
      return cotizacionFallback;
    }
  },

  convertirAPesos: (usd: number) => {
    const rate = get().cotizacion ?? 950; // Fallback instantáneo en el cliente
    return usd * rate;
  }
}));

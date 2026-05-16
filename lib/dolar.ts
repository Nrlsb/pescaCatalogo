import * as cheerio from "cheerio";

// Cache duration: 30 minutes in milliseconds
const CACHE_DURATION_MS = 30 * 60 * 1000;

interface CotizacionData {
  venta: number;
  compra: number;
}

interface DolarCotizaciones {
  status: "ok" | "error";
  fecha_actualizacion: string;
  banco: string;
  venta_billete: number;
  compra_billete: number;
  venta_divisa: number;
  compra_divisa: number;
}

// In-memory cache for server-side queries
let serverCache: {
  data: DolarCotizaciones | null;
  timestamp: number | null;
} = {
  data: null,
  timestamp: null,
};

const limpiarTexto = (texto: string): string => {
  if (!texto) return "";
  return texto.replace(/\n/g, "").trim();
};

/**
 * Parsea valores de Billete.
 * Formato BNA: "922,50" o "1.020,00" (punto de miles, coma de decimal).
 */
const parsearFormatoBillete = (valor: string): number => {
  if (!valor) return 0;
  const limpio = limpiarTexto(valor);
  return parseFloat(limpio.replace(/\./g, "").replace(",", "."));
};

/**
 * Parsea valores de Divisa.
 * Formato BNA: "1,403.0000" o "901.0000".
 */
const parsearFormatoDivisa = (valor: string): number => {
  if (!valor) return 0;
  const limpio = limpiarTexto(valor);
  return parseFloat(limpio.replace(/,/g, ""));
};

/**
 * Obtiene la cotización actual del dólar desde la web del Banco Nación (scraping oficial).
 * Cuenta con un sistema de caché de 30 minutos del lado del servidor para evitar saturar el sitio de BNA
 * y mantener la tienda sumamente veloz.
 */
export async function getDolarCotizacion(): Promise<number> {
  const now = Date.now();

  // Si tenemos caché en memoria válido, lo usamos
  if (serverCache.data && serverCache.timestamp && (now - serverCache.timestamp < CACHE_DURATION_MS)) {
    return serverCache.data.venta_billete;
  }

  try {
    const response = await fetch("https://www.bna.com.ar/Personas", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 1800 } // Indica a Next.js que revalide cada 30 minutos
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // --- LÓGICA PARA BILLETES (Dólar U.S.A) ---
    const tablaBilletes = $("#billetes");
    const filaDolarBillete = tablaBilletes.find("tbody tr").first();
    const billeteCompraRaw = filaDolarBillete.find("td").eq(1).text();
    const billeteVentaRaw = filaDolarBillete.find("td").eq(2).text();

    // --- LÓGICA PARA DIVISAS (Dólar U.S.A) ---
    const tablaDivisas = $("#divisas");
    const filaDolarDivisa = tablaDivisas.find("tbody tr").first();
    const divisaCompraRaw = filaDolarDivisa.find("td").eq(1).text();
    const divisaVentaRaw = filaDolarDivisa.find("td").eq(2).text();

    const venta_billete = parsearFormatoBillete(billeteVentaRaw);
    const compra_billete = parsearFormatoBillete(billeteCompraRaw);
    const venta_divisa = parsearFormatoDivisa(divisaVentaRaw);
    const compra_divisa = parsearFormatoDivisa(divisaCompraRaw);

    if (!venta_billete || isNaN(venta_billete)) {
      throw new Error("No se pudo obtener un valor numérico válido para la venta de billetes.");
    }

    // Estructura de respuesta
    const nuevaRespuesta: DolarCotizaciones = {
      status: "ok",
      fecha_actualizacion: new Date(now).toISOString(),
      banco: "Banco de la Nación Argentina",
      venta_billete,
      compra_billete,
      venta_divisa,
      compra_divisa,
    };

    // Actualizar caché en memoria
    serverCache.data = nuevaRespuesta;
    serverCache.timestamp = now;

    return venta_billete;
  } catch (error: any) {
    console.error("Error en getDolarCotizacion scraping BNA:", error.message);
    
    // Si falla el scraping pero tenemos una versión previa en caché, la devolvemos como salvavidas
    if (serverCache.data) {
      console.warn("Retornando cotización de salvaguarda de caché expirado debido a falla.");
      return serverCache.data.venta_billete;
    }

    // Cotización por defecto en caso de fallo absoluto y sin caché (salvaguarda de negocio)
    const COTIZACION_FALLBACK = 950;
    console.warn(`Usando cotización fallback de $${COTIZACION_FALLBACK} debido a fallo absoluto de scraping.`);
    return COTIZACION_FALLBACK;
  }
}

/**
 * Devuelve el objeto completo de cotizaciones (útil para la API del cliente)
 */
export async function getFullDolarData(): Promise<DolarCotizaciones> {
  const now = Date.now();
  
  if (serverCache.data && serverCache.timestamp && (now - serverCache.timestamp < CACHE_DURATION_MS)) {
    return serverCache.data;
  }

  // Esto forzará la actualización del caché
  await getDolarCotizacion();
  
  return serverCache.data || {
    status: "error",
    fecha_actualizacion: new Date().toISOString(),
    banco: "Banco de la Nación Argentina",
    venta_billete: 950,
    compra_billete: 920,
    venta_divisa: 910,
    compra_divisa: 880,
  };
}

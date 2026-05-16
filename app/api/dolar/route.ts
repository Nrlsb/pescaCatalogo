import { NextResponse } from "next/server";
import { getFullDolarData } from "@/lib/dolar";

// Next.js segment config: forces dynamic execution to ensure we fetch and revalidate the exchange rates
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getFullDolarData();
    
    // Add custom header to indicate caching behavior
    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=600");
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Error al recuperar cotizaciones del Banco Nación.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

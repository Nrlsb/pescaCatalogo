import Link from "next/link";
import { Fish } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white mt-auto border-t border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#0ea5e9] z-0" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 text-white font-serif text-3xl mb-6 drop-shadow-md">
              <Fish size={32} className="text-[#38bdf8]" strokeWidth={2.5} />
              <span className="font-bold tracking-tight">PescaShop</span>
            </div>
            <p className="text-sm leading-relaxed text-white/90 max-w-xs font-medium">
              Tu destino premium para equipamiento de pesca. Calidad, tradición y pasión en cada lanzamiento.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Categorías</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/shop/category/canas" className="hover:text-white transition-colors">Cañas de Pesca</Link></li>
              <li><Link href="/shop/category/sensuelos" className="hover:text-white transition-colors">Señuelos Premium</Link></li>
              <li><Link href="/shop/category/accesorios" className="hover:text-white transition-colors">Accesorios</Link></li>
              <li><Link href="/shop/category/lineas" className="hover:text-white transition-colors">Líneas y Sedal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Compañía</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Envíos</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Suscribite</h3>
            <p className="text-sm text-gray-400 mb-4">Recibí ofertas exclusivas y consejos de pesca.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Tu email" 
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-primary transition-colors"
              />
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                Ok
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-widest uppercase font-bold text-white/80">
          <p>© {new Date().getFullYear()} PescaShop Premium. Todos los derechos reservados.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-white transition-colors">Facebook</Link>
            <Link href="#" className="hover:text-white transition-colors">YouTube</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Fish } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Fish size={22} />
              <span>PescaShop</span>
            </div>
            <p className="text-sm">
              Tu tienda especializada en artículos de pesca. Calidad y variedad
              para todos los niveles.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Categorías</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop/category/canas" className="hover:text-white transition-colors">Cañas de pesca</Link></li>
              <li><Link href="/shop/category/sensuelos" className="hover:text-white transition-colors">Señuelos</Link></li>
              <li><Link href="/shop/category/accesorios" className="hover:text-white transition-colors">Accesorios</Link></li>
              <li><Link href="/shop/category/lineas" className="hover:text-white transition-colors">Líneas y sedal</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Mi cuenta</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/account" className="hover:text-white transition-colors">Mi perfil</Link></li>
              <li><Link href="/account/orders" className="hover:text-white transition-colors">Mis pedidos</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Registrarse</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-sm text-center">
          © {new Date().getFullYear()} PescaShop. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

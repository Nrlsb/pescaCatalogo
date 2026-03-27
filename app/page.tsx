import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Fish, ShoppingCart, Truck, Shield } from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Fish size={48} className="text-blue-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Todo para tu pasión por la pesca
            </h1>
            <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
              Cañas, señuelos, accesorios y más. La mejor selección para
              pescadores profesionales y aficionados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-800 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <ShoppingCart size={20} />
                Ver catálogo
              </Link>
              <Link
                href="/shop/category/ofertas"
                className="inline-flex items-center justify-center gap-2 border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                Ver ofertas
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Truck,
                title: "Envío a todo el país",
                desc: "Despachos rápidos a domicilio",
              },
              {
                icon: Shield,
                title: "Productos originales",
                desc: "Garantía en todos los artículos",
              },
              {
                icon: Fish,
                title: "Expertos en pesca",
                desc: "Asesoramiento personalizado",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Icon size={24} className="text-blue-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="py-14 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Nuestras categorías
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Cañas", slug: "canas", emoji: "🎣" },
                { name: "Señuelos", slug: "sensuelos", emoji: "🐟" },
                { name: "Líneas", slug: "lineas", emoji: "🪢" },
                { name: "Accesorios", slug: "accesorios", emoji: "🧰" },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop/category/${cat.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="text-4xl mb-3">{cat.emoji}</div>
                  <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 px-4 text-center bg-white">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Tenés un negocio?
            </h2>
            <p className="text-gray-600 mb-6">
              Usá nuestro sistema de punto de venta y control de stock para
              gestionar tu negocio de pesca de manera eficiente.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors"
            >
              Acceder al sistema
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

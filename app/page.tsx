import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { Fish, ShoppingCart, Truck, Shield, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center overflow-hidden">
          <Image
            src="/images/hero.png"
            alt="Pesca al atardecer"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-2xl animate-in">
              <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
                Experimenta el Arte <br /> de la Pesca
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-lg font-sans">
                Equipamiento premium para el entusiasta dedicado. Encuentra la combinación perfecta de técnica y pasión.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-full hover:scale-105 transition-all btn-premium shadow-lg"
                >
                  <ShoppingCart size={20} />
                  Comprar Ahora
                </Link>
                <Link
                  href="/shop/category/ofertas"
                  className="inline-flex items-center justify-center gap-2 glass text-white font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-all border border-white/30"
                >
                  Ver Ofertas
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className="py-8 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Truck,
                title: "Envío a todo el país",
                desc: "Despachos rápidos y seguros",
              },
              {
                icon: Shield,
                title: "Garantía de Calidad",
                desc: "Productos originales seleccionados",
              },
              {
                icon: Fish,
                title: "Asesoría Experta",
                desc: "Hablamos tu mismo idioma",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 group">
                <div className="p-3 bg-secondary rounded-2xl group-hover:bg-primary/10 transition-colors">
                  <Icon size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Premium Categories */}
        <section className="py-20 px-4 bg-[#fcfcfc]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif text-foreground mb-4">Categorías Premium</h2>
              <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Cañas", slug: "canas", img: "/images/cat-rods.png", desc: "Explora nuestra gama" },
                { name: "Reels", slug: "reels", img: "/images/cat-reels.png", desc: "Ingeniería de precisión" },
                { name: "Señuelos", slug: "sensuelos", img: "/images/cat-lures.png", desc: "Atrae la captura" },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop/category/${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-premium hover:shadow-premium-hover transition-all"
                >
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h3 className="text-2xl font-serif text-white mb-1">{cat.name}</h3>
                    <p className="text-white/70 text-sm mb-4">{cat.desc}</p>
                    <div className="inline-flex items-center gap-2 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                      Ver colección <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Story / About */}
        <section className="py-24 px-4 bg-primary text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-accent opacity-10 skew-x-12 translate-x-20" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif mb-8">Pasión por cada lanzamiento</h2>
            <p className="text-xl text-white/80 mb-10 leading-relaxed font-sans">
              Desde 1995, acompañamos a los pescadores en sus mejores momentos. No solo vendemos equipo, compartimos una forma de vida. Nuestra selección está curada por expertos para garantizar que tu próxima aventura sea inolvidable.
            </p>
            <Link
              href="/auth/login"
              className="inline-block border-2 border-white/30 hover:border-white px-10 py-4 rounded-full font-bold transition-all hover:bg-white hover:text-primary"
            >
              Conocé nuestra historia
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

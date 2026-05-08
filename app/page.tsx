import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { Fish, ShoppingCart, Truck, Shield, ArrowRight, Sun, Anchor } from "lucide-react";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background Image & Sunrise Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero.png"
              alt="Pesca al atardecer"
              fill
              className="object-cover animate-in"
              style={{ animationDuration: '1.5s' }}
              priority
            />
            {/* Vibrant sunrise overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0284c7]/80 via-[#38bdf8]/40 to-[#f97316]/20 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-3xl animate-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-white text-sm font-semibold tracking-widest uppercase border-white/40 shadow-lg shadow-white/10">
                <Sun size={16} className="text-[#f97316]" />
                <span>Nueva Temporada de Pesca</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-serif text-white mb-6 leading-[1.1] drop-shadow-lg">
                Siente la <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#f97316]">Aventura</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/95 mb-10 max-w-xl font-sans drop-shadow font-medium leading-relaxed">
                Equipamiento vibrante y dinámico para quienes viven el mar. La mejor tecnología en cada lanzamiento.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-full hover:scale-105 transition-all shadow-xl hover:shadow-2xl hover:shadow-white/20"
                >
                  <ShoppingCart size={20} />
                  Explorar Tienda
                </Link>
                <Link
                  href="/shop/category/ofertas"
                  className="inline-flex items-center justify-center gap-2 glass text-white font-bold px-8 py-4 rounded-full hover:bg-white/20 transition-all border border-white/40 shadow-lg"
                >
                  Ver Ofertas Especiales
                </Link>
              </div>
            </div>
          </div>
          
          {/* Decorative floating elements */}
          <div className="absolute top-1/4 right-[10%] opacity-20 animate-float" style={{ animationDelay: '0s' }}>
            <Anchor size={120} className="text-white" />
          </div>
          <div className="absolute bottom-1/4 right-[20%] opacity-20 animate-float" style={{ animationDelay: '2s' }}>
            <Fish size={80} className="text-white" />
          </div>
        </section>

        {/* Features Bar */}
        <section className="py-12 bg-white relative z-20 -mt-10 mx-4 md:mx-auto max-w-6xl rounded-3xl shadow-premium border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
            {[
              {
                icon: Truck,
                title: "Envío Rápido",
                desc: "Despachos express a todo el país",
                color: "text-[#0284c7]",
                bg: "bg-[#e0f2fe]"
              },
              {
                icon: Shield,
                title: "Calidad Premium",
                desc: "Garantía en todos los productos",
                color: "text-[#f43f5e]",
                bg: "bg-[#ffe4e6]"
              },
              {
                icon: Fish,
                title: "Asesoría Activa",
                desc: "Expertos listos para ayudarte",
                color: "text-[#f97316]",
                bg: "bg-[#ffedd5]"
              },
            ].map(({ icon: Icon, title, desc, color, bg }, idx) => (
              <div key={title} className="flex items-center gap-5 group animate-in" style={{ animationDelay: `${0.3 + idx * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}>
                <div className={`p-4 rounded-2xl ${bg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <Icon size={28} className={color} />
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground mb-1">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Premium Categories */}
        <section className="py-24 px-4 bg-background">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-in" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              <h2 className="text-5xl font-serif text-foreground mb-4">Lo Mejor del Mar</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Descubre nuestra selección especializada para hacer de cada salida una experiencia inolvidable.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Cañas", slug: "canas", img: "/images/cat-rods.png", desc: "Flexibilidad y potencia", delay: "0.3s" },
                { name: "Reels", slug: "reels", img: "/images/cat-reels.png", desc: "Precisión extrema", delay: "0.4s" },
                { name: "Señuelos", slug: "sensuelos", img: "/images/cat-lures.png", desc: "Colores vibrantes", delay: "0.5s" },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop/category/${cat.slug}`}
                  className="group relative overflow-hidden rounded-[2rem] aspect-[4/5] shadow-lg hover:shadow-premium-hover transition-all duration-500 animate-in"
                  style={{ animationDelay: cat.delay, opacity: 0, animationFillMode: 'forwards' }}
                >
                  <Image
                    src={cat.img}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Vibrant gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0284c7]/90 via-[#0284c7]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  
                  <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-3xl font-serif text-white mb-2 drop-shadow-md">{cat.name}</h3>
                    <p className="text-white/90 text-sm mb-6 font-medium">{cat.desc}</p>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 border border-white/30">
                      Ver colección <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Story / About */}
        <section className="py-32 px-4 bg-sunrise text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pattern.svg')] opacity-10" />
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] bg-white/10 blur-[100px] rounded-full" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <Fish size={64} className="mx-auto mb-8 text-white/80 animate-float" />
            <h2 className="text-5xl md:text-7xl font-serif mb-8 drop-shadow-sm">Pasión Vibrante</h2>
            <p className="text-2xl text-white/95 mb-12 leading-relaxed font-sans font-medium max-w-3xl mx-auto">
              Nacimos con la energía del primer rayo de sol sobre el agua. No solo vendemos equipo, compartimos la emoción y la adrenalina de cada captura.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-3 bg-white text-[#f43f5e] px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl hover:shadow-2xl"
            >
              Nuestra Historia <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

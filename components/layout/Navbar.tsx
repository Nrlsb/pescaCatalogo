"use client";

import Link from "next/link";
import { ShoppingCart, ShoppingBag, Fish, Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import CartDrawer from "@/components/cart/CartDrawer";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const itemCount = useCartStore((s) => s.items.reduce((acc, item) => acc + item.quantity, 0));

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      if (user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

          if (error) throw error;
          if (data) {
            setIsAdmin((data as { role: string }).role === "admin");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          // Si hay error 500 (RLS recursion), al menos no rompemos el render
        }
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/shop", label: "Tienda" },
    { href: "/shop/category/canas", label: "Cañas" },
    { href: "/shop/category/sensuelos", label: "Señuelos" },
    { href: "/shop/category/accesorios", label: "Accesorios" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-serif text-3xl tracking-tight text-primary group transition-all">
              <Fish size={32} className="group-hover:rotate-12 transition-transform text-primary" strokeWidth={2} />
              <span>PescaShop</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors tracking-tight uppercase"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Link
                    href="/pos"
                    className="px-4 py-1.5 rounded-full bg-primary/5 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 transition-all flex items-center gap-1.5 border border-primary/20"
                  >
                    <ShoppingBag size={12} />
                    POS
                  </Link>
                  <Link
                    href="/admin"
                    className="px-4 py-1.5 rounded-full bg-primary text-[10px] font-bold uppercase tracking-widest text-white hover:opacity-90 transition-all"
                  >
                    Admin
                  </Link>
                </div>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <Link
                href="/account"
                className="p-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                aria-label="Mi cuenta"
              >
                <User size={22} strokeWidth={2} />
              </Link>

              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex p-2.5 rounded-xl text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <LogOut size={22} strokeWidth={2} />
                </button>
              )}

              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                aria-label="Carrito"
              >
                <ShoppingCart size={22} strokeWidth={2.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-black ring-2 ring-background">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2.5 rounded-xl text-muted-foreground hover:bg-secondary"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-2 animate-in">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <Link
                    href="/pos"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-blue-600 bg-blue-600/5 mb-2"
                  >
                    <ShoppingBag size={18} />
                    <span>Punto de Venta</span>
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-primary bg-primary/5"
                  >
                    Administración
                  </Link>
                </>
              )}
              {isLoggedIn && (
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all"
                >
                  <LogOut size={18} />
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>
          )}
        </div>
      </header>


      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

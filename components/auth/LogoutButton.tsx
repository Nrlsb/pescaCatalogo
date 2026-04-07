"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all disabled:opacity-50"
        >
            <LogOut size={18} />
            <span>{loading ? "Cerrando sesión..." : "Cerrar sesión"}</span>
        </button>
    );
}

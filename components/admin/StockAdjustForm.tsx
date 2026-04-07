"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { MOVEMENT_REASONS } from "@/lib/constants";

interface ProductWithVariants {
    id: string;
    name: string;
    sku: string | null;
    product_variants: {
        id: string;
        name: string;
        sku: string | null;
    }[];
}

interface Props {
    products: ProductWithVariants[];
}

export default function StockAdjustForm({ products }: Props) {
    const router = useRouter();
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [delta, setDelta] = useState("");
    const [reason, setReason] = useState("adjustment");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const selectedProduct = products.find((p) => p.id === selectedProductId);
    const variants = selectedProduct?.product_variants ?? [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !delta || !reason) return;

        setLoading(true);
        try {
            const res = await fetch("/api/inventory/adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: selectedProductId,
                    variant_id: selectedVariantId || null,
                    delta: parseInt(delta),
                    reason,
                    notes,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Error al ajustar el stock");
            }

            router.push("/admin/inventory");
            router.refresh();
        } catch (err: any) {
            alert(err.message || "Error al ajustar el stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    label="Producto"
                    value={selectedProductId}
                    onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        setSelectedVariantId("");
                    }}
                    options={products.map((p) => ({
                        value: p.id,
                        label: `${p.name}${p.sku ? ` (${p.sku})` : ""}`,
                    }))}
                    placeholder="Seleccionar producto..."
                    required
                />

                <Select
                    label="Variante (opcional)"
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    options={variants.map((v) => ({
                        value: v.id,
                        label: `${v.name}${v.sku ? ` (${v.sku})` : ""}`,
                    }))}
                    placeholder={variants.length > 0 ? "Seleccionar variante..." : "Sin variantes"}
                    disabled={variants.length === 0}
                />

                <Input
                    label="Cantidad (delta)"
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(e.target.value)}
                    placeholder="Ej: 10 para ingreso, -5 para salida"
                    required
                />

                <Select
                    label="Razón del movimiento"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    options={MOVEMENT_REASONS.map((r) => ({
                        value: r.value,
                        label: r.label,
                    }))}
                    required
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Notas (opcional)</label>
                <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Escribe alguna observación sobre este ajuste..."
                />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <Button type="submit" loading={loading} className="px-8">
                    Confirmar ajuste
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancelar
                </Button>
            </div>
        </form>
    );
}

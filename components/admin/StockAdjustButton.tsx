"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { MOVEMENT_REASONS } from "@/lib/constants";

interface Props {
  productId: string;
  productName: string;
  variantId?: string;
}

export default function StockAdjustButton({ productId, productName, variantId }: Props) {
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("adjustment");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId,
          delta: parseInt(delta),
          reason,
          notes,
        }),
      });
      if (!res.ok) throw new Error();
      setOpen(false);
      setDelta("");
      setNotes("");
      router.refresh();
    } catch {
      alert("Error al ajustar el stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-blue-600 hover:underline font-medium"
      >
        Ajustar
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Ajustar stock: ${productName}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Cantidad (positivo = entrada, negativo = salida)"
            type="number"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            required
            placeholder="+10 o -5"
          />
          <Select
            label="Razón"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            options={MOVEMENT_REASONS.map((r) => ({
              value: r.value,
              label: r.label,
            }))}
          />
          <Input
            label="Notas (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones..."
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>
              Confirmar ajuste
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

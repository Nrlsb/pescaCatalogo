"use client";

import { useState } from "react";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  currentStatus: string;
  currentPayment: string;
}

export default function OrderStatusUpdater({ orderId, currentStatus, currentPayment }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [payment, setPayment] = useState(currentPayment);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, payment_status: payment }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Error al actualizar el pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Actualizar estado</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Select
          label="Estado del pedido"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />
        <Select
          label="Estado del pago"
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          options={PAYMENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />
      </div>
      <Button onClick={handleSave} loading={loading}>
        Guardar cambios
      </Button>
    </div>
  );
}

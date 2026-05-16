"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/ui/NotificationProvider";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const { toast, confirm: customConfirm } = useNotification();

  const handleDelete = async () => {
    const confirmed = await customConfirm(
      "Eliminar Producto",
      "¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.",
      "danger"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el producto");
      toast("Producto eliminado exitosamente", "success");
      router.refresh();
    } catch (err: any) {
      toast(err.message || "Error al eliminar el producto", "error");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
    >
      <Trash2 size={16} />
    </button>
  );
}

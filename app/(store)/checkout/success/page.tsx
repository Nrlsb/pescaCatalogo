import Link from "next/link";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <CheckCircle size={72} className="text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        ¡Pedido confirmado!
      </h1>
      <p className="text-gray-600 mb-2">
        Tu pedido fue recibido exitosamente.
      </p>
      {params.order && (
        <p className="text-sm text-gray-500 mb-6">
          Número de pedido: <span className="font-mono font-medium">{params.order}</span>
        </p>
      )}
      <p className="text-sm text-gray-500 mb-8">
        Te contactaremos a la brevedad para coordinar el pago y el envío.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account/orders">
          <Button variant="outline">Ver mis pedidos</Button>
        </Link>
        <Link href="/shop">
          <Button>Seguir comprando</Button>
        </Link>
      </div>
    </div>
  );
}

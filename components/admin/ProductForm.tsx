"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { slugify } from "@/lib/formatters";
import { Plus, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Variant {
  id?: string;
  name: string;
  sku: string;
  price_delta: number;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sku: string | null;
    brand: string | null;
    price: number;
    compare_at_price: number | null;
    cost_price: number | null;
    category_id: string | null;
    is_active: boolean;
    is_featured: boolean;
    low_stock_threshold: number;
    images: string[];
    product_variants?: Variant[];
  };
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    sku: initialData?.sku ?? "",
    brand: initialData?.brand ?? "",
    price: initialData?.price?.toString() ?? "",
    compare_at_price: initialData?.compare_at_price?.toString() ?? "",
    cost_price: initialData?.cost_price?.toString() ?? "",
    category_id: initialData?.category_id ?? "",
    is_active: initialData?.is_active ?? true,
    is_featured: initialData?.is_featured ?? false,
    low_stock_threshold: initialData?.low_stock_threshold?.toString() ?? "5",
  });
  const [variants, setVariants] = useState<Variant[]>(
    initialData?.product_variants ?? []
  );
  const [initialStock, setInitialStock] = useState("0");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({
        ...f,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((f) => ({
      ...f,
      name,
      ...(isEdit ? {} : { slug: slugify(name) }),
    }));
  };

  const addVariant = () =>
    setVariants((v) => [...v, { name: "", sku: "", price_delta: 0 }]);

  const removeVariant = (index: number) =>
    setVariants((v) => v.filter((_, i) => i !== index));

  const updateVariant = (index: number, field: keyof Variant, value: string | number) =>
    setVariants((v) =>
      v.map((variant, i) => (i === index ? { ...variant, [field]: value } : variant))
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        ...form,
        price: parseFloat(form.price),
        compare_at_price: form.compare_at_price
          ? parseFloat(form.compare_at_price)
          : null,
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        low_stock_threshold: parseInt(form.low_stock_threshold),
        category_id: form.category_id || null,
        variants,
        initial_stock: isEdit ? undefined : parseInt(initialStock),
      };

      const res = await fetch(
        isEdit ? `/api/products/${initialData.id}` : "/api/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Error al guardar el producto");
      router.push("/admin/products");
      router.refresh();
    } catch {
      alert("Error al guardar el producto. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Información básica</h2>
        <Input
          label="Nombre del producto *"
          name="name"
          value={form.name}
          onChange={handleNameChange}
          required
          placeholder="Caña de spinning Pro Series"
        />
        <Input
          label="Slug (URL)"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          required
          placeholder="cana-spinning-pro-series"
          helperText="Se genera automáticamente desde el nombre"
        />
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Descripción del producto..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Marca"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Shimano, Daiwa..."
          />
          <Input
            label="SKU / Código"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            placeholder="PROD-001"
          />
        </div>
        <Select
          label="Categoría"
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Sin categoría"
        />
      </div>

      {/* Pricing */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Precios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Precio de venta *"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
            placeholder="1500.00"
          />
          <Input
            label="Precio tachado"
            name="compare_at_price"
            type="number"
            step="0.01"
            min="0"
            value={form.compare_at_price}
            onChange={handleChange}
            placeholder="2000.00"
            helperText="Para mostrar descuento"
          />
          <Input
            label="Precio de costo"
            name="cost_price"
            type="number"
            step="0.01"
            min="0"
            value={form.cost_price}
            onChange={handleChange}
            placeholder="800.00"
            helperText="Solo visible para admin"
          />
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Inventario</h2>
        <div className="grid grid-cols-2 gap-4">
          {!isEdit && (
            <Input
              label="Stock inicial"
              type="number"
              min="0"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              placeholder="0"
            />
          )}
          <Input
            label="Umbral stock bajo"
            name="low_stock_threshold"
            type="number"
            min="0"
            value={form.low_stock_threshold}
            onChange={handleChange}
            helperText="Alerta cuando el stock sea menor a este número"
          />
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Variantes (opcional)</h2>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <Plus size={16} />
            Agregar variante
          </button>
        </div>
        {variants.length === 0 ? (
          <p className="text-sm text-gray-500">
            Sin variantes. Agregá variantes si el producto tiene tallas, colores, etc.
          </p>
        ) : (
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    label="Nombre"
                    value={v.name}
                    onChange={(e) => updateVariant(i, "name", e.target.value)}
                    placeholder="Talla L / Color rojo"
                  />
                </div>
                <div className="w-28">
                  <Input
                    label="SKU"
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    placeholder="SKU"
                  />
                </div>
                <div className="w-32">
                  <Input
                    label="Diferencia precio"
                    type="number"
                    value={v.price_delta.toString()}
                    onChange={(e) =>
                      updateVariant(i, "price_delta", parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="p-2 text-red-400 hover:text-red-600 mb-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-gray-900">Configuración</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-700">Producto activo (visible en la tienda)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_featured"
            checked={form.is_featured}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm text-gray-700">Producto destacado</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading} size="lg">
          {isEdit ? "Guardar cambios" : "Crear producto"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { slugify } from "@/lib/formatters";
import { useNotification } from "@/components/ui/NotificationProvider";
import type { Category } from "@/types/database";

interface CategoryFormProps {
  categories: Category[];
}

export default function CategoryForm({ categories }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useNotification();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);

  // Solo permitir seleccionar categorías que no tengan un padre
  // (para simplificar a un máximo de 2 niveles: categoría y subcategoría)
  const parentCategories = categories.filter((c) => !c.parent_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description,
          parent_id: parentId || null,
        }),
      });
      if (!res.ok) throw new Error();
      setName("");
      setSlug("");
      setDescription("");
      setParentId("");
      toast("Categoría creada correctamente", "success");
      router.refresh();
    } catch {
      toast("Error al crear la categoría", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre *"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSlug(slugify(e.target.value));
        }}
        required
        placeholder="Cañas de spinning"
      />
      <Input
        label="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        required
        placeholder="canas-de-spinning"
      />
      <Input
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción de la categoría..."
      />
      <Select
        label="Categoría superior (Opcional)"
        value={parentId}
        onChange={(e) => setParentId(e.target.value)}
        options={parentCategories.map((c) => ({
          value: c.id,
          label: c.name,
        }))}
        placeholder="Ninguna (Categoría principal)"
      />
      <Button type="submit" loading={loading}>
        Crear categoría
      </Button>
    </form>
  );
}

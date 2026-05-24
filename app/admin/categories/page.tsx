export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import CategoryForm from "@/components/admin/CategoryForm";
import type { Category } from "@/types/database";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: rawCategories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  const categories = (rawCategories as Category[] | null) || [];

  // Organizar categorías jerárquicamente
  const parentCategories = categories.filter((c) => !c.parent_id);
  const subCategories = categories.filter((c) => c.parent_id);

  const orderedCategories: (Category & { isSub?: boolean })[] = [];
  
  parentCategories.forEach((parent) => {
    orderedCategories.push(parent);
    const children = subCategories.filter((child) => child.parent_id === parent.id);
    children.forEach((child) => {
      orderedCategories.push({
        ...child,
        isSub: true,
      });
    });
  });

  // Agregar subcategorías huérfanas por si acaso
  const orphanedSubs = subCategories.filter(
    (child) => !parentCategories.some((parent) => parent.id === child.parent_id)
  );
  orphanedSubs.forEach((child) => {
    orderedCategories.push({
      ...child,
      isSub: true,
    });
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Categorías</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Nueva categoría</h2>
            <CategoryForm categories={categories} />
          </div>
        </div>

        {/* List */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Slug</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderedCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      <div className="flex items-center">
                        {cat.isSub && (
                          <span className="text-gray-400 mr-2 font-mono select-none">
                            └─
                          </span>
                        )}
                        <span className={cat.isSub ? "text-gray-500 font-normal" : "text-gray-900 font-semibold"}>
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                    <td className="px-5 py-3">
                      <Badge color={cat.is_active ? "green" : "gray"}>
                        {cat.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orderedCategories.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No hay categorías todavía
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

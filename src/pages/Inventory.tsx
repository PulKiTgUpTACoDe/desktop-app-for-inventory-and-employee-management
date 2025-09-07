import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be >= 0"),
  costPrice: z.number().min(0, "Cost Price must be >= 0"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
});

type ProductFormValues = z.infer<typeof productSchema>;

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<ProductFormValues[]>([]);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      costPrice: 0,
      category: "",
      brand: "",
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      // @ts-expect-error: electronAPI is injected by Electron preload script
      if (window.electronAPI?.getProducts) {
        // @ts-expect-error: electronAPI is injected by Electron preload script
        const res = await window.electronAPI.getProducts();
        if (res.success) setProducts(res.data as ProductFormValues[]);
      }
    };
    fetchProducts();
  }, []);

  const onSubmit = async (data: ProductFormValues) => {
    console.log("Adding product =>", data);
    setProducts((prev) => [...prev, data]);
    reset();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Inventory
              </h2>

              {/* ✅ Product Form with RHF */}
              <h2 className="text-xl font-bold mb-4">Products</h2>
              <form
                className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Name"
                    className="border p-2 rounded w-48"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register("sku")}
                    type="text"
                    placeholder="SKU"
                    className="border p-2 rounded w-48"
                  />
                  {errors.sku && (
                    <p className="text-red-600 text-sm">{errors.sku.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    placeholder="Price"
                    className="border p-2 rounded w-32"
                  />
                  {errors.price && (
                    <p className="text-red-600 text-sm">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register("costPrice", { valueAsNumber: true })}
                    type="number"
                    placeholder="Cost Price"
                    className="border p-2 rounded w-32"
                  />
                  {errors.costPrice && (
                    <p className="text-red-600 text-sm">
                      {errors.costPrice.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("category")}
                    type="text"
                    placeholder="Category"
                    className="border p-2 rounded w-48"
                  />
                  {errors.category && (
                    <p className="text-red-600 text-sm">
                      {errors.category.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("brand")}
                    type="text"
                    placeholder="Brand"
                    className="border p-2 rounded w-48"
                  />
                  {errors.brand && (
                    <p className="text-red-600 text-sm">{errors.brand.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  {isSubmitting ? "Adding..." : "Add Product"}
                </button>
              </form>

              {/* ✅ Products Table */}
              <table className="w-full mb-8 bg-white rounded shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Cost Price</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Brand</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={i}>
                      <td className="p-2">{p.name}</td>
                      <td className="p-2">{p.sku}</td>
                      <td className="p-2">{p.price}</td>
                      <td className="p-2">{p.costPrice}</td>
                      <td className="p-2">{p.category}</td>
                      <td className="p-2">{p.brand}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Inventory;

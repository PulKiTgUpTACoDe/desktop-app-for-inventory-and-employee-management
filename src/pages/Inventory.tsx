import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductFormValues,
  CategoryFormValues,
  BrandFormValues,
  productSchema,
  categorySchema,
  brandSchema,
} from "../types/inventory";
import { inventoryService } from "../services/inventoryService";

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "brands"
  >("products");

  const productForm = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      costPrice: 0,
      description: "",
      categoryId: "",
      brandId: "",
    },
  });

  // React Hook Form setup for categories
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // React Hook Form setup for brands
  const brandForm = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsRes = await inventoryService.products.getAll();
        if (productsRes.success) setProducts(productsRes.data || []);

        // Fetch categories
        const categoriesRes = await inventoryService.categories.getAll();
        if (categoriesRes.success) setCategories(categoriesRes.data || []);

        // Fetch brands
        const brandsRes = await inventoryService.brands.getAll();
        if (brandsRes.success) setBrands(brandsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const onProductSubmit = async (data: ProductFormValues) => {
    try {
      const res = await inventoryService.products.create(data);
      if (res.success) {
        const productsRes = await inventoryService.products.getAll();
        if (productsRes.success) setProducts(productsRes.data || []);
        productForm.reset();
      } else {
        console.error("Error creating product:", res.error);
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const onCategorySubmit = async (data: CategoryFormValues) => {
    try {
      const res = await inventoryService.categories.create(data);
      if (res.success) {
        const categoriesRes = await inventoryService.categories.getAll();
        if (categoriesRes.success) setCategories(categoriesRes.data || []);
        categoryForm.reset();
      } else {
        console.error("Error creating category:", res.error);
      }
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const onBrandSubmit = async (data: BrandFormValues) => {
    try {
      const res = await inventoryService.brands.create(data);
      if (res.success) {
        const brandsRes = await inventoryService.brands.getAll();
        if (brandsRes.success) setBrands(brandsRes.data || []);
        brandForm.reset();
      } else {
        console.error("Error creating brand:", res.error);
      }
    } catch (error) {
      console.error("Error creating brand:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Inventory Management
              </h2>

              {/* Tab Navigation */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("products")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "products"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Products
                    </button>
                    <button
                      onClick={() => setActiveTab("categories")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "categories"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Categories
                    </button>
                    <button
                      onClick={() => setActiveTab("brands")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "brands"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Brands
                    </button>
                  </nav>
                </div>
              </div>

              {/* Products Tab */}
              {activeTab === "products" && (
                <>
                  {/* Product Form */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Add New Product
                    </h3>
                    <form
                      className="bg-gray-50 p-4 rounded-lg flex flex-wrap gap-4"
                      onSubmit={productForm.handleSubmit(onProductSubmit)}
                    >
                      <div>
                        <input
                          {...productForm.register("name")}
                          type="text"
                          placeholder="Product Name"
                          className="border p-2 rounded w-48"
                        />
                        {productForm.formState.errors.name && (
                          <p className="text-red-600 text-sm">
                            {productForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          {...productForm.register("sku")}
                          type="text"
                          placeholder="Stock Keeping Unit"
                          className="border p-2 rounded w-48"
                        />
                        {productForm.formState.errors.sku && (
                          <p className="text-red-600 text-sm">
                            {productForm.formState.errors.sku.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          {...productForm.register("price", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          className="border p-2 rounded w-32"
                        />
                        {productForm.formState.errors.price && (
                          <p className="text-red-600 text-sm">
                            {productForm.formState.errors.price.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <input
                          {...productForm.register("costPrice", {
                            valueAsNumber: true,
                          })}
                          type="number"
                          step="0.01"
                          placeholder="Cost Price"
                          className="border p-2 rounded w-32"
                        />
                        {productForm.formState.errors.costPrice && (
                          <p className="text-red-600 text-sm">
                            {productForm.formState.errors.costPrice.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <select
                          {...productForm.register("categoryId")}
                          className="border p-2 rounded w-48"
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {productForm.formState.errors.categoryId && (
                          <p className="text-red-600 text-sm">
                            {productForm.formState.errors.categoryId.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <select
                          {...productForm.register("brandId")}
                          className="border p-2 rounded w-48"
                        >
                          <option value="">Select Brand</option>
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                        {productForm.formState.errors.brandId && (
                          <p className="text-red-600 text-sm">
                            {productForm.formState.errors.brandId.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <textarea
                          {...productForm.register("description")}
                          placeholder="Description"
                          className="border p-2 rounded w-64"
                          rows={2}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={productForm.formState.isSubmitting}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {productForm.formState.isSubmitting
                          ? "Adding..."
                          : "Add Product"}
                      </button>
                    </form>
                  </div>

                  {/* Products Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded shadow">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">Name</th>
                          <th className="p-3 text-left">SKU</th>
                          <th className="p-3 text-left">Price</th>
                          <th className="p-3 text-left">Cost Price</th>
                          <th className="p-3 text-left">Category</th>
                          <th className="p-3 text-left">Brand</th>
                          <th className="p-3 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, i) => (
                          <tr key={product.id || i} className="border-t">
                            <td className="p-3">{product.name}</td>
                            <td className="p-3">{product.sku}</td>
                            <td className="p-3">
                              ${Number(product.price).toFixed(2)}
                            </td>
                            <td className="p-3">
                              ${Number(product.costPrice).toFixed(2)}
                            </td>
                            <td className="p-3">
                              {product.category?.name || "N/A"}
                            </td>
                            <td className="p-3">
                              {product.brand?.name || "N/A"}
                            </td>
                            <td className="p-3">
                              {product.description || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Categories Tab */}
              {activeTab === "categories" && (
                <>
                  {/* Category Form */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Add New Category
                    </h3>
                    <form
                      className="bg-gray-50 p-4 rounded-lg flex flex-wrap gap-4"
                      onSubmit={categoryForm.handleSubmit(onCategorySubmit)}
                    >
                      <div>
                        <input
                          {...categoryForm.register("name")}
                          type="text"
                          placeholder="Category Name"
                          className="border p-2 rounded w-48"
                        />
                        {categoryForm.formState.errors.name && (
                          <p className="text-red-600 text-sm">
                            {categoryForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <textarea
                          {...categoryForm.register("description")}
                          placeholder="Description"
                          className="border p-2 rounded w-64"
                          rows={2}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={categoryForm.formState.isSubmitting}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {categoryForm.formState.isSubmitting
                          ? "Adding..."
                          : "Add Category"}
                      </button>
                    </form>
                  </div>

                  {/* Categories Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded shadow">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">Name</th>
                          <th className="p-3 text-left">Description</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((category, i) => (
                          <tr key={category.id || i} className="border-t">
                            <td className="p-3">{category.name}</td>
                            <td className="p-3">
                              {category.description || "N/A"}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  category.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {category.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="p-3">
                              {new Date(
                                category.createdAt
                              ).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Brands Tab */}
              {activeTab === "brands" && (
                <>
                  {/* Brand Form */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Add New Brand
                    </h3>
                    <form
                      className="bg-gray-50 p-4 rounded-lg flex flex-wrap gap-4"
                      onSubmit={brandForm.handleSubmit(onBrandSubmit)}
                    >
                      <div>
                        <input
                          {...brandForm.register("name")}
                          type="text"
                          placeholder="Brand Name"
                          className="border p-2 rounded w-48"
                        />
                        {brandForm.formState.errors.name && (
                          <p className="text-red-600 text-sm">
                            {brandForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <textarea
                          {...brandForm.register("description")}
                          placeholder="Description"
                          className="border p-2 rounded w-64"
                          rows={2}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={brandForm.formState.isSubmitting}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                      >
                        {brandForm.formState.isSubmitting
                          ? "Adding..."
                          : "Add Brand"}
                      </button>
                    </form>
                  </div>

                  {/* Brands Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded shadow">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">Name</th>
                          <th className="p-3 text-left">Description</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brands.map((brand, i) => (
                          <tr key={brand.id || i} className="border-t">
                            <td className="p-3">{brand.name}</td>
                            <td className="p-3">
                              {brand.description || "N/A"}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  brand.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {brand.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="p-3">
                              {new Date(brand.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Inventory;

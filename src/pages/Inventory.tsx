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
import ConfirmationDialog from "../components/ConfirmationDialog";

import { formatPrismaDeleteError } from "../../electron/utils/errorHandling";

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "brands"
  >("products");

  // Edit states for each tab
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<
    "product" | "category" | "brand"
  >("product");

  // Form visibility states
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);

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

  const { setValue: setProductValue } = productForm;
  const { setValue: setCategoryValue } = categoryForm;
  const { setValue: setBrandValue } = brandForm;

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
      let res;
      if (isEditMode && editingProduct) {
        res = await inventoryService.products.update(editingProduct.id, data);
        if (res.success) {
          alert("Product updated successfully!");
        }
      } else {
        res = await inventoryService.products.create(data);
        if (res.success) {
          alert("Product created successfully!");
        }
      }

      if (res.success) {
        const productsRes = await inventoryService.products.getAll();
        if (productsRes.success) setProducts(productsRes.data || []);
        resetProductForm();
      } else {
        console.error("Error saving product:", res.error);
        alert(
          `Failed to ${
            isEditMode ? "update" : "create"
          } product. Please try again.`
        );
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(
        `Failed to ${
          isEditMode ? "update" : "create"
        } product. Please try again.`
      );
    }
  };

  const onCategorySubmit = async (data: CategoryFormValues) => {
    try {
      let res;
      if (isEditMode && editingCategory) {
        res = await inventoryService.categories.update(
          editingCategory.id,
          data
        );
        if (res.success) {
          alert("Category updated successfully!");
        }
      } else {
        res = await inventoryService.categories.create(data);
        if (res.success) {
          alert("Category created successfully!");
        }
      }

      if (res.success) {
        const categoriesRes = await inventoryService.categories.getAll();
        if (categoriesRes.success) setCategories(categoriesRes.data || []);
        resetCategoryForm();
      } else {
        console.error("Error saving category:", res.error);
        alert(
          `Failed to ${
            isEditMode ? "update" : "create"
          } category. Please try again.`
        );
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert(
        `Failed to ${
          isEditMode ? "update" : "create"
        } category. Please try again.`
      );
    }
  };

  const onBrandSubmit = async (data: BrandFormValues) => {
    try {
      let res;
      if (isEditMode && editingBrand) {
        res = await inventoryService.brands.update(editingBrand.id, data);
        if (res.success) {
          alert("Brand updated successfully!");
        }
      } else {
        res = await inventoryService.brands.create(data);
        if (res.success) {
          alert("Brand created successfully!");
        }
      }

      if (res.success) {
        const brandsRes = await inventoryService.brands.getAll();
        if (brandsRes.success) setBrands(brandsRes.data || []);
        resetBrandForm();
      } else {
        console.error("Error saving brand:", res.error);
        alert(
          `Failed to ${
            isEditMode ? "update" : "create"
          } brand. Please try again.`
        );
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      alert(
        `Failed to ${isEditMode ? "update" : "create"} brand. Please try again.`
      );
    }
  };

  // Reset form functions
  const resetProductForm = () => {
    productForm.reset();
    setIsEditMode(false);
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const resetCategoryForm = () => {
    categoryForm.reset();
    setIsEditMode(false);
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const resetBrandForm = () => {
    brandForm.reset();
    setIsEditMode(false);
    setEditingBrand(null);
    setShowBrandForm(false);
  };

  // Edit handlers
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsEditMode(true);
    setProductValue("name", product.name);
    setProductValue("sku", product.sku);
    setProductValue("price", product.price);
    setProductValue("costPrice", product.costPrice);
    setProductValue("description", product.description || "");
    setProductValue("categoryId", product.categoryId || "");
    setProductValue("brandId", product.brandId || "");
    setShowProductForm(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setIsEditMode(true);
    setCategoryValue("name", category.name);
    setCategoryValue("description", category.description || "");
    setShowCategoryForm(true);
  };

  const handleEditBrand = (brand: any) => {
    setEditingBrand(brand);
    setIsEditMode(true);
    setBrandValue("name", brand.name);
    setBrandValue("description", brand.description || "");
    setShowBrandForm(true);
  };

  // Delete handlers
  const handleDeleteProduct = (product: any) => {
    setItemToDelete(product);
    setDeleteType("product");
    setShowDeleteDialog(true);
  };

  const handleDeleteCategory = (category: any) => {
    setItemToDelete(category);
    setDeleteType("category");
    setShowDeleteDialog(true);
  };

  const handleDeleteBrand = (brand: any) => {
    setItemToDelete(brand);
    setDeleteType("brand");
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      let res;
      if (deleteType === "product") {
        res = await inventoryService.products.delete(itemToDelete.id);
      } else if (deleteType === "category") {
        res = await inventoryService.categories.delete(itemToDelete.id);
      } else {
        res = await inventoryService.brands.delete(itemToDelete.id);
      }

      // console.log(formatPrismaDeleteError(String(res.error), res.error));

      if (res.success) {
        alert(
          `${
            deleteType.charAt(0).toUpperCase() + deleteType.slice(1)
          } deleted successfully!`
        );
        // Refresh the appropriate list
        if (deleteType === "product") {
          const productsRes = await inventoryService.products.getAll();
          if (productsRes.success) setProducts(productsRes.data || []);
        } else if (deleteType === "category") {
          const categoriesRes = await inventoryService.categories.getAll();
          if (categoriesRes.success) setCategories(categoriesRes.data || []);
        } else {
          const brandsRes = await inventoryService.brands.getAll();
          if (brandsRes.success) setBrands(brandsRes.data || []);
        }
      } else {
        console.error(`Error deleting ${deleteType}:`, res.error);
        let err = formatPrismaDeleteError(`${deleteType}`, String(res.error));

        alert(err.error);
      }
    } catch (err: any) {
      console.error(`Error deleting ${deleteType}:`, err);
      alert(`Failed to delete ${deleteType}. Please try again.`);
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Products</h3>
                    <button
                      onClick={() => {
                        resetProductForm();
                        setShowProductForm(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Add New Product
                    </button>
                  </div>

                  {/* Product Form - Only show when creating or editing */}
                  {showProductForm && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {isEditMode ? "Edit Product" : "Add New Product"}
                        </h4>
                        <button
                          onClick={resetProductForm}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <form
                        className="flex flex-wrap gap-4"
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
                            ? "Saving..."
                            : isEditMode
                            ? "Update Product"
                            : "Add Product"}
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 rounded border hover:bg-gray-50"
                          onClick={resetProductForm}
                        >
                          Cancel
                        </button>
                      </form>
                    </div>
                  )}

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
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-6 py-4 text-center text-gray-500"
                            >
                              No Products found. Add some products to get
                              started.
                            </td>
                          </tr>
                        ) : (
                          products.map((product, i) => (
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
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Edit Product"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                    title="Delete Product"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Categories Tab */}
              {activeTab === "categories" && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Categories</h3>
                    <button
                      onClick={() => {
                        resetCategoryForm();
                        setShowCategoryForm(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Add New Category
                    </button>
                  </div>

                  {/* Category Form */}
                  {showCategoryForm && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {isEditMode ? "Edit Category" : "Add New Category"}
                        </h4>
                        <button
                          onClick={resetCategoryForm}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <form
                        className="flex flex-wrap gap-4"
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
                            ? "Saving..."
                            : isEditMode
                            ? "Update Category"
                            : "Add Category"}
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 rounded border hover:bg-gray-50"
                          onClick={resetCategoryForm}
                        >
                          Cancel
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Categories Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded shadow">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">Name</th>
                          <th className="p-3 text-left">Description</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Created</th>
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-3 text-center text-gray-500"
                            >
                              No categories found.
                            </td>
                          </tr>
                        ) : (
                          categories.map((category, i) => (
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
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditCategory(category)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit Category"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteCategory(category)
                                    }
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete Category"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Brands Tab */}
              {activeTab === "brands" && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Brands</h3>
                    <button
                      onClick={() => {
                        resetBrandForm();
                        setShowBrandForm(true);
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                    >
                      Add New Brand
                    </button>
                  </div>

                  {/* Brand Form */}
                  {showBrandForm && (
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {isEditMode ? "Edit Brand" : "Add New Brand"}
                        </h4>
                        <button
                          onClick={resetBrandForm}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <form
                        className="flex flex-wrap gap-4"
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
                            ? "Saving..."
                            : isEditMode
                            ? "Update Brand"
                            : "Add Brand"}
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 rounded border hover:bg-gray-50"
                          onClick={resetBrandForm}
                        >
                          Cancel
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Brands Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded shadow">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-3 text-left">Name</th>
                          <th className="p-3 text-left">Description</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Created</th>
                          <th className="p-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brands.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-3 text-center text-gray-500"
                            >
                              No brands found.
                            </td>
                          </tr>
                        ) : (
                          brands.map((brand, i) => (
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
                              <td className="p-3">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditBrand(brand)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Edit Brand"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBrand(brand)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete Brand"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      {showDeleteDialog && (
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title={`Delete ${
            deleteType.charAt(0).toUpperCase() + deleteType.slice(1)
          }`}
          message={`Are you sure you want to delete this ${deleteType}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </div>
  );
};

export default Inventory;

// Type augmentation for window.electronAPI
declare global {
  interface Window {
    electronAPI?: {
      getProducts?: () => Promise<{ success: boolean; data: any[] }>;
      // add other methods as needed
    };
  }
}


import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (window.electronAPI?.getProducts) {
        const res = await window.electronAPI.getProducts();
        if (res.success) setProducts(res.data);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory</h2>
              <h2 className="text-xl font-bold mb-4">Products</h2>
              {/* Product Form */}
              <form className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap gap-4">
                <input type="text" placeholder="Name" className="border p-2 rounded w-48" />
                <input type="text" placeholder="SKU" className="border p-2 rounded w-48" />
                <input type="number" placeholder="Price" className="border p-2 rounded w-32" />
                <input type="number" placeholder="Cost Price" className="border p-2 rounded w-32" />
                <input type="text" placeholder="Category" className="border p-2 rounded w-48" />
                <input type="text" placeholder="Brand" className="border p-2 rounded w-48" />
                <button className="bg-blue-600 text-white px-4 py-2 rounded">Add Product</button>
              </form>
              {/* Product List */}
              <table className="w-full mb-8 bg-white rounded shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Brand</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">Sample Product</td>
                    <td className="p-2">SKU123</td>
                    <td className="p-2">100.00</td>
                    <td className="p-2">Category A</td>
                    <td className="p-2">Brand X</td>
                  </tr>
                </tbody>
              </table>

              <h2 className="text-xl font-bold mt-8 mb-4">Categories</h2>
              {/* Category Form */}
              <form className="bg-gray-50 p-4 rounded-lg mb-6 flex gap-4">
                <input type="text" placeholder="Name" className="border p-2 rounded w-48" />
                <input type="text" placeholder="Description" className="border p-2 rounded w-64" />
                <button className="bg-green-600 text-white px-4 py-2 rounded">Add Category</button>
              </form>
              {/* Category List */}
              <table className="w-full mb-8 bg-white rounded shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">Category A</td>
                    <td className="p-2">Description of Category A</td>
                  </tr>
                </tbody>
              </table>

              <h2 className="text-xl font-bold mt-8 mb-4">Brands</h2>
              {/* Brand Form */}
              <form className="bg-gray-50 p-4 rounded-lg mb-6 flex gap-4">
                <input type="text" placeholder="Name" className="border p-2 rounded w-48" />
                <input type="text" placeholder="Description" className="border p-2 rounded w-64" />
                <button className="bg-purple-600 text-white px-4 py-2 rounded">Add Brand</button>
              </form>
              {/* Brand List */}
              <table className="w-full mb-8 bg-white rounded shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">Brand X</td>
                    <td className="p-2">Description of Brand X</td>
                  </tr>
                </tbody>
              </table>

              <h2 className="text-xl font-bold mt-8 mb-4">Stock</h2>
              {/* Stock Form */}
              <form className="bg-gray-50 p-4 rounded-lg mb-6 flex gap-4">
                <input type="text" placeholder="Product" className="border p-2 rounded w-48" />
                <input type="number" placeholder="Quantity" className="border p-2 rounded w-32" />
                <input type="text" placeholder="Location" className="border p-2 rounded w-48" />
                <button className="bg-orange-600 text-white px-4 py-2 rounded">Add Stock</button>
              </form>
              {/* Stock List */}
              <table className="w-full mb-8 bg-white rounded shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-left">Quantity</th>
                    <th className="p-2 text-left">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2">Sample Product</td>
                    <td className="p-2">50</td>
                    <td className="p-2">Warehouse 1</td>
                  </tr>
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

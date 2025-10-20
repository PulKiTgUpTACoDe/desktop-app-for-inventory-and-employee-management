import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema, SupplierFormValues } from "../types/supplier";
import { supplierService } from "../services/supplierService";

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
    },
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await supplierService.getAll();
        if (res.success) setSuppliers(res.data || []);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      const res = await supplierService.create(data);
      if (res.success) {
        const suppliersRes = await supplierService.getAll();
        if (suppliersRes.success) setSuppliers(suppliersRes.data || []);
        reset();
      } else {
        console.error("Error creating supplier:", res.error);
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
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
                Suppliers
              </h2>
              <h2 className="text-xl font-bold mb-4">Add Supplier</h2>
              <form
                className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Name"
                    className="border p-2 rounded w-full"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="Email"
                    className="border p-2 rounded w-full"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("phone")}
                    type="text"
                    placeholder="Phone"
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <input
                    {...register("contactPerson")}
                    type="text"
                    placeholder="Contact Person"
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    {...register("address")}
                    type="text"
                    placeholder="Address"
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {isSubmitting ? "Saving..." : "Add Supplier"}
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded border"
                    onClick={() => reset()}
                  >
                    Reset
                  </button>
                </div>
              </form>
              <h2 className="text-xl font-bold mt-8 mb-4">Supplier List</h2>
              {/* Supplier List Table */}
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded shadow">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Phone</th>
                      <th className="p-3 text-left">Contact Person</th>
                      <th className="p-3 text-left">Address</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier, i) => (
                      <tr key={supplier.id || i} className="border-t">
                        <td className="p-3">{supplier.name}</td>
                        <td className="p-3">{supplier.email || "N/A"}</td>
                        <td className="p-3">{supplier.phone || "N/A"}</td>
                        <td className="p-3">
                          {supplier.contactPerson || "N/A"}
                        </td>
                        <td className="p-3">{supplier.address || "N/A"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              supplier.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {supplier.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3">
                          {new Date(supplier.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Suppliers;

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema, VendorFormValues } from "../types/vendor";
import { vendorService } from "../services/vendorService";

const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
    },
  });

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await vendorService.getAll();
        if (res.success) setVendors(res.data || []);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  const onSubmit = async (data: VendorFormValues) => {
    try {
      const res = await vendorService.create(data);
      if (res.success) {
        const vendorsRes = await vendorService.getAll();
        if (vendorsRes.success) setVendors(vendorsRes.data || []);
        reset();
      } else {
        console.error("Error creating vendor:", res.error);
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
    }
  };
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendors</h2>
              <h2 className="text-xl font-bold mb-4">Add Vendor</h2>
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
                    {isSubmitting ? "Saving..." : "Add Vendor"}
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
              <h2 className="text-xl font-bold mt-8 mb-4">Vendor List</h2>
              {/* Vendor List Table */}
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
                    {vendors.map((vendor, i) => (
                      <tr key={vendor.id || i} className="border-t">
                        <td className="p-3">{vendor.name}</td>
                        <td className="p-3">{vendor.email || "N/A"}</td>
                        <td className="p-3">{vendor.phone || "N/A"}</td>
                        <td className="p-3">{vendor.contactPerson || "N/A"}</td>
                        <td className="p-3">{vendor.address || "N/A"}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              vendor.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {vendor.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3">
                          {new Date(vendor.createdAt).toLocaleDateString()}
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

export default Vendors;

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vendorSchema, VendorFormValues } from "../types/vendor";
import { vendorService } from "../services/vendorService";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { formatPrismaDeleteError } from "../../electron/utils/errorHandling";

const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
      let response;
      if (isEditMode && editingVendor) {
        response = await vendorService.update(editingVendor.id, data);
        if (response.success) {
          console.log("✅ Vendor updated:", response.data);
          alert("Vendor updated successfully!");
        }
      } else {
        response = await vendorService.create(data);
        if (response.success) {
          console.log("✅ Vendor created:", response.data);
          alert("Vendor created successfully!");
        }
      }

      if (response.success) {
        const vendorsRes = await vendorService.getAll();
        if (vendorsRes.success) setVendors(vendorsRes.data || []);
        resetForm();
      } else {
        console.error("❌ Error saving vendor:", response.error);
        alert(
          `Failed to ${
            isEditMode ? "update" : "create"
          } vendor. Please try again.`
        );
      }
    } catch (err: any) {
      console.error("❌ Error saving vendor:", err);
      alert(
        `Failed to ${
          isEditMode ? "update" : "create"
        } vendor. Please try again.`
      );
    }
  };

  const resetForm = () => {
    reset();
    setIsEditMode(false);
    setEditingVendor(null);
    setShowCreateDialog(false);
  };

  const handleEdit = (vendor: any) => {
    setEditingVendor(vendor);
    setIsEditMode(true);
    setValue("name", vendor.name);
    setValue("email", vendor.email || "");
    setValue("phone", vendor.phone || "");
    setValue("address", vendor.address || "");
    setValue("contactPerson", vendor.contactPerson || "");
  };

  const handleDelete = (vendor: any) => {
    setVendorToDelete(vendor);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!vendorToDelete) return;

    try {
      const response = await vendorService.delete(vendorToDelete.id);
      if (response.success) {
        console.log("✅ Vendor deleted:", vendorToDelete.id);
        alert("Vendor deleted successfully!");
        const vendorsRes = await vendorService.getAll();
        if (vendorsRes.success) setVendors(vendorsRes.data || []);
      } else {
        console.error("❌ Error deleting vendor:", response.error);
        let err = formatPrismaDeleteError(`vendor`, String(response.error));

        alert(err.error);
      }
    } catch (err: any) {
      console.error("❌ Error deleting vendor:", err);
      alert("Failed to delete vendor. Please try again.");
    } finally {
      setShowDeleteDialog(false);
      setVendorToDelete(null);
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setShowCreateDialog(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Vendors</h2>
                <button
                  onClick={handleCreateNew}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Add New Vendor
                </button>
              </div>

              {/* Vendor Form - Only show when creating or editing */}
              {(isEditMode || showCreateDialog) && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isEditMode ? "Edit Vendor" : "Add New Vendor"}
                    </h3>
                    <button
                      onClick={resetForm}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
                        {...register("phone", { pattern: /^[0-9]{10}$/ })}
                        type="number"
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
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {isSubmitting
                          ? "Saving..."
                          : isEditMode
                          ? "Update Vendor"
                          : "Add Vendor"}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded border hover:bg-gray-50"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

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
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No Products found. Add some products to get started.
                        </td>
                      </tr>
                    ) : (
                      vendors.map((vendor, i) => (
                        <tr key={vendor.id || i} className="border-t">
                          <td className="p-3">{vendor.name}</td>
                          <td className="p-3">{vendor.email || "N/A"}</td>
                          <td className="p-3">{vendor.phone || "N/A"}</td>
                          <td className="p-3">
                            {vendor.contactPerson || "N/A"}
                          </td>
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
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(vendor)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit Vendor"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(vendor)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete Vendor"
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
          title="Delete Vendor"
          message={`Are you sure you want to delete ${vendorToDelete?.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </div>
  );
};

export default Vendors;

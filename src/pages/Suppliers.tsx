import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema, SupplierFormValues } from "../types/supplier";
import { supplierService } from "../services/supplierService";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { formatPrismaDeleteError } from "../../electron/utils/errorHandling";

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
      let response;
      if (isEditMode && editingSupplier) {
        response = await supplierService.update(editingSupplier.id, data);
        if (response.success) {
          console.log("✅ Supplier updated:", response.data);
          alert("Supplier updated successfully!");
        }
      } else {
        response = await supplierService.create(data);
        if (response.success) {
          console.log("✅ Supplier created:", response.data);
          alert("Supplier created successfully!");
        }
      }

      if (response.success) {
        const suppliersRes = await supplierService.getAll();
        if (suppliersRes.success) setSuppliers(suppliersRes.data || []);
        resetForm();
      } else {
        console.error("❌ Error saving supplier:", response.error);
        alert(
          `Failed to ${
            isEditMode ? "update" : "create"
          } supplier. Please try again.`
        );
      }
    } catch (err: any) {
      console.error("❌ Error saving supplier:", err);
      alert(
        `Failed to ${
          isEditMode ? "update" : "create"
        } supplier. Please try again.`
      );
    }
  };

  const resetForm = () => {
    reset();
    setIsEditMode(false);
    setEditingSupplier(null);
    setShowCreateDialog(false);
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setIsEditMode(true);
    setValue("name", supplier.name);
    setValue("email", supplier.email || "");
    setValue("phone", supplier.phone || "");
    setValue("address", supplier.address || "");
    setValue("contactPerson", supplier.contactPerson || "");
  };

  const handleDelete = (supplier: any) => {
    setSupplierToDelete(supplier);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      const response = await supplierService.delete(supplierToDelete.id);
      if (response.success) {
        console.log("✅ Supplier deleted:", supplierToDelete.id);
        alert("Supplier deleted successfully!");
        const suppliersRes = await supplierService.getAll();
        if (suppliersRes.success) setSuppliers(suppliersRes.data || []);
      } else {
        console.error("❌ Error deleting supplier:", response.error);
        let err = formatPrismaDeleteError(`supplier`, String(response.error));

        alert(err.error);
      }
    } catch (err: any) {
      console.error("❌ Error deleting supplier:", err);
      alert("Failed to delete supplier. Please try again.");
    } finally {
      setShowDeleteDialog(false);
      setSupplierToDelete(null);
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
                <h2 className="text-2xl font-bold text-gray-900">Suppliers</h2>
                <button
                  onClick={handleCreateNew}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Add New Supplier
                </button>
              </div>

              {/* Supplier Form - Only show when creating or editing */}
              {(isEditMode || showCreateDialog) && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isEditMode ? "Edit Supplier" : "Add New Supplier"}
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
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {isSubmitting
                          ? "Saving..."
                          : isEditMode
                          ? "Update Supplier"
                          : "Add Supplier"}
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
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No Products found. Add some products to get started.
                        </td>
                      </tr>
                    ) : (
                      suppliers.map((supplier, i) => (
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
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(supplier)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit Supplier"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(supplier)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete Supplier"
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
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete ${supplierToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Suppliers;

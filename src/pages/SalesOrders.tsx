import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { salesOrderSchema, SalesOrderFormValues } from "../types/salesOrder";
import { salesOrderService } from "../services/salesOrderService";
import { vendorService } from "../services/vendorService";
import { inventoryService } from "../services/inventoryService";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { formatPrismaDeleteError } from "../../electron/utils/errorHandling";

const SalesOrders: React.FC = () => {
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      orderNumber: "", // This will be generated on the backend
      vendorId: "",
      orderDate: new Date().toISOString().split("T")[0],
      expectedDelivery: "",
      notes: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const itemsWatch = watch("items") || [];
  const total = itemsWatch.reduce(
    (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0),
    0
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [salesOrdersRes, vendorsRes, productsRes] = await Promise.all([
          salesOrderService.getAll(),
          vendorService.getAll(),
          inventoryService.products.getAll(),
        ]);

        if (salesOrdersRes.success) setSalesOrders(salesOrdersRes.data || []);
        if (vendorsRes.success) setVendors(vendorsRes.data || []);
        if (productsRes.success) setProducts(productsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: SalesOrderFormValues) => {
    console.log("Entered onSubmit with data:", data);

    try {
      let res;
      if (isEditMode && editingOrder) {
        console.log("Calling salesOrderService.update...");
        res = await salesOrderService.update(editingOrder.id, data);
      } else {
        console.log("Calling salesOrderService.create...");
        res = await salesOrderService.create(data);
      }
      console.log("Sales order service response:", res);

      if (res.success) {
        console.log("Sales order created successfully, refreshing list...");
        const salesOrdersRes = await salesOrderService.getAll();
        if (salesOrdersRes.success) {
          setSalesOrders(salesOrdersRes.data || []);
          console.log("Sales orders list updated");
        }
        resetForm();
        console.log("Form reset");
        alert(
          isEditMode
            ? "Sales order updated successfully!"
            : "Sales order created successfully!"
        );
      } else {
        console.error("Error saving sales order:", res.error);
        alert(
          `Error ${isEditMode ? "updating" : "creating"} sales order: ${
            res.error
          }`
        );
      }
    } catch (error) {
      console.error("Error saving sales order:", error);
      alert(
        `Error ${isEditMode ? "updating" : "creating"} sales order: ${error}`
      );
    }
  };

  const resetForm = () => {
    reset();
    setIsEditMode(false);
    setEditingOrder(null);
    setShowCreateDialog(false);
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setIsEditMode(true);
    const mappedItems = (order.items || []).map((it: any) => ({
      productId: it.productId,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
    }));
    reset({
      orderNumber: order.orderNumber || "",
      vendorId: order.vendorId || "",
      orderDate: order.orderDate
        ? new Date(order.orderDate).toISOString().split("T")[0]
        : "",
      expectedDelivery: order.expectedDelivery
        ? new Date(order.expectedDelivery).toISOString().split("T")[0]
        : "",
      notes: order.notes || "",
      items:
        mappedItems.length > 0
          ? mappedItems
          : [{ productId: "", quantity: 1, unitPrice: 0 }],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (order: any) => {
    setOrderToDelete(order);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      const res = await salesOrderService.delete(orderToDelete.id);
      if (res.success) {
        alert("Sales order deleted successfully!");
        const salesOrdersRes = await salesOrderService.getAll();
        if (salesOrdersRes.success) setSalesOrders(salesOrdersRes.data || []);
      } else {
        let err = formatPrismaDeleteError(`salesOrder`, String(res.error));

        alert(err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete sales order. Please try again.");
    } finally {
      setShowDeleteDialog(false);
      setOrderToDelete(null);
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setValue(`items.${index}.unitPrice`, Number(product.price));
    }
  };

  const updateSalesOrderStatus = async (id: string, status: string) => {
    try {
      const res = await salesOrderService.updateStatus(id, status);
      if (res.success) {
        const salesOrdersRes = await salesOrderService.getAll();
        if (salesOrdersRes.success) setSalesOrders(salesOrdersRes.data || []);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Sales Orders Management
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateDialog(true);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add New Sales Order
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  {/* Sales Order Form */}
                  {(isEditMode || showCreateDialog) && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          {isEditMode
                            ? "Edit Sales Order"
                            : "Create New Sales Order"}
                        </h3>
                        <button
                          onClick={resetForm}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          ✕
                        </button>
                      </div>
                      <form
                        className="bg-gray-50 p-6 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4"
                        onSubmit={handleSubmit(onSubmit)}
                      >
                        <div>
                          <select
                            {...register("vendorId")}
                            className="border p-2 rounded w-full"
                          >
                            <option value="">Select Vendor</option>
                            {vendors.map((vendor) => (
                              <option key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </option>
                            ))}
                          </select>
                          {errors.vendorId && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.vendorId.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <input
                            {...register("orderDate")}
                            type="date"
                            className="border p-2 rounded w-full"
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            Order Date
                          </p>
                          {errors.orderDate && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.orderDate.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <input
                            {...register("expectedDelivery")}
                            type="date"
                            className="border p-2 rounded w-full"
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            Expected Delivery
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <textarea
                            {...register("notes")}
                            placeholder="Notes (optional)"
                            className="border p-2 rounded w-full"
                            rows={2}
                          />
                        </div>

                        {/* Items Section */}
                        <div className="md:col-span-3">
                          <h4 className="font-semibold mb-3">Items</h4>
                          {fields.map((field, index) => (
                            <div
                              key={field.id}
                              className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 p-3 bg-white rounded border"
                            >
                              <select
                                {...register(
                                  `items.${index}.productId` as const
                                )}
                                className="border p-2 rounded w-full"
                                onChange={(e) =>
                                  handleProductChange(index, e.target.value)
                                }
                              >
                                <option value="">Select Product</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} - {product.sku}
                                  </option>
                                ))}
                              </select>

                              <input
                                {...register(
                                  `items.${index}.quantity` as const,
                                  {
                                    valueAsNumber: true,
                                  }
                                )}
                                type="number"
                                min={1}
                                placeholder="Quantity"
                                className="border p-2 rounded w-full"
                              />

                              <input
                                {...register(
                                  `items.${index}.unitPrice` as const,
                                  {
                                    valueAsNumber: true,
                                  }
                                )}
                                type="number"
                                step="0.01"
                                placeholder="Unit Price"
                                className="border p-2 rounded w-full"
                              />

                              <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-600 font-medium">
                                  Total: $
                                  {(
                                    (itemsWatch[index]?.quantity || 0) *
                                    (itemsWatch[index]?.unitPrice || 0)
                                  ).toFixed(2)}
                                </div>
                                <button
                                  type="button"
                                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                                  onClick={() => remove(index)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}

                          {typeof errors.items?.message === "string" && (
                            <p className="text-red-600 text-sm mb-2">
                              {errors.items?.message}
                            </p>
                          )}

                          <button
                            type="button"
                            className="px-4 py-2 bg-green-600 text-white rounded"
                            onClick={() =>
                              append({
                                productId: "",
                                quantity: 1,
                                unitPrice: 0,
                              })
                            }
                          >
                            Add Item
                          </button>
                        </div>

                        {/* Total and Submit */}
                        <div className="md:col-span-3 flex items-center justify-between bg-blue-50 p-4 rounded">
                          <div className="text-lg font-semibold text-gray-700">
                            Total Amount:
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${total.toFixed(2)}
                          </div>
                        </div>

                        <div className="md:col-span-3 flex gap-3">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {isSubmitting
                              ? "Saving..."
                              : isEditMode
                              ? "Update Sales Order"
                              : "Create Sales Order"}
                          </button>
                          <button
                            type="button"
                            className="px-6 py-2 rounded border hover:bg-gray-50"
                            onClick={resetForm}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Sales Orders List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Sales Orders List
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white rounded shadow">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-3 text-left">Order #</th>
                            <th className="p-3 text-left">Vendor</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Expected Delivery</th>
                            <th className="p-3 text-left">Total Amount</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Items</th>
                            <th className="p-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesOrders.length === 0 ? (
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
                            salesOrders.map((order, i) => (
                              <tr key={order.id || i} className="border-t">
                                <td className="p-3 font-medium">
                                  {order.orderNumber}
                                </td>
                                <td className="p-3">
                                  {order.vendor?.name || "N/A"}
                                </td>
                                <td className="p-3">
                                  {new Date(
                                    order.orderDate
                                  ).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                  {order.expectedDelivery
                                    ? new Date(
                                        order.expectedDelivery
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </td>
                                <td className="p-3 font-medium">
                                  ${Number(order.totalAmount).toFixed(2)}
                                </td>
                                <td className="p-3">
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      updateSalesOrderStatus(
                                        order.id,
                                        e.target.value
                                      )
                                    }
                                    className={`px-2 py-1 rounded text-xs border ${
                                      order.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                        : order.status === "confirmed"
                                        ? "bg-blue-100 text-blue-800 border-blue-300"
                                        : order.status === "shipped"
                                        ? "bg-purple-100 text-purple-800 border-purple-300"
                                        : order.status === "delivered"
                                        ? "bg-green-100 text-green-800 border-green-300"
                                        : "bg-red-100 text-red-800 border-red-300"
                                    }`}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="p-3">
                                  <div className="text-sm">
                                    {order.items?.length || 0} item(s)
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEdit(order)}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Edit Order"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDelete(order)}
                                      className="text-red-600 hover:text-red-800"
                                      title="Delete Order"
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
                </>
              )}
            </div>
          </div>
        </main>
        {/* Confirmation Dialog */}
        {showDeleteDialog && (
          <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="Delete Sales Order"
          message={`Are you sure you want to delete ${
            orderToDelete?.orderNumber || "this order"
          }? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
        )}
      </div>
    </div>
  );
};

export default SalesOrders;

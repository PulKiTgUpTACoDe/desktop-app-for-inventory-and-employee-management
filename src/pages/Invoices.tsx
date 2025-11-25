import React, { useEffect, useState } from "react";
import "../types/electronAPI";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, InvoiceFormValues } from "../types/invoice";
import { invoiceService } from "../services/invoiceService";
import { salesOrderService } from "../services/salesOrderService";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { formatPrismaDeleteError } from "../../electron/utils/errorHandling";

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: "", // This will be generated on the backend
      salesOrderId: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days from now
      totalAmount: 0,
      status: "pending",
    },
  });

  const salesOrderId = watch("salesOrderId");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [invoicesRes, salesOrdersRes] = await Promise.all([
          invoiceService.getAll(),
          salesOrderService.getAll(),
        ]);

        if (invoicesRes.success) setInvoices(invoicesRes.data || []);
        if (salesOrdersRes.success) setSalesOrders(salesOrdersRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update total amount when sales order is selected
  useEffect(() => {
    if (salesOrderId) {
      const salesOrder = salesOrders.find((so) => so.id === salesOrderId);
      if (salesOrder) {
        setSelectedSalesOrder(salesOrder);
        setValue("totalAmount", Number(salesOrder.totalAmount));
      }
    } else {
      setSelectedSalesOrder(null);
      setValue("totalAmount", 0);
    }
  }, [salesOrderId, salesOrders, setValue]);

  const onSubmit = async (data: InvoiceFormValues) => {
    console.log("Entered onSubmit with data:", data);

    try {
      let res;
      if (isEditMode && editingInvoice) {
        console.log("Calling invoiceService.update...");
        res = await invoiceService.update(editingInvoice.id, data);
      } else {
        console.log("Calling invoiceService.create...");
        res = await invoiceService.create(data);
      }
      console.log("Invoice service response:", res);

      if (res.success) {
        console.log("Invoice created successfully, refreshing list...");
        const invoicesRes = await invoiceService.getAll();
        if (invoicesRes.success) {
          setInvoices(invoicesRes.data || []);
          console.log("Invoices list updated");
        }
        resetForm();
        console.log("Form reset");
        alert(
          isEditMode
            ? "Invoice updated successfully!"
            : "Invoice created successfully!"
        );
      } else {
        console.error("Error saving invoice:", res.error);
        alert(
          `Error ${isEditMode ? "updating" : "creating"} invoice: ${res.error}`
        );
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(`Error ${isEditMode ? "updating" : "creating"} invoice: ${error}`);
    }
  };

  const resetForm = () => {
    reset();
    setIsEditMode(false);
    setEditingInvoice(null);
    setShowCreateDialog(false);
  };

  const handleEdit = (inv: any) => {
    setEditingInvoice(inv);
    setIsEditMode(true);
    reset({
      invoiceNumber: inv.invoiceNumber || "",
      salesOrderId: inv.salesOrderId || "",
      invoiceDate: inv.invoiceDate
        ? new Date(inv.invoiceDate).toISOString().split("T")[0]
        : "",
      dueDate: inv.dueDate
        ? new Date(inv.dueDate).toISOString().split("T")[0]
        : "",
      totalAmount: Number(inv.totalAmount) || 0,
      status: inv.status || "pending",
    });
    const so = salesOrders.find((s) => s.id === inv.salesOrderId);
    setSelectedSalesOrder(so || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (inv: any) => {
    setInvoiceToDelete(inv);
    setShowDeleteDialog(true);
  };

  const handleDownloadPDF = async (invoice: any) => {
    try {
      const result = await window.electronAPI.generateInvoicePDF(invoice.id);
      
      if (result.success) {
        alert(`PDF generated successfully! Saved to: ${result.data.filePath}`);
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      const res = await invoiceService.delete(invoiceToDelete.id);
      if (res.success) {
        alert("Invoice deleted successfully!");
        const invoicesRes = await invoiceService.getAll();
        if (invoicesRes.success) setInvoices(invoicesRes.data || []);
      } else {
        let err = formatPrismaDeleteError(`invoice`, String(res.error));

        alert(err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete invoice. Please try again.");
    } finally {
      setShowDeleteDialog(false);
      setInvoiceToDelete(null);
    }
  };

  const updateInvoiceStatus = async (id: string, status: string) => {
    try {
      const res = await invoiceService.updateStatus(id, status);
      if (res.success) {
        const invoicesRes = await invoiceService.getAll();
        if (invoicesRes.success) setInvoices(invoicesRes.data || []);
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
                  Invoice Management
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateDialog(true);
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Add New Invoice
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  {/* Invoice Form */}
                  {(isEditMode || showCreateDialog) && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          {isEditMode ? "Edit Invoice" : "Create New Invoice"}
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
                            {...register("salesOrderId")}
                            className="border p-2 rounded w-full"
                          >
                            <option value="">Select Sales Order</option>
                            {salesOrders.map((salesOrder) => (
                              <option key={salesOrder.id} value={salesOrder.id}>
                                {salesOrder.orderNumber} -{" "}
                                {salesOrder.vendor?.name} - $
                                {Number(salesOrder.totalAmount).toFixed(2)}
                              </option>
                            ))}
                          </select>
                          {errors.salesOrderId && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.salesOrderId.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <input
                            {...register("invoiceDate")}
                            type="date"
                            className="border p-2 rounded w-full"
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            Invoice Date
                          </p>
                          {errors.invoiceDate && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.invoiceDate.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <input
                            {...register("dueDate")}
                            type="date"
                            className="border p-2 rounded w-full"
                          />
                          <p className="text-sm text-gray-600 mt-1">Due Date</p>
                          {errors.dueDate && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.dueDate.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <select
                            {...register("status")}
                            className="border p-2 rounded w-full"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <p className="text-sm text-gray-600 mt-1">Status</p>
                        </div>

                        {/* Sales Order Details Display */}
                        {selectedSalesOrder && (
                          <div className="md:col-span-3 bg-blue-50 p-4 rounded">
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Selected Sales Order Details:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">
                                  Order Number:
                                </span>{" "}
                                {selectedSalesOrder.orderNumber}
                              </div>
                              <div>
                                <span className="font-medium">Vendor:</span>{" "}
                                {selectedSalesOrder.vendor?.name}
                              </div>
                              <div>
                                <span className="font-medium">Order Date:</span>{" "}
                                {new Date(
                                  selectedSalesOrder.orderDate
                                ).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Items:</span>{" "}
                                {selectedSalesOrder.items?.length || 0} item(s)
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>{" "}
                                {selectedSalesOrder.status}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Total Amount Display */}
                        <div className="md:col-span-3 flex items-center justify-between bg-green-50 p-4 rounded">
                          <div className="text-lg font-semibold text-gray-700">
                            Total Amount:
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            ₹
                            {selectedSalesOrder
                              ? Number(selectedSalesOrder.totalAmount).toFixed(
                                  2
                                )
                              : "0.00"}
                          </div>
                        </div>

                        <div className="md:col-span-3 flex gap-3">
                          <button
                            type="submit"
                            disabled={isSubmitting || !selectedSalesOrder}
                            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isSubmitting
                              ? "Saving..."
                              : isEditMode
                              ? "Update Invoice"
                              : "Create Invoice"}
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

                  {/* Invoices List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Invoices List
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white rounded shadow">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-3 text-left">Invoice #</th>
                            <th className="p-3 text-left">Sales Order</th>
                            <th className="p-3 text-left">Vendor</th>
                            <th className="p-3 text-left">Invoice Date</th>
                            <th className="p-3 text-left">Due Date</th>
                            <th className="p-3 text-left">Total Amount</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.length === 0 ? (
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
                            invoices.map((invoice, i) => (
                              <tr key={invoice.id || i} className="border-t">
                                <td className="p-3 font-medium">
                                  {invoice.invoiceNumber}
                                </td>
                                <td className="p-3">
                                  {invoice.salesOrder?.orderNumber || "N/A"}
                                </td>
                                <td className="p-3">
                                  {invoice.salesOrder?.vendor?.name || "N/A"}
                                </td>
                                <td className="p-3">
                                  {new Date(
                                    invoice.invoiceDate
                                  ).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                  {new Date(
                                    invoice.dueDate
                                  ).toLocaleDateString()}
                                </td>
                                <td className="p-3 font-medium">
                                  ${Number(invoice.totalAmount).toFixed(2)}
                                </td>
                                <td className="p-3">
                                  <select
                                    value={invoice.status}
                                    onChange={(e) =>
                                      updateInvoiceStatus(
                                        invoice.id,
                                        e.target.value
                                      )
                                    }
                                    className={`px-2 py-1 rounded text-xs border ${
                                      invoice.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                        : invoice.status === "paid"
                                        ? "bg-green-100 text-green-800 border-green-300"
                                        : invoice.status === "overdue"
                                        ? "bg-red-100 text-red-800 border-red-300"
                                        : "bg-gray-100 text-gray-800 border-gray-300"
                                    }`}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEdit(invoice)}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Edit Invoice"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDelete(invoice)}
                                      className="text-red-600 hover:text-red-800"
                                      title="Delete Invoice"
                                    >
                                      🗑️
                                    </button>
                                    <button
                                      onClick={() => handleDownloadPDF(invoice)}
                                      className="text-green-600 hover:text-green-800"
                                      title="Download PDF"
                                    >
                                      📄
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
            title="Delete Invoice"
            message={`Are you sure you want to delete ${
              invoiceToDelete?.invoiceNumber || "this invoice"
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

export default Invoices;

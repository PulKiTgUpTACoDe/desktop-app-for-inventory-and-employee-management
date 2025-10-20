import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentFormValues } from "../types/payment";
import { paymentService } from "../services/paymentService";
import { invoiceService } from "../services/invoiceService";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { formatPrismaDeleteError } from "../../electron/utils/errorHandling";

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: "",
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "card",
      reference: "",
      notes: "",
    },
  });

  const invoiceId = watch("invoiceId");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [paymentsRes, invoicesRes] = await Promise.all([
          paymentService.getAll(),
          invoiceService.getAll(),
        ]);

        if (paymentsRes.success) setPayments(paymentsRes.data || []);
        if (invoicesRes.success) setInvoices(invoicesRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update amount and invoice details when invoice is selected
  useEffect(() => {
    if (invoiceId) {
      const invoice = invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setValue("amount", Number(invoice.totalAmount));
      }
    } else {
      setSelectedInvoice(null);
      setValue("amount", 0);
    }
  }, [invoiceId, invoices, setValue]);

  const onSubmit = async (data: PaymentFormValues) => {
    console.log("Entered onSubmit with data:", data);

    try {
      let res;
      if (isEditMode && editingPayment) {
        console.log("Calling paymentService.update...");
        res = await paymentService.update(editingPayment.id, data);
      } else {
        console.log("Calling paymentService.create...");
        res = await paymentService.create(data);
      }
      console.log("Payment service response:", res);

      if (res.success) {
        console.log("Payment created successfully, refreshing list...");
        const paymentsRes = await paymentService.getAll();
        if (paymentsRes.success) {
          setPayments(paymentsRes.data || []);
          console.log("Payments list updated");
        }
        resetForm();
        console.log("Form reset");
        alert(
          isEditMode
            ? "Payment updated successfully!"
            : "Payment created successfully!"
        );
      } else {
        console.error("Error saving payment:", res.error);
        alert(
          `Error ${isEditMode ? "updating" : "creating"} payment: ${res.error}`
        );
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      alert(`Error ${isEditMode ? "updating" : "creating"} payment: ${error}`);
    }
  };

  const resetForm = () => {
    reset();
    setIsEditMode(false);
    setEditingPayment(null);
    setShowCreateDialog(false);
  };

  const handleEdit = (p: any) => {
    setEditingPayment(p);
    setIsEditMode(true);
    setValue("invoiceId", p.invoiceId || "");
    setValue("amount", Number(p.amount) || 0);
    setValue(
      "paymentDate",
      p.paymentDate ? new Date(p.paymentDate).toISOString().split("T")[0] : ""
    );
    setValue("paymentMethod", p.paymentMethod || "card");
    setValue("reference", p.reference || "");
    setValue("notes", p.notes || "");
    const inv = invoices.find((i) => i.id === p.invoiceId);
    setSelectedInvoice(inv || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (p: any) => {
    setPaymentToDelete(p);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    try {
      const res = await paymentService.delete(paymentToDelete.id);
      if (res.success) {
        alert("Payment deleted successfully!");
        const paymentsRes = await paymentService.getAll();
        if (paymentsRes.success) setPayments(paymentsRes.data || []);
      } else {
        let err = formatPrismaDeleteError(`payment`, String(res.error));

        alert(err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete payment. Please try again.");
    } finally {
      setShowDeleteDialog(false);
      setPaymentToDelete(null);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      card: "Credit/Debit Card",
      upi: "UPI",
      net_banking: "Net Banking",
      cash: "Cash",
      cheque: "Cheque",
      bank_transfer: "Bank Transfer",
      other: "Other",
    };
    return labels[method] || method;
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
                  Payment Management
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateDialog(true);
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Add New Payment
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  {/* Payment Form */}
                  {(isEditMode || showCreateDialog) && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          {isEditMode ? "Edit Payment" : "Create New Payment"}
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
                            {...register("invoiceId")}
                            className="border p-2 rounded w-full"
                          >
                            <option value="">Select Invoice</option>
                            {invoices.map((invoice) => (
                              <option key={invoice.id} value={invoice.id}>
                                {invoice.invoiceNumber} -{" "}
                                {invoice.salesOrder?.vendor?.name} - $
                                {Number(invoice.totalAmount).toFixed(2)}
                              </option>
                            ))}
                          </select>
                          {errors.invoiceId && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.invoiceId.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <input
                            {...register("amount", { valueAsNumber: true })}
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Amount"
                            className="border p-2 rounded w-full"
                          />
                          {errors.amount && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.amount.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <input
                            {...register("paymentDate")}
                            type="date"
                            className="border p-2 rounded w-full"
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            Payment Date
                          </p>
                          {errors.paymentDate && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.paymentDate.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <select
                            {...register("paymentMethod")}
                            className="border p-2 rounded w-full"
                          >
                            <option value="card">Credit/Debit Card</option>
                            <option value="upi">UPI</option>
                            <option value="net_banking">Net Banking</option>
                            <option value="cash">Cash</option>
                            <option value="cheque">Cheque</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="other">Other</option>
                          </select>
                          <p className="text-sm text-gray-600 mt-1">
                            Payment Method
                          </p>
                          {errors.paymentMethod && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.paymentMethod.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <input
                            {...register("reference")}
                            type="text"
                            placeholder="Reference (Transaction ID, Cheque No., etc.)"
                            className="border p-2 rounded w-full"
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            Reference (Optional)
                          </p>
                        </div>

                        <div className="md:col-span-2">
                          <textarea
                            {...register("notes")}
                            placeholder="Notes (Optional)"
                            className="border p-2 rounded w-full"
                            rows={2}
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            Notes (Optional)
                          </p>
                        </div>

                        {/* Invoice Details Display */}
                        {selectedInvoice && (
                          <div className="md:col-span-3 bg-blue-50 p-4 rounded">
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Selected Invoice Details:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">
                                  Invoice Number:
                                </span>{" "}
                                {selectedInvoice.invoiceNumber}
                              </div>
                              <div>
                                <span className="font-medium">Vendor:</span>{" "}
                                {selectedInvoice.salesOrder?.vendor?.name}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Invoice Date:
                                </span>{" "}
                                {new Date(
                                  selectedInvoice.invoiceDate
                                ).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Due Date:</span>{" "}
                                {new Date(
                                  selectedInvoice.dueDate
                                ).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>{" "}
                                {selectedInvoice.status}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Total Amount:
                                </span>{" "}
                                $
                                {Number(selectedInvoice.totalAmount).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Amount Display */}
                        <div className="md:col-span-3 flex items-center justify-between bg-green-50 p-4 rounded">
                          <div className="text-lg font-semibold text-gray-700">
                            Payment Amount:
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            $
                            {selectedInvoice
                              ? Number(selectedInvoice.totalAmount).toFixed(2)
                              : "0.00"}
                          </div>
                        </div>

                        <div className="md:col-span-3 flex gap-3">
                          <button
                            type="submit"
                            disabled={isSubmitting || !selectedInvoice}
                            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {isSubmitting
                              ? "Saving..."
                              : isEditMode
                              ? "Update Payment"
                              : "Process Payment"}
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

                  {/* Payments List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Payments List
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white rounded shadow">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-3 text-left">Invoice #</th>
                            <th className="p-3 text-left">Vendor</th>
                            <th className="p-3 text-left">Amount</th>
                            <th className="p-3 text-left">Payment Date</th>
                            <th className="p-3 text-left">Method</th>
                            <th className="p-3 text-left">Reference</th>
                            <th className="p-3 text-left">Notes</th>
                            <th className="p-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.length === 0 ? (
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
                            payments.map((payment, i) => (
                              <tr key={payment.id || i} className="border-t">
                                <td className="p-3 font-medium">
                                  {payment.invoice?.invoiceNumber || "N/A"}
                                </td>
                                <td className="p-3">
                                  {payment.invoice?.salesOrder?.vendor?.name ||
                                    "N/A"}
                                </td>
                                <td className="p-3 font-medium">
                                  ${Number(payment.amount).toFixed(2)}
                                </td>
                                <td className="p-3">
                                  {new Date(
                                    payment.paymentDate
                                  ).toLocaleDateString()}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {getPaymentMethodLabel(
                                      payment.paymentMethod
                                    )}
                                  </span>
                                </td>
                                <td className="p-3">
                                  {payment.reference || "N/A"}
                                </td>
                                <td className="p-3">
                                  {payment.notes || "N/A"}
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEdit(payment)}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Edit Payment"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDelete(payment)}
                                      className="text-red-600 hover:text-red-800"
                                      title="Delete Payment"
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
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="Delete Payment"
          message={`Are you sure you want to delete payment for ${
            paymentToDelete?.invoice?.invoiceNumber || "this invoice"
          }? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default Payments;

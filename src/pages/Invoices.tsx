import React from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  salesOrderId: z.string().min(1, "Sales Order ID is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  totalAmount: z.number().min(0, "Total must be >= 0"),
  status: z
    .enum(["pending", "paid", "overdue", "cancelled"]),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const Invoices: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: "",
      salesOrderId: "",
      invoiceDate: "",
      dueDate: "",
      totalAmount: 0,
      status: "pending",
    },
  });

  const onSubmit = async (data: InvoiceFormValues) => {
    console.log("Invoice submit =>", data);
    reset();
  };
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Invoices
              </h2>
              <h2 className="text-xl font-bold mb-4">Add Invoice</h2>
              <form
                className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <input
                    {...register("invoiceNumber")}
                    type="text"
                    placeholder="Invoice Number"
                    className="border p-2 rounded w-full"
                  />
                  {errors.invoiceNumber && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.invoiceNumber.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("salesOrderId")}
                    type="text"
                    placeholder="Sales Order ID"
                    className="border p-2 rounded w-full"
                  />
                  {errors.salesOrderId && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.salesOrderId.message}
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
                </div>
                <div>
                  <input
                    {...register("invoiceDate")}
                    type="date"
                    className="border p-2 rounded w-full"
                  />
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
                  {errors.dueDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.dueDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("totalAmount", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="Total Amount"
                    className="border p-2 rounded w-full"
                  />
                  {errors.totalAmount && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.totalAmount.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-3 flex gap-3">
                  <button
                    disabled={isSubmitting}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                  >
                    {isSubmitting ? "Saving..." : "Add Invoice"}
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
              <h2 className="text-xl font-bold mt-8 mb-4">Invoices List</h2>
              {/* Invoices List */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Invoices;

import React from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amount: z.number().min(0.01, "Amount must be > 0"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const Payments: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: "",
      amount: 0,
      paymentDate: "",
      paymentMethod: "",
      reference: "",
      notes: "",
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      console.log("Payment submit =>", data);

      await new Promise((resolve) => setTimeout(resolve, 500));

      reset(); 
    } catch (err) {
      console.error("Payment error:", err);
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
                Payments
              </h2>
              <h2 className="text-xl font-bold mb-4">Add Payment</h2>
              <form
                className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                {/* Invoice ID */}
                <div>
                  <input
                    {...register("invoiceId")}
                    type="text"
                    placeholder="Invoice ID"
                    className="border p-2 rounded w-full"
                  />
                  {errors.invoiceId && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.invoiceId.message}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <input
                    {...register("amount", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    className="border p-2 rounded w-full"
                  />
                  {errors.amount && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                {/* Payment Date */}
                <div>
                  <input
                    {...register("paymentDate")}
                    type="date"
                    className="border p-2 rounded w-full"
                  />
                  {errors.paymentDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.paymentDate.message}
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <input
                    {...register("paymentMethod")}
                    type="text"
                    placeholder="Payment Method"
                    className="border p-2 rounded w-full"
                  />
                  {errors.paymentMethod && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.paymentMethod.message}
                    </p>
                  )}
                </div>

                {/* Reference */}
                <div>
                  <input
                    {...register("reference")}
                    type="text"
                    placeholder="Reference"
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-3">
                  <input
                    {...register("notes")}
                    type="text"
                    placeholder="Notes"
                    className="border p-2 rounded w-full"
                  />
                </div>

                {/* Buttons */}
                <div className="md:col-span-3 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-indigo-600 text-white px-4 py-2 rounded"
                  >
                    {isSubmitting ? "Saving..." : "Add Payment"}
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

              <h2 className="text-xl font-bold mt-8 mb-4">Payments List</h2>
              {/* Payments List */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Payments;

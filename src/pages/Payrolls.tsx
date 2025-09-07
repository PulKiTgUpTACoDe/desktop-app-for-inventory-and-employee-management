import React from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const payrollSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  month: z.number().min(1).max(12),
  year: z.number().min(1900),
  basicSalary: z.number().min(0),
  allowances: z.number().min(0),
  deductions: z.number().min(0),
  status: z.enum(["pending", "processed", "paid"]),
});

type PayrollFormValues = z.infer<typeof payrollSchema>;

const Payrolls: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PayrollFormValues>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employeeId: "",
      month: 1,
      year: new Date().getFullYear(),
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
      status: "pending",
    },
  });

  const basic = watch("basicSalary") || 0;
  const allowances = watch("allowances") || 0;
  const deductions = watch("deductions") || 0;
  const net = Math.max(0, basic + allowances - deductions);

  const onSubmit = async (data: PayrollFormValues) => {
    console.log("Payroll submit =>", { ...data, netSalary: net });
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
                Payrolls
              </h2>
              <h2 className="text-xl font-bold mb-4">Add Payroll</h2>
              <form
                className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <input
                    {...register("employeeId")}
                    type="text"
                    placeholder="Employee ID"
                    className="border p-2 rounded w-full"
                  />
                  {errors.employeeId && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.employeeId.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("month", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    max={12}
                    placeholder="Month"
                    className="border p-2 rounded w-full"
                  />
                  {errors.month && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.month.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("year", { valueAsNumber: true })}
                    type="number"
                    min={1900}
                    placeholder="Year"
                    className="border p-2 rounded w-full"
                  />
                  {errors.year && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.year.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("basicSalary", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="Basic Salary"
                    className="border p-2 rounded w-full"
                  />
                  {errors.basicSalary && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.basicSalary.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("allowances", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="Allowances"
                    className="border p-2 rounded w-full"
                  />
                  {errors.allowances && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.allowances.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("deductions", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="Deductions"
                    className="border p-2 rounded w-full"
                  />
                  {errors.deductions && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.deductions.message}
                    </p>
                  )}
                </div>
                <div>
                  <select
                    {...register("status")}
                    className="border p-2 rounded w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="processed">Processed</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center text-sm text-gray-700">
                  Net Salary:{" "}
                  <span className="ml-2 font-semibold">{net.toFixed(2)}</span>
                </div>
                <div className="md:col-span-3 flex gap-3">
                  <button
                    disabled={isSubmitting}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    {isSubmitting ? "Saving..." : "Add Payroll"}
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
              <h2 className="text-xl font-bold mt-8 mb-4">Payrolls List</h2>
              {/* Payrolls List */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Payrolls;

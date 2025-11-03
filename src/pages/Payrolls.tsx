import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { payrollSchema, PayrollFormValues } from "../types/payroll";
import { payrollService } from "../services/payrollService";
import { employeeService } from "../services/employeeService";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { formatPrismaDeleteError } from "../../electron/utils/errorHandling";

const Payrolls: React.FC = () => {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState<any>(null);

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
      month: new Date().getMonth() + 1,
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [payrollsRes, employeesRes] = await Promise.all([
          payrollService.getAll(),
          employeeService.getAll(),
        ]);

        if (payrollsRes.success) setPayrolls(payrollsRes.data || []);
        if (employeesRes.success) setEmployees(employeesRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: PayrollFormValues) => {
    console.log("Entered onSubmit with data:", data);

    try {
      let res;
      if (isEditMode && editingPayroll) {
        console.log("Calling payrollService.update...");
        res = await payrollService.update(editingPayroll.id, data);
      } else {
        console.log("Calling payrollService.create...");
        res = await payrollService.create(data);
      }
      console.log("Payroll service response:", res);

      if (res.success) {
        console.log("Payroll created successfully, refreshing list...");
        const payrollsRes = await payrollService.getAll();
        if (payrollsRes.success) {
          setPayrolls(payrollsRes.data || []);
          console.log("Payrolls list updated");
        }
        resetForm();
        console.log("Form reset");
        alert(
          isEditMode
            ? "Payroll updated successfully!"
            : "Payroll created successfully!"
        );
      } else {
        console.error("Error saving payroll:", res.error);
        alert(
          `Error ${isEditMode ? "updating" : "creating"} payroll: ${res.error}`
        );
      }
    } catch (error) {
      console.error("Error saving payroll:", error);
      alert(`Error ${isEditMode ? "updating" : "creating"} payroll: ${error}`);
    }
  };

  const resetForm = () => {
    reset();
    setIsEditMode(false);
    setEditingPayroll(null);
    setShowCreateDialog(false);
  };

  const handleEdit = (p: any) => {
    setEditingPayroll(p);
    setIsEditMode(true);
    reset({
      employeeId: p.employeeId || "",
      month: Number(p.month) || new Date().getMonth() + 1,
      year: Number(p.year) || new Date().getFullYear(),
      basicSalary: Number(p.basicSalary) || 0,
      allowances: Number(p.allowances) || 0,
      deductions: Number(p.deductions) || 0,
      status: p.status || "pending",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (p: any) => {
    setPayrollToDelete(p);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!payrollToDelete) return;
    try {
      const res = await payrollService.delete(payrollToDelete.id);
      if (res.success) {
        alert("Payroll deleted successfully!");
        const payrollsRes = await payrollService.getAll();
        if (payrollsRes.success) setPayrolls(payrollsRes.data || []);
      } else {
        let err = formatPrismaDeleteError(`payroll`, String(res.error));

        alert(err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to delete payroll. Please try again.");
    } finally {
      setShowDeleteDialog(false);
      setPayrollToDelete(null);
    }
  };

  const updatePayrollStatus = async (id: string, status: string) => {
    try {
      const res = await payrollService.updateStatus(id, status);
      if (res.success) {
        const payrollsRes = await payrollService.getAll();
        if (payrollsRes.success) setPayrolls(payrollsRes.data || []);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month - 1] || "";
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
                  Payroll Management
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateDialog(true);
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Add New Payroll
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  {/* Payroll Form */}
                  {(isEditMode || showCreateDialog) && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          {isEditMode ? "Edit Payroll" : "Create New Payroll"}
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
                            {...register("employeeId")}
                            className="border p-2 rounded w-full"
                          >
                            <option value="">Select Employee</option>
                            {employees.map((employee) => (
                              <option key={employee.id} value={employee.id}>
                                {employee.firstName} {employee.lastName} -{" "}
                                {employee.employeeId}
                              </option>
                            ))}
                          </select>
                          {errors.employeeId && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.employeeId.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <select
                            {...register("month", { valueAsNumber: true })}
                            className="border p-2 rounded w-full"
                          >
                            <option value="">Select Month</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (month) => (
                                <option key={month} value={month}>
                                  {getMonthName(month)}
                                </option>
                              )
                            )}
                          </select>
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
                            max={2100}
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
                            {...register("basicSalary", {
                              valueAsNumber: true,
                            })}
                            type="number"
                            step="0.01"
                            min="0"
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
                            min="0"
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
                            min="0"
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

                        {/* Net Salary Display */}
                        <div className="md:col-span-2 flex items-center justify-between bg-blue-50 p-4 rounded">
                          <div className="text-lg font-semibold text-gray-700">
                            Net Salary:
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            ${net.toFixed(2)}
                          </div>
                        </div>

                        <div className="md:col-span-3 flex gap-3">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                          >
                            {isSubmitting
                              ? "Saving..."
                              : isEditMode
                              ? "Update Payroll"
                              : "Create Payroll"}
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

                  {/* Payrolls List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Payrolls List
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full bg-white rounded shadow">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-3 text-left">Employee</th>
                            <th className="p-3 text-left">Period</th>
                            <th className="p-3 text-left">Basic Salary</th>
                            <th className="p-3 text-left">Allowances</th>
                            <th className="p-3 text-left">Deductions</th>
                            <th className="p-3 text-left">Net Salary</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payrolls.length === 0 ? (
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
                            payrolls.map((payroll, i) => (
                              <tr key={payroll.id || i} className="border-t">
                                <td className="p-3 font-medium">
                                  {payroll.employee?.firstName}{" "}
                                  {payroll.employee?.lastName}
                                  <div className="text-sm text-gray-500">
                                    {payroll.employee?.employeeId}
                                  </div>
                                </td>
                                <td className="p-3">
                                  {getMonthName(payroll.month)} {payroll.year}
                                </td>
                                <td className="p-3">
                                  ${Number(payroll.basicSalary).toFixed(2)}
                                </td>
                                <td className="p-3">
                                  ${Number(payroll.allowances).toFixed(2)}
                                </td>
                                <td className="p-3">
                                  ${Number(payroll.deductions).toFixed(2)}
                                </td>
                                <td className="p-3 font-medium">
                                  ${Number(payroll.netSalary).toFixed(2)}
                                </td>
                                <td className="p-3">
                                  <select
                                    value={payroll.status}
                                    onChange={(e) =>
                                      updatePayrollStatus(
                                        payroll.id,
                                        e.target.value
                                      )
                                    }
                                    className={`px-2 py-1 rounded text-xs border ${
                                      payroll.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                        : payroll.status === "processed"
                                        ? "bg-blue-100 text-blue-800 border-blue-300"
                                        : "bg-green-100 text-green-800 border-green-300"
                                    }`}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="processed">Processed</option>
                                    <option value="paid">Paid</option>
                                  </select>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEdit(payroll)}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Edit Payroll"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDelete(payroll)}
                                      className="text-red-600 hover:text-red-800"
                                      title="Delete Payroll"
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
            title="Delete Payroll"
            message={`Are you sure you want to delete payroll for ${
              payrollToDelete?.employee?.firstName || "this employee"
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

export default Payrolls;

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeFormValues, employeeSchema } from "../types/employee";
import { employeeService } from "../services/employeeService";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { formatPrismaDeleteError } from "../../electron/utils/errorHandling";

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      position: "",
      department: "",
      hireDate: "",
      salary: 0,
    },
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAll();
      if (response.success) {
        setEmployees(response.data || []);
      } else {
        console.error("Failed to fetch employees:", response.error);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      const payload = {
        ...data,
        hireDate: new Date(data.hireDate).toISOString(),
        salary: Number(data.salary),
      };

      let response;
      if (isEditMode && editingEmployee) {
        response = await employeeService.update(editingEmployee.id, payload);
        if (response.success) {
          console.log("✅ Employee updated:", response.data);
          alert("Employee updated successfully!");
        }
      } else {
        response = await employeeService.create(payload);
        if (response.success) {
          console.log("✅ Employee created:", response.data);
          alert("Employee created successfully!");
        }
      }

      if (response.success) {
        await fetchEmployees();
        resetForm();
      } else {
        console.error("❌ Error saving employee:", response.error);
        alert(
          `Failed to ${
            isEditMode ? "update" : "create"
          } employee. Please try again.`
        );
      }
    } catch (err: any) {
      console.error("❌ Error saving employee:", err);
      alert(
        `Failed to ${
          isEditMode ? "update" : "create"
        } employee. Please try again.`
      );
    }
  };

  const resetForm = () => {
    reset();
    setIsEditMode(false);
    setEditingEmployee(null);
    setShowCreateDialog(false);
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setIsEditMode(true);
    setValue("firstName", employee.firstName);
    setValue("lastName", employee.lastName);
    setValue("email", employee.email);
    setValue("phone", employee.phone || "");
    setValue("address", employee.address || "");
    setValue("position", employee.position);
    setValue("department", employee.department);
    setValue(
      "hireDate",
      employee.hireDate
        ? new Date(employee.hireDate).toISOString().split("T")[0]
        : ""
    );
    setValue("salary", employee.salary || 0);
  };

  const handleDelete = (employee: any) => {
    setEmployeeToDelete(employee);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      const response = await employeeService.delete(employeeToDelete.id);
      if (response.success) {
        console.log("✅ Employee deleted:", employeeToDelete.id);
        alert("Employee deleted successfully!");
        await fetchEmployees();
      } else {
        console.error("❌ Error deleting employee:", response.error);
        let err = formatPrismaDeleteError(`employee`, String(response.error));
        alert(err);
      }
    } catch (err: any) {
      console.error("❌ Error deleting employee:", err);
      alert("Failed to delete employee. Please try again.");
    } finally {
      setShowDeleteDialog(false);
      setEmployeeToDelete(null);
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
                <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
                <button
                  onClick={handleCreateNew}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Add New Employee
                </button>
              </div>

              {/* Employee Form - Only show when creating or editing */}
              {(isEditMode || showCreateDialog) && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isEditMode ? "Edit Employee" : "Add New Employee"}
                    </h3>
                    <button
                      onClick={resetForm}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <form
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <div>
                      <input
                        {...register("firstName")}
                        type="text"
                        placeholder="First Name"
                        className="border p-2 rounded w-full"
                      />
                      {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register("lastName")}
                        type="text"
                        placeholder="Last Name"
                        className="border p-2 rounded w-full"
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.lastName.message}
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
                          {errors.email.message}
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
                    <div className="md:col-span-2">
                      <input
                        {...register("address")}
                        type="text"
                        placeholder="Address"
                        className="border p-2 rounded w-full"
                      />
                    </div>
                    <div>
                      <input
                        {...register("position")}
                        type="text"
                        placeholder="Position"
                        className="border p-2 rounded w-full"
                      />
                      {errors.position && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.position.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register("department")}
                        type="text"
                        placeholder="Department"
                        className="border p-2 rounded w-full"
                      />
                      {errors.department && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.department.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register("hireDate")}
                        type="date"
                        className="border p-2 rounded w-full"
                      />
                      {errors.hireDate && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.hireDate.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register("salary", { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="Salary"
                        className="border p-2 rounded w-full"
                      />
                      {errors.salary && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.salary.message}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-3 flex gap-3">
                      <button
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        type="submit"
                      >
                        {isSubmitting
                          ? "Saving..."
                          : isEditMode
                          ? "Update Employee"
                          : "Add Employee"}
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

              {/* Employee List */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Employee List</h2>
                  <button
                    onClick={fetchEmployees}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Refresh"}
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-4">Loading employees...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hire Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Salary
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {employees.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-6 py-4 text-center text-gray-500"
                            >
                              No employees found. Add some employees to get
                              started.
                            </td>
                          </tr>
                        ) : (
                          employees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {employee.firstName} {employee.lastName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {employee.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {employee.phone || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {employee.position}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {employee.department}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {employee.hireDate
                                  ? new Date(
                                      employee.hireDate
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ₹{employee.salary?.toLocaleString() || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(employee)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Edit Employee"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDelete(employee)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                    title="Delete Employee"
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
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Dialogs */}
      {showDeleteDialog && (
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title="Delete Employee"
          message={`Are you sure you want to delete ${employeeToDelete?.firstName} ${employeeToDelete?.lastName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </div>
  );
};

export default Employees;

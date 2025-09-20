import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeFormValues, employeeSchema } from "../types/employee";
import { employeeService } from "../services/employeeService";

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
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
      const response = await employeeService.create(data);

      if (response.success) {
        console.log("✅ Employee created:", response.data);
        // Refresh the employee list
        await fetchEmployees();
        // Reset the form
        reset();
      } else {
        console.error("❌ Error creating employee:", response.error);
        alert("Failed to create employee. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ Error creating employee:", err);
      alert("Failed to create employee. Please try again.");
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
                Employees
              </h2>
              <form
                className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
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
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                    type="submit"
                  >
                    {isSubmitting ? "Saving..." : "Add Employee"}
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
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {employees.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
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
    </div>
  );
};

export default Employees;

import React from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmployeeFormValues, employeeSchema } from "../types/employee";

const Employees: React.FC = () => {
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

  const onSubmit = async (data: EmployeeFormValues) => {
    console.log("Employee submit =>", data);
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
              <h2 className="text-xl font-bold mt-8 mb-4">Employee List</h2>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Employees;

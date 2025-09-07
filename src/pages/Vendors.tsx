import React from "react";
import Header from "../components/Header";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  contactPerson: z.string().optional().or(z.literal("")),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;

const Vendors: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
    },
  });

  const onSubmit = async (data: VendorFormValues) => {
    console.log("Vendor submit =>", data);
    reset();
  };
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendors</h2>
              <h2 className="text-xl font-bold mb-4">Add Vendor</h2>
              <form
                className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Name"
                    className="border p-2 rounded w-full"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.name.message}
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
                      {errors.email.message as string}
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
                <div>
                  <input
                    {...register("contactPerson")}
                    type="text"
                    placeholder="Contact Person"
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
                <div className="md:col-span-2 flex gap-3">
                  <button
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {isSubmitting ? "Saving..." : "Add Vendor"}
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
              <h2 className="text-xl font-bold mt-8 mb-4">Vendor List</h2>
              {/* Vendor List */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Vendors;

import React from "react";
import Header from "../components/Header";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const poItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

const purchaseOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  supplierId: z.string().min(1, "Supplier ID is required"),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDelivery: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(poItemSchema).min(1, "Add at least one item"),
});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

const PurchaseOrders: React.FC = () => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      orderNumber: "",
      supplierId: "",
      orderDate: "",
      expectedDelivery: "",
      notes: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const itemsWatch = watch("items") || [];
  const total = itemsWatch.reduce(
    (sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0),
    0
  );

  const onSubmit = async (data: PurchaseOrderFormValues) => {
    console.log("Purchase Order submit =>", { ...data, totalAmount: total });
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
                Purchase Orders
              </h2>
              <h2 className="text-xl font-bold mb-4">Add Purchase Order</h2>
              <form
                className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <input
                    {...register("orderNumber")}
                    type="text"
                    placeholder="Order Number"
                    className="border p-2 rounded w-full"
                  />
                  {errors.orderNumber && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.orderNumber.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("supplierId")}
                    type="text"
                    placeholder="Supplier ID"
                    className="border p-2 rounded w-full"
                  />
                  {errors.supplierId && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.supplierId.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("orderDate")}
                    type="date"
                    className="border p-2 rounded w-full"
                  />
                  {errors.orderDate && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.orderDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    {...register("expectedDelivery")}
                    type="date"
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div className="md:col-span-3">
                  <input
                    {...register("notes")}
                    type="text"
                    placeholder="Notes"
                    className="border p-2 rounded w-full"
                  />
                </div>

                <div className="md:col-span-3">
                  <h3 className="font-semibold mb-2">Items</h3>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3"
                    >
                      <input
                        {...register(`items.${index}.productId` as const)}
                        type="text"
                        placeholder="Product ID"
                        className="border p-2 rounded w-full"
                      />
                      <input
                        {...register(`items.${index}.quantity` as const, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min={1}
                        placeholder="Qty"
                        className="border p-2 rounded w-full"
                      />
                      <input
                        {...register(`items.${index}.unitPrice` as const, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        step="0.01"
                        placeholder="Unit Price"
                        className="border p-2 rounded w-full"
                      />
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-600">
                          {(
                            (itemsWatch[index]?.quantity || 0) *
                            (itemsWatch[index]?.unitPrice || 0)
                          ).toFixed(2)}
                        </div>
                        <button
                          type="button"
                          className="px-3 py-2 border rounded"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </button>
                      </div>
                      {errors.items?.[index] && (
                        <div className="md:col-span-4 text-red-600 text-sm">
                          {
                            (errors.items[index]?.productId?.message ||
                              errors.items[index]?.quantity?.message ||
                              errors.items[index]?.unitPrice?.message) as string
                          }
                        </div>
                      )}
                    </div>
                  ))}
                  {typeof errors.items?.message === "string" && (
                    <p className="text-red-600 text-sm">
                      {errors.items?.message}
                    </p>
                  )}
                  <button
                    type="button"
                    className="mt-2 px-3 py-2 border rounded"
                    onClick={() =>
                      append({ productId: "", quantity: 1, unitPrice: 0 })
                    }
                  >
                    Add Item
                  </button>
                </div>

                <div className="md:col-span-3 flex items-center justify-between">
                  <div className="text-sm text-gray-700">Total Amount:</div>
                  <div className="font-semibold">{total.toFixed(2)}</div>
                </div>
                <div className="md:col-span-3 flex gap-3">
                  <button
                    disabled={isSubmitting}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    {isSubmitting ? "Saving..." : "Create Purchase Order"}
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
              <h2 className="text-xl font-bold mt-8 mb-4">
                Purchase Orders List
              </h2>
              {/* Purchase Orders List */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PurchaseOrders;

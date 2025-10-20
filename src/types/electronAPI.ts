import { EmployeeFormValues } from "./employee";
import { ProductFormValues, CategoryFormValues, BrandFormValues } from "./inventory";
import { SupplierFormValues } from "./supplier";
import { VendorFormValues } from "./vendor";
import { PurchaseOrderFormValues } from "./purchaseOrder";

// Declare the global electronAPI interface
declare global {
    interface Window {
        electronAPI: {
            // Employee API
            getEmployees: () => Promise<{ success: boolean; data?: any; error?: any }>;
            getEmployeeById: (id: string) => Promise<{ success: boolean; data?: any; error?: any }>;
            createEmployee: (data: EmployeeFormValues) => Promise<{ success: boolean; data?: any; error?: any }>;
            updateEmployee: (id: string, data: Partial<EmployeeFormValues>) => Promise<{ success: boolean; data?: any; error?: any }>;
            deleteEmployee: (id: string) => Promise<{ success: boolean; message?: string; error?: any }>;

            // Product API
            getProducts: () => Promise<{ success: boolean; data?: any; error?: any }>;
            getProductById: (id: string) => Promise<{ success: boolean; data?: any; error?: any }>;
            createProduct: (data: ProductFormValues) => Promise<{ success: boolean; data?: any; error?: any }>;
            updateProduct: (id: string, data: Partial<ProductFormValues>) => Promise<{ success: boolean; data?: any; error?: any }>;
            deleteProduct: (id: string) => Promise<{ success: boolean; message?: string; error?: any }>;

            // Category API
            getCategories: () => Promise<{ success: boolean; data?: any; error?: any }>;
            createCategory: (data: CategoryFormValues) => Promise<{ success: boolean; data?: any; error?: any }>;
            updateCategory: (id: string, data: Partial<CategoryFormValues>) => Promise<{ success: boolean; data?: any; error?: any }>;
            deleteCategory: (id: string) => Promise<{ success: boolean; message?: string; error?: any }>;

            // Brand API
            getBrands: () => Promise<{ success: boolean; data?: any; error?: any }>;
            createBrand: (data: BrandFormValues) => Promise<{ success: boolean; data?: any; error?: any }>;
            updateBrand: (id: string, data: Partial<BrandFormValues>) => Promise<{ success: boolean; data?: any; error?: any }>;
            deleteBrand: (id: string) => Promise<{ success: boolean; message?: string; error?: any }>;

            // Supplier API
            getSuppliers: () => Promise<{ success: boolean; data?: any; error?: any }>;
            getSupplierById: (id: string) => Promise<{ success: boolean; data?: any; error?: any }>;
            createSupplier: (data: SupplierFormValues) => Promise<{ success: boolean; data?: any; error?: any }>;
            updateSupplier: (id: string, data: Partial<SupplierFormValues>) => Promise<{ success: boolean; data?: any; error?: any }>;
            deleteSupplier: (id: string) => Promise<{ success: boolean; message?: string; error?: any }>;

            // Vendor API
            getVendors: () => Promise<{ success: boolean; data?: any; error?: any }>;
            getVendorById: (id: string) => Promise<{ success: boolean; data?: any; error?: any }>;
            createVendor: (data: VendorFormValues) => Promise<{ success: boolean; data?: any; error?: any }>;
            updateVendor: (id: string, data: Partial<VendorFormValues>) => Promise<{ success: boolean; data?: any; error?: any }>;
            deleteVendor: (id: string) => Promise<{ success: boolean; message?: string; error?: any }>;

            // Purchase Order API
            getPurchaseOrders: () => Promise<{ success: boolean; data?: any; error?: any }>;
            getPurchaseOrderById: (id: string) => Promise<{ success: boolean; data?: any; error?: any }>;
            createPurchaseOrder: (data: PurchaseOrderFormValues) => Promise<{ success: boolean; data?: any; error?: any }>;
            updatePurchaseOrder: (id: string, data: Partial<PurchaseOrderFormValues>) => Promise<{ success: boolean; data?: any; error?: any }>;
            deletePurchaseOrder: (id: string) => Promise<{ success: boolean; message?: string; error?: any }>;
            updatePurchaseOrderStatus: (id: string, status: string) => Promise<{ success: boolean; data?: any; error?: any }>;
        };
    }
}

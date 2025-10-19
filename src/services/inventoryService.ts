import { ProductFormValues, CategoryFormValues, BrandFormValues } from "../types/inventory";

declare global {
    interface Window {
        electronAPI: {
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
        };
    }
}

export const inventoryService = {
    // Product Services
    products: {
        getAll: async () => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.getProducts();
        },

        getById: async (id: string) => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.getProductById(id);
        },

        create: async (data: ProductFormValues) => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.createProduct(data);
        },

        update: async (id: string, data: Partial<ProductFormValues>) => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.updateProduct(id, data);
        },

        delete: async (id: string) => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.deleteProduct(id);
        },
    },

    // Category Services
    categories: {
        getAll: async () => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.getCategories();
        },

        create: async (data: CategoryFormValues) => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.createCategory(data);
        },

        update: async (id: string, data: Partial<CategoryFormValues>) => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.updateCategory(id, data);
        },

        delete: async (id: string) => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.deleteCategory(id);
        },
    },

    // Brand Services
    brands: {
        getAll: async () => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.getBrands();
        },

        create: async (data: BrandFormValues) => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.createBrand(data);
        },

        update: async (id: string, data: Partial<BrandFormValues>) => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.updateBrand(id, data);
        },

        delete: async (id: string) => {
            if (!window.electronAPI) {
                throw new Error('Electron API not available');
            }
            return window.electronAPI.deleteBrand(id);
        },
    },
};

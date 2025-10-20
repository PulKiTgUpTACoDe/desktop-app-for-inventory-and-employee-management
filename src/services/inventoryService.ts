import { ProductFormValues, CategoryFormValues, BrandFormValues } from "../types/inventory";
import "../types/electronAPI";

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

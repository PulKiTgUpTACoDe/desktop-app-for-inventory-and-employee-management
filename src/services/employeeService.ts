import { EmployeeFormValues } from "../types/employee";

// Declare the global electronAPI interface
declare global {
  interface Window {
    electronAPI: {
      getEmployees: () => Promise<{ success: boolean; data?: any; error?: any }>;
      getEmployeeById: (id: string) => Promise<{ success: boolean; data?: any; error?: any }>;
      createEmployee: (data: EmployeeFormValues) => Promise<{ success: boolean; data?: any; error?: any }>;
      updateEmployee: (id: string, data: Partial<EmployeeFormValues>) => Promise<{ success: boolean; data?: any; error?: any }>;
      deleteEmployee: (id: string) => Promise<{ success: boolean; message?: string; error?: any }>;
    };
  }
}

const electronAPI = window.electronAPI

export const employeeService = {
  getAll: async () => {
    if (!electronAPI) {
      throw new Error('Electron API not available');
    }
    return electronAPI.getEmployees();
  },

  getById: async (id: string) => {
    if (!electronAPI) {
      throw new Error('Electron API not available');
    }
    return electronAPI.getEmployeeById(id);
  },

  create: async (data: EmployeeFormValues) => {
    if (!electronAPI) {
      throw new Error('Electron API not available');
    }
    return electronAPI.createEmployee(data);
  },

  update: async (id: string, data: Partial<EmployeeFormValues>) => {
    if (!electronAPI) {
      throw new Error('Electron API not available');
    }
    return electronAPI.updateEmployee(id, data);
  },

  delete: async (id: string) => {
    if (!electronAPI) {
      throw new Error('Electron API not available');
    }
    return electronAPI.deleteEmployee(id);
  },
};
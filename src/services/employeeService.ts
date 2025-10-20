import { EmployeeFormValues } from "../types/employee";
import "../types/electronAPI";

export const employeeService = {
  getAll: async () => {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.getEmployees();
  },

  getById: async (id: string) => {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.getEmployeeById(id);
  },

  create: async (data: EmployeeFormValues) => {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.createEmployee(data);
  },

  update: async (id: string, data: Partial<EmployeeFormValues>) => {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.updateEmployee(id, data);
  },

  delete: async (id: string) => {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.deleteEmployee(id);
  },
};
import axios from "axios";
import { EmployeeFormValues } from "../types/employee";
import dotenv from "dotenv";

dotenv.config();

const API_URL = `http://localhost:${process.env.VITE_API_PORT || 4000}/employees`;

export const employeeService = {
  getAll: () => axios.get(API_URL),
  getById: (id: string) => axios.get(`${API_URL}/${id}`),
  create: (data: EmployeeFormValues) => axios.post(API_URL, data),
  update: (id: string, data: Partial<EmployeeFormValues>) => axios.put(`${API_URL}/${id}`, data),
  delete: (id: string) => axios.delete(`${API_URL}/${id}`),
};

import prisma from "../lib/prisma";
import { EmployeeFormValues } from "../types/employee"; 

export const employeeService = {
  getAll: () =>
    prisma.employee.findMany({
      include: {
        payrolls: true,
        creator: true,
        updater: true,
      },
    }),

  getById: (id: string) =>
    prisma.employee.findUnique({
      where: { id },
      include: {
        payrolls: true,
        creator: true,
        updater: true,
      },
    }),

  create: (data: EmployeeFormValues, createdBy: string) =>
    prisma.employee.create({
      data: {
        ...data,
        hireDate: new Date(data.hireDate),
        salary: data.salary, 
        createdBy,
        updatedBy: createdBy,
      },
    }),

  update: (id: string, data: Partial<EmployeeFormValues>, updatedBy: string) =>
    prisma.employee.update({
      where: { id },
      data: {
        ...data,
        ...(data.hireDate && { hireDate: new Date(data.hireDate) }),
        ...(data.salary !== undefined && { salary: data.salary }),
        updatedBy,
      },
    }),

  delete: (id: string) => prisma.employee.delete({ where: { id } }),
};

import { ipcMain } from "electron";
import prisma from "../../src/lib/prisma.js";
import { EmployeeFormValues } from "../../src/types/employee.js";

function safeResult<T>(data: T) {
  return JSON.parse(JSON.stringify(data));
}

export function employeeHandlers() {
  console.log("[main] registering employee IPC handlers...");

  ipcMain.handle("get-employees", async () => {
    try {
      const employees = await prisma.employee.findMany();
      return { success: true, data: safeResult(employees) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("get-employee-by-id", async (event, id: string) => {
    try {
      const employee = await prisma.employee.findUnique({ where: { id } });
      return { success: true, data: safeResult(employee) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("create-employee", async (event, data: EmployeeFormValues) => {
    try {
      const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
      if (!adminUser) return { success: false, error: "No admin user found" };

      const newEmployee = await prisma.employee.create({
        data: {
          ...data,
          hireDate: new Date(data.hireDate),
          salary: Number(data.salary),
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
        },
      });
      return { success: true, data: safeResult(newEmployee) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("update-employee", async (event, id: string, data: Partial<EmployeeFormValues>) => {
    try {
      const adminUser = await prisma.adminUser.findFirst({ where: { role: "admin" } });
      if (!adminUser) return { success: false, error: "No admin user found" };

      const updatedEmployee = await prisma.employee.update({
        where: { id },
        data: {
          ...data,
          ...(data.hireDate && { hireDate: new Date(data.hireDate) }),
          updatedBy: adminUser.id,
        },
      });
      return { success: true, data: safeResult(updatedEmployee) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle("delete-employee", async (event, id: string) => {
    try {
      await prisma.employee.delete({ where: { id } });
      return { success: true, message: "Employee deleted successfully." };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}

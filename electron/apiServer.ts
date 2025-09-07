import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { employeeService } from "../src/api/employee"; // Prisma logic
import { EmployeeFormValues } from "../src/types/employee";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

/* ---------------- Employee CRUD Routes ---------------- */

// Get all employees
app.get("/employees", async (_req, res) => {
  const employees = await employeeService.getAll();
  res.json(employees);
});

// Get employee by id
app.get("/employees/:id", async (req, res) => {
  const employee = await employeeService.getById(req.params.id);
  res.json(employee);
});

// Create employee
app.post("/employees", async (req, res) => {
  const data: EmployeeFormValues = req.body;
  const createdBy = "admin-user-id"; // later replace with real user id
  const newEmployee = await employeeService.create(data, createdBy);
  res.json(newEmployee);
});

// Update employee
app.put("/employees/:id", async (req, res) => {
  const data: Partial<EmployeeFormValues> = req.body;
  const updatedBy = "admin-user-id";
  const updatedEmployee = await employeeService.update(req.params.id, data, updatedBy);
  res.json(updatedEmployee);
});

// Delete employee
app.delete("/employees/:id", async (req, res) => {
  await employeeService.delete(req.params.id);
  res.json({ message: "Employee deleted" });
});

// Start server
export function startApiServer() {
  app.listen(PORT, () => {
    console.log(`🚀 API server running at http://localhost:${PORT}`);
  });
}

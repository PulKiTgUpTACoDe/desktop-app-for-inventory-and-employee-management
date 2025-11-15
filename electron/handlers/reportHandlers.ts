import { ipcMain, app } from 'electron';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { subMonths } from 'date-fns';
import { ReportPeriod, ReportResult } from '../../src/types/report.js';
import prisma from '../../src/lib/prisma.js';

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const toNumber = (v: any) => {
  if (!v) return 0;
  try {
    return Number(v.toString());
  } catch {
    return Number(v);
  }
};

const ensureNotEmpty = <T>(d: T[], empty: T) => d.length > 0 ? d : [empty];


const setColumnWidths = (worksheet: ExcelJS.Worksheet, data: any[]) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  
  const columns: Partial<ExcelJS.Column>[] = headers.map(header => ({
    header: header,
    key: header.replace(/\s/g, ''), 
    width: header.length + 2,
  }));
  
  worksheet.columns = columns as ExcelJS.Column[]; 

  worksheet.columns.forEach((column, colIndex) => {
    let maxLength = column.width || 10; 
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { 
        const cellValue = row.getCell(colIndex + 1).value;
        const cellLength = cellValue ? String(cellValue).length : 0;
        if (cellLength + 2 > maxLength) { 
          maxLength = cellLength + 2;
        }
      }
    });

    column.width = Math.min(50, Math.max(10, maxLength));
  });
};


export function reportHandlers() {

  const reportPeriods: ReportPeriod[] = [
    { label: 'Last 1 Month', months: 1 },
    { label: 'Last 3 Months', months: 3 },
    { label: 'Last 6 Months', months: 6 },
    { label: 'Last 1 Year', months: 12 }
  ];

  console.log('Registering report handlers...');

  ipcMain.handle('get-report-periods', async () => {
    return reportPeriods;
  });

  ipcMain.handle('generate-report', async (_, { months }): Promise<ReportResult> => {
    try {
      console.log('Generating report for months:', months);

      const endDate = new Date();
      const startDate = subMonths(endDate, months);

      const reportsDir = path.join(app.getPath('downloads'));
      fs.mkdirSync(reportsDir, { recursive: true });

      console.log(`Saving report to: ${reportsDir}`);
      
      const [
        products,
        categories,
        brands,
        suppliers,
        vendors,
        employees,
        purchaseOrders,
        salesOrders,
        invoices,
        payments,
        payrolls,
        stock,
      ] = await Promise.all([
        prisma.product.findMany({ include: { category: true, brand: true, stock: true } }),
        prisma.productCategory.findMany(),
        prisma.productBrand.findMany(),
        prisma.supplier.findMany(),
        prisma.vendor.findMany(),
        prisma.employee.findMany(),
        prisma.purchaseOrder.findMany({
          where: { orderDate: { gte: startDate, lte: endDate } },
          include: { items: { include: { product: true } }, supplier: true },
          orderBy: { orderDate: 'desc' },
        }),
        prisma.salesOrder.findMany({
          where: { orderDate: { gte: startDate, lte: endDate } },
          include: { items: { include: { product: true } }, vendor: true },
          orderBy: { orderDate: 'desc' },
        }),
        prisma.invoice.findMany({
          where: { invoiceDate: { gte: startDate, lte: endDate } },
          include: { salesOrder: true },
          orderBy: { invoiceDate: 'desc' },
        }),
        prisma.payment.findMany({
          where: { paymentDate: { gte: startDate, lte: endDate } },
          include: { invoice: true },
          orderBy: { paymentDate: 'desc' },
        }),
        prisma.payroll.findMany({
          where: { createdAt: { gte: startDate, lte: endDate } },
          include: { employee: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.stock.findMany({ include: { product: true } }),
      ]);
      
      const workbook = new ExcelJS.Workbook();

      // --- 1. Products Sheet ---
      const productsData = ensureNotEmpty(products.map(product => ({
        Name: product.name,
        SKU: product.sku,
        Description: product.description || '',
        Category: product.category?.name || 'N/A',
        Brand: product.brand?.name || 'N/A',
        'Cost Price': toNumber(product.costPrice),
        'Selling Price': toNumber(product.price),
        'Current Stock': (product.stock || []).reduce((s, st) => s + st.quantity, 0),
        'Is Active': product.isActive ? 'Yes' : 'No',
        'Created At': formatDate(product.createdAt),
        'Updated At': formatDate(product.updatedAt),
      })), {
        Name: 'No products found', SKU: '', Description: '', Category: '', Brand: '',
        'Cost Price': 0, 'Selling Price': 0, 'Current Stock': 0, 'Is Active': '', 'Created At': '', 'Updated At': '',
      });
      
      const productsSheet = workbook.addWorksheet('Products');
      productsSheet.addRows(productsData.map(d => Object.values(d))); 
      setColumnWidths(productsSheet, productsData); 

      // --- 2. Categories Sheet
      const categoriesData = ensureNotEmpty(categories.map(category => ({
        Name: category.name,
        Description: category.description || '',
        'Created At': formatDate(category.createdAt),
        'Updated At': formatDate(category.updatedAt),
      })), {
        Name: 'No categories found', Description: '', 'Created At': '', 'Updated At': '',
      });
      
      const categoriesSheet = workbook.addWorksheet('Categories');
      categoriesSheet.addRows(categoriesData.map(d => Object.values(d)));
      setColumnWidths(categoriesSheet, categoriesData);

      // --- 3. Brands Sheet ---
      const brandsData = ensureNotEmpty(brands.map(brand => ({
        Name: brand.name,
        Description: brand.description || '',
        'Is Active': brand.isActive ? 'Yes' : 'No',
        'Created At': formatDate(brand.createdAt),
        'Updated At': formatDate(brand.updatedAt),
      })), {
        Name: 'No brands found', Description: '', 'Is Active': '', 'Created At': '', 'Updated At': '',
      });
      
      const brandsSheet = workbook.addWorksheet('Brands');
      brandsSheet.addRows(brandsData.map(d => Object.values(d)));
      setColumnWidths(brandsSheet, brandsData);

      // --- 4. Suppliers Sheet ---
      const suppliersData = ensureNotEmpty(suppliers.map((supplier: any) => ({
        Name: supplier.name,
        Email: supplier.email || '',
        Phone: supplier.phone || '',
        Address: supplier.address || '',
        'Contact Person': supplier.contactPerson || '',
        'Is Active': supplier.isActive ? 'Yes' : 'No',
        'Created At': formatDate(supplier.createdAt),
        'Updated At': formatDate(supplier.updatedAt),
      })), {
        Name: 'No suppliers found', Email: '', Phone: '', Address: '',
        'Contact Person': '', 'Is Active': '', 'Created At': '', 'Updated At': '',
      });
      
      const suppliersSheet = workbook.addWorksheet('Suppliers');
      suppliersSheet.addRows(suppliersData.map(d => Object.values(d)));
      setColumnWidths(suppliersSheet, suppliersData);

      // --- 5. Vendors Sheet ---
      const vendorsData = ensureNotEmpty(vendors.map((vendor: any) => ({
        Name: vendor.name,
        Email: vendor.email || '',
        Phone: vendor.phone || '',
        Address: vendor.address || '',
        'Contact Person': vendor.contactPerson || '',
        'Is Active': vendor.isActive ? 'Yes' : 'No',
        'Created At': formatDate(vendor.createdAt),
        'Updated At': formatDate(vendor.updatedAt),
      })), {
        Name: 'No vendors found', Email: '', Phone: '', Address: '',
        'Contact Person': '', 'Is Active': '', 'Created At': '', 'Updated At': '',
      });
      
      const vendorsSheet = workbook.addWorksheet('Vendors');
      vendorsSheet.addRows(vendorsData.map(d => Object.values(d)));
      setColumnWidths(vendorsSheet, vendorsData);

      // --- 6. Employees Sheet ---
      const employeesData = ensureNotEmpty(employees.map((employee: any) => ({
        Name: employee.firstName + ' ' + employee.lastName,
        Email: employee.email || '',
        Phone: employee.phone || '',
        Address: employee.address || '',
        Position: employee.position || '',
        Department: employee.department || '',
        HireDate: formatDate(employee.hireDate),
        Salary: employee.salary || 0,
        'Is Active': employee.isActive ? 'Yes' : 'No',
        'Created At': formatDate(employee.createdAt),
        'Updated At': formatDate(employee.updatedAt),
      })), {
        Name: 'No employees found', Email: '', Phone: '', Address: '', Position: '',
        Department: '', HireDate: '', Salary: 0, 'Is Active': '', 'Created At': '', 'Updated At': '',
      });
      
      const employeesSheet = workbook.addWorksheet('Employees');
      employeesSheet.addRows(employeesData.map(d => Object.values(d)));
      setColumnWidths(employeesSheet, employeesData);

      // --- 7. Purchase Orders Sheet ---
      const purchaseRows = [];
      for (const po of purchaseOrders) {
        const items = po.items || [];
        if (!items.length) { continue; }
        for (const item of items) {
          const unitPrice = toNumber(item.unitPrice);
          const lineTotal = toNumber(item.totalPrice) || (toNumber(item.quantity) * unitPrice);
          purchaseRows.push({
            'Order Number': po.orderNumber,
            'Supplier': po.supplier?.name || 'N/A',
            'Order Date': formatDate(po.orderDate),
            'Status': po.status,
            'Item': item.product?.name || item.productId || 'N/A',
            'Quantity': item.quantity || 0,
            'Unit Price': unitPrice,
            'Line Total': lineTotal,
            'PO Total': toNumber(po.totalAmount),
            'Notes': po.notes || '',
          });
        }
      }
      const purchaseOrderData = ensureNotEmpty(purchaseRows, {
        'Order Number': 'No purchase orders found', 'Supplier': '', 'Order Date': '',
        'Status': '', 'Item': '', 'Quantity': 0, 'Unit Price': 0, 'Line Total': 0, 'PO Total': 0, 'Notes': '',
      });
      
      const purchaseOrdersSheet = workbook.addWorksheet('Purchase Orders');
      purchaseOrdersSheet.addRows(purchaseOrderData.map(d => Object.values(d)));
      setColumnWidths(purchaseOrdersSheet, purchaseOrderData);

      // --- 8. Sales Orders Sheet ---
      const salesRows = [];
      for (const so of salesOrders) {
        const items = so.items || [];
        if (!items.length) { continue; }
        for (const item of items) {
          const unitPrice = toNumber(item.unitPrice);
          const lineTotal = toNumber(item.totalPrice) || (toNumber(item.quantity) * unitPrice);
          salesRows.push({
            'Order Number': so.orderNumber,
            'Vendor': so.vendor?.name || 'N/A',
            'Order Date': formatDate(so.orderDate),
            'Status': so.status,
            'Item': item.product?.name || item.productId || 'N/A',
            'Quantity': item.quantity || 0,
            'Unit Price': unitPrice,
            'Line Total': lineTotal,
            'SO Total': toNumber(so.totalAmount),
            'Notes': so.notes || '',
          });
        }
      }
      const salesOrderData = ensureNotEmpty(salesRows, {
        'Order Number': 'No sales orders found', 'Vendor': '', 'Order Date': '',
        'Status': '', 'Item': '', 'Quantity': 0, 'Unit Price': 0, 'Line Total': 0, 'SO Total': 0, 'Notes': '',
      });
      
      const salesOrdersSheet = workbook.addWorksheet('Sales Orders');
      salesOrdersSheet.addRows(salesOrderData.map(d => Object.values(d)));
      setColumnWidths(salesOrdersSheet, salesOrderData);

      // --- 9. Invoices Sheet ---
      const invoiceData = ensureNotEmpty(invoices.map((invoice: any) => ({
        'Invoice Number': invoice.invoiceNumber,
        'Invoice Date': formatDate(invoice.invoiceDate),
        'Due Date': formatDate(invoice.dueDate),
        'Total Amount': toNumber(invoice.totalAmount),
        'Payment Status': invoice.paymentStatus,
        'Payment Date': formatDate(invoice.paymentDate),
        'Payment Method': invoice.paymentMethod,
        'Payment Notes': invoice.paymentNotes || '',
      })), {
        'Invoice Number': 'No invoices found', 'Invoice Date': '', 'Due Date': '',
        'Total Amount': 0, 'Payment Status': '', 'Payment Date': '', 'Payment Method': '', 'Payment Notes': '',
      });
      
      const invoicesSheet = workbook.addWorksheet('Invoices');
      invoicesSheet.addRows(invoiceData.map(d => Object.values(d)));
      setColumnWidths(invoicesSheet, invoiceData);

      // --- 10. Payments Sheet ---
      const paymentsData = ensureNotEmpty(payments.map((payment: any) => ({
        'Invoice Number': payment.invoice?.invoiceNumber || 'N/A',
        Amount: toNumber(payment.amount),
        'Payment Date': formatDate(payment.paymentDate),
        'Payment Method': payment.paymentMethod,
        Reference: payment.reference || '',
        Notes: payment.notes || '',
        'Created At': formatDate(payment.createdAt),
        'Updated At': formatDate(payment.updatedAt),
      })), {
        'Invoice Number': 'No payments found', Amount: 0, 'Payment Date': '',
        'Payment Method': '', Reference: '', Notes: '', 'Created At': '', 'Updated At': '',
      });
      
      const paymentsSheet = workbook.addWorksheet('Payments');
      paymentsSheet.addRows(paymentsData.map(d => Object.values(d)));
      setColumnWidths(paymentsSheet, paymentsData);

      // --- 11. Payrolls Sheet ---
      const payrollsData = ensureNotEmpty(payrolls.map((payroll: any) => ({
        'Employee Name': payroll.employee ? `${payroll.employee.firstName} ${payroll.employee.lastName}` : 'N/A',
        'Employee ID': payroll.employee?.employeeId || 'N/A',
        Month: payroll.month,
        Year: payroll.year,
        'Basic Salary': toNumber(payroll.basicSalary),
        Allowances: toNumber(payroll.allowances),
        Deductions: toNumber(payroll.deductions),
        'Net Salary': toNumber(payroll.netSalary),
        Status: payroll.status,
        'Created At': formatDate(payroll.createdAt),
        'Updated At': formatDate(payroll.updatedAt),
      })), {
        'Employee Name': 'No payrolls found', 'Employee ID': '', Month: 0, Year: 0,
        'Basic Salary': 0, Allowances: 0, Deductions: 0, 'Net Salary': 0, Status: '',
        'Created At': '', 'Updated At': '',
      });
      
      const payrollsSheet = workbook.addWorksheet('Payrolls');
      payrollsSheet.addRows(payrollsData.map(d => Object.values(d)));
      setColumnWidths(payrollsSheet, payrollsData);

      // --- 12. Stock Sheet ---
      const stockData = ensureNotEmpty(stock.map((s: any) => ({
        'Product Name': s.product?.name || 'N/A',
        'Product SKU': s.product?.sku || 'N/A',
        Quantity: s.quantity,
        Location: s.location || '',
        'Created At': formatDate(s.createdAt),
        'Updated At': formatDate(s.updatedAt),
      })), {
        'Product Name': 'No stock records found', 'Product SKU': '',
        Quantity: 0, Location: '', 'Created At': '', 'Updated At': '',
      });
      
      const stockSheet = workbook.addWorksheet('Stock');
      stockSheet.addRows(stockData.map(d => Object.values(d)));
      setColumnWidths(stockSheet, stockData);

      // --- 13. Summary Sheet ---
      const summaryData: any[] = [
        ['Report Period', `${formatDate(startDate)} to ${formatDate(endDate)}`],
        ['Generated On', formatDate(new Date())],
        [],
        ['Summary', ''],
        ['Total Products', products.length],
        ['Total Categories', categories.length],
        ['Total Brands', brands.length],
        ['Total Suppliers', suppliers.length],
        ['Total Vendors', vendors.length],
        ['Total Employees', employees.length],
        ['Purchase Orders (Period)', purchaseOrders.length],
        ['Sales Orders (Period)', salesOrders.length],
        ['Invoices (Period)', invoices.length],
        ['Payments (Period)', payments.length],
        ['Payrolls (Period)', payrolls.length],
        ['Stock Records', stock.length],
      ];
      
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.addRows(summaryData);

      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 30 },
        { header: 'Value', key: 'value', width: 20 },
      ] as ExcelJS.Column[];
      
      const fileName = `inventory_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      const filePath = path.join(reportsDir, fileName);
      
      await workbook.xlsx.writeFile(filePath);

      return {
        success: true,
        data: { filePath },
        message: 'Report generated successfully'
      };

    } catch (error: any) {
      console.error('Report generation failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to generate report'
      };
    }
  });

  console.log('✅ Report handlers registered successfully');
}

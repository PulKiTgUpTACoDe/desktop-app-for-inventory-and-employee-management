import { inventoryService } from './inventoryService';
import { salesOrderService } from './salesOrderService';
import { purchaseOrderService } from './purchaseOrderService';
import { employeeService } from './employeeService';
import { format } from 'date-fns';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Product {
  id: string;
  name: string;
  stock?: {
    quantity: number;
  };
  quantity: number;
  category?: {
    name: string;
  };
  price: number;
  costPrice: number;
  createdAt: string;
  updatedAt: string;
}

interface SalesOrder {
  id: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  vendor?: {
    name: string;
  };
}

interface PurchaseOrder {
  id: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  supplier?: {
    name: string;
  };
}

interface Employee {
  id: string;
  isActive: boolean;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  // Core metrics
  totalProducts: number;
  lowStockItems: number;
  totalSales: number;
  totalPurchases: number;
  activeEmployees: number;
  pendingPurchaseOrders: number;
  pendingSalesOrders: number;
  
  // Percentage changes
  totalProductsChange: number;
  lowStockItemsChange: number;
  totalSalesChange: number;
  totalPurchasesChange: number;
  activeEmployeesChange: number;
  
  // Chart data
  salesTrend: { month: string; sales: number }[];
  topSellingProducts: { name: string; quantity: number }[];
  inventoryByCategory: { name: string; count: number }[];
  salesByVendor: { name: string; amount: number }[];
}

export interface ReportData {
  totalProducts: number;
  lowStockItems: number;
  totalSales: number;
  totalPurchases: number;
  activeEmployees: number;
  pendingPurchaseOrders: number;
  pendingSalesOrders: number;
  totalProductsChange: number;
  lowStockItemsChange: number;
  totalSalesChange: number;
  totalPurchasesChange: number;
  activeEmployeesChange: number;
  salesTrend: { month: string; sales: number }[];
  topSellingProducts: { name: string; quantity: number }[];
  inventoryByCategory: { name: string; count: number }[];
  salesByVendor: { name: string; amount: number }[];
}

export const analyticsService = {
  getReportData: async ({ startDate: _startDate, endDate: _endDate }: { startDate: string; endDate: string }): Promise<ReportData> => {
    // In a real app, you would filter data based on the date range
    // For now, we'll return the current dashboard metrics
    const metrics = await analyticsService.getDashboardMetrics();
    return metrics as unknown as ReportData;
  },

  getDashboardMetrics: async (): Promise<DashboardMetrics & ReportData> => {
    try {
      // Fetch all required data in parallel
      const [
        productsRes,
        salesOrdersRes,
        purchaseOrdersRes,
        employeesRes,
      ] = await Promise.all([
        inventoryService.products.getAll(),
        salesOrderService.getAll(),
        purchaseOrderService.getAll(),
        employeeService.getAll(),
      ]);

      // Helper function to handle API responses
      const handleApiResponse = <T>(res: ApiResponse<T[]>, errorMsg: string): T[] => {
        if (!res.success) {
          console.error(`${errorMsg}:`, res.error);
          return [];
        }
        return res.data || [];
      };

      const products = handleApiResponse<Product>(productsRes as ApiResponse<Product[]>, 'Failed to fetch products');
      const salesOrders = handleApiResponse<SalesOrder>(salesOrdersRes as ApiResponse<SalesOrder[]>, 'Failed to fetch sales orders');
      const purchaseOrders = handleApiResponse<PurchaseOrder>(purchaseOrdersRes as ApiResponse<PurchaseOrder[]>, 'Failed to fetch purchase orders');
      const employees = handleApiResponse<Employee>(employeesRes as ApiResponse<Employee[]>, 'Failed to fetch employees');

      // Get current date information
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Helper function to filter and sum by month and year
      const getMonthlyTotal = <T extends { orderDate: string; totalAmount: number }>(
        items: T[], 
        month: number, 
        year: number
      ): number => {
        return items
          .filter(item => {
            const date = new Date(item.orderDate);
            return date.getMonth() === month && date.getFullYear() === year;
          })
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      };

      // Calculate current month metrics
      const currentMonthSales = getMonthlyTotal(salesOrders, currentMonth, currentYear);
      const currentMonthPurchases = getMonthlyTotal(purchaseOrders, currentMonth, currentYear);

      // Core metrics
      const totalProducts = products.length;
      const lowStockItems = products.filter(p => p.stock && p.stock.quantity < 10).length;
      const activeEmployees = employees.filter(e => e.isActive).length;
      const pendingPurchaseOrders = purchaseOrders.filter(po => po.status === 'pending').length;
      const pendingSalesOrders = salesOrders.filter(so => so.status === 'pending').length;

      // Calculate percentage changes
      const calculatePercentageChange = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return parseFloat((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
      };

      // Get previous month's data for all metrics using actual timestamps
      const prevMonthActiveEmployees = employees.filter(e => {
        const hireDate = new Date(e.hireDate);
        return e.isActive && 
               hireDate < new Date(currentYear, currentMonth, 1);
      }).length;

      // Calculate previous month's metrics
      const prevMonthProductCount = products.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate < new Date(prevMonthYear, prevMonth + 1, 1) && 
               createdDate >= new Date(prevMonthYear, prevMonth, 1);
      }).length;
      
      // Get previous month's sales and purchases
      const prevMonthSalesTotal = getMonthlyTotal(salesOrders, prevMonth, prevMonthYear);
      const prevMonthPurchasesTotal = getMonthlyTotal(purchaseOrders, prevMonth, prevMonthYear);
      
      // Get previous month's low stock items
      const prevMonthLowStock = products.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate < new Date(currentYear, currentMonth, 1) && 
               p.stock && p.stock.quantity < 10;
      }).length;

      // Calculate percentage changes
      const totalSalesChange = calculatePercentageChange(currentMonthSales, prevMonthSalesTotal);
      const totalPurchasesChange = calculatePercentageChange(currentMonthPurchases, prevMonthPurchasesTotal);
      const totalProductsChange = calculatePercentageChange(totalProducts, prevMonthProductCount);
      const activeEmployeesChange = calculatePercentageChange(activeEmployees, prevMonthActiveEmployees);
      const lowStockItemsChange = calculatePercentageChange(lowStockItems, prevMonthLowStock);

      // Generate sales trend for last 6 months
      const salesTrend = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(currentMonth - i);
        const monthName = format(date, 'MMM');
        const year = date.getFullYear();

        const monthSales = getMonthlyTotal(salesOrders, date.getMonth(), year);

        return { month: `${monthName} ${year}`, sales: monthSales };
      }).reverse();

      // Get top selling products
      const productSales = new Map<string, number>();
      salesOrders.forEach((order: SalesOrder) => {
        order.items?.forEach(item => {
          const current = productSales.get(item.productId) || 0;
          productSales.set(item.productId, current + item.quantity);
        });
      });

      const topSellingProducts = Array.from(productSales.entries())
        .map(([productId, quantity]) => {
          const product = products.find((p: Product) => p.id === productId);
          return {
            name: product?.name || 'Unknown Product',
            quantity
          };
        })
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // Get inventory by category
      const categoryCount = new Map<string, number>();
      products.forEach((product: Product) => {
        if (product.category) {
          const current = categoryCount.get(product.category.name) || 0;
          categoryCount.set(product.category.name, current + 1);
        }
      });

      const inventoryByCategory = Array.from(categoryCount.entries()).map(([name, count]) => ({
        name,
        count
      }));

      // Get sales by vendor
      const vendorSales = new Map<string, number>();
      salesOrders.forEach((order: SalesOrder) => {
        if (order.vendor) {
          const current = vendorSales.get(order.vendor.name) || 0;
          vendorSales.set(order.vendor.name, current + (order.totalAmount || 0));
        }
      });

      const salesByVendor = Array.from(vendorSales.entries()).map(([name, amount]) => ({
        name,
        amount
      }));

      return {
        // Core metrics
        totalProducts,
        lowStockItems,
        totalSales: currentMonthSales,
        totalPurchases: currentMonthPurchases,
        activeEmployees,
        pendingPurchaseOrders,
        pendingSalesOrders,
        
        // Percentage changes
        totalProductsChange,
        lowStockItemsChange,
        totalSalesChange,
        totalPurchasesChange,
        activeEmployeesChange,
        
        // Chart data
        salesTrend,
        topSellingProducts,
        inventoryByCategory,
        salesByVendor
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw new Error('Failed to load dashboard data. Please try again later.');
    }
  }
};

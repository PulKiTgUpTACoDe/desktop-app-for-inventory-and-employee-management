import React, { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Box,
  Clock,
  FileDown,
} from "lucide-react";
import {
  analyticsService,
  DashboardMetrics,
} from "../services/analyticsService";
import ReportModal from "../components/ReportModal";
import { SalesTrendChart } from "../components/charts/SalesTrendChart";
import { TopSellingProductsChart } from "../components/charts/TopSellingProductsChart";
import { InventoryByCategoryChart } from "../components/charts/InventoryByCategoryChart";
import { SalesByVendorChart } from "../components/charts/SalesByVendorChart";
import { MetricCard } from "../components/charts/MetricCard";

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Quick Actions
  const quickActions = [
    {
      icon: <ShoppingCart className="h-5 w-5 text-gray-600 mr-2" />,
      label: "New Sale",
      onClick: () => {},
    },
    {
      icon: <Box className="h-5 w-5 text-gray-600 mr-2" />,
      label: "Add Product",
      onClick: () => {},
    },
    {
      icon: <FileDown className="h-5 w-5 text-gray-600 mr-2" />,
      label: "Generate Report",
      onClick: () => setIsReportModalOpen(true),
    },
    {
      icon: <Clock className="h-5 w-5 text-gray-600 mr-2" />,
      label: "Recent Activity",
      onClick: () => {},
    },
  ] as const;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Products"
            value={metrics?.totalProducts || 0}
            change={metrics?.totalProductsChange || 0}
            icon={<Package className="h-6 w-6 text-blue-600" />}
            color="bg-blue-100"
          />

          <MetricCard
            title="Low Stock Items"
            value={metrics?.lowStockItems || 0}
            change={metrics?.lowStockItemsChange || 0}
            icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />}
            color="bg-yellow-100"
          />

          <MetricCard
            title="Monthly Sales"
            value={`₹${(metrics?.totalSales || 0).toLocaleString()}`}
            change={metrics?.totalSalesChange || 0}
            icon={<ShoppingCart className="h-6 w-6 text-green-600" />}
            color="bg-green-100"
          />

          <MetricCard
            title="Active Employees"
            value={metrics?.activeEmployees || 0}
            change={metrics?.activeEmployeesChange || 0}
            icon={<Users className="h-6 w-6 text-purple-600" />}
            color="bg-purple-100"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesTrendChart data={metrics?.salesTrend || []} />
          <TopSellingProductsChart data={metrics?.topSellingProducts || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <InventoryByCategoryChart data={metrics?.inventoryByCategory || []} />
          <SalesByVendorChart data={metrics?.salesByVendor || []} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map(
              (
                action: {
                  icon: React.ReactNode;
                  label: string;
                  onClick: () => void;
                },
                index: number
              ) => (
                <button
                  key={index}
                  className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={action.onClick}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Report Generation Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;

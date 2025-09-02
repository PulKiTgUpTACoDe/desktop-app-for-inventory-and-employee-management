import React from "react";
import Header from "../components/Header";

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome Admin
              </h2>
              <p className="text-gray-600">
                Welcome to Swaraj Enterprises ERP System. This is your dashboard
                where you can manage inventory, track purchases and sales,
                handle payroll, and generate reports.
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Inventory
                  </h3>
                  <p className="text-blue-600 text-sm">Manage stock levels</p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900">
                    Sales
                  </h3>
                  <p className="text-green-600 text-sm">Track revenue</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900">
                    Purchases
                  </h3>
                  <p className="text-purple-600 text-sm">Manage suppliers</p>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900">
                    Reports
                  </h3>
                  <p className="text-orange-600 text-sm">
                    Analytics & insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

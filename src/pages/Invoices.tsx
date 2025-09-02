import React from 'react';
import Header from '../components/Header';

const Invoices: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoices</h2>
              <h2 className="text-xl font-bold mb-4">Add Invoice</h2>
              {/* Invoice Form */}
              <h2 className="text-xl font-bold mt-8 mb-4">Invoices List</h2>
              {/* Invoices List */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Invoices;

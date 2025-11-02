import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  color,
  icon,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && (
            <div
              className={`mt-1 flex items-center ${
                change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span className="ml-1 text-sm font-medium">
                {Math.abs(change)}% from last month
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-full p-3 ${color} bg-opacity-10`}>{icon}</div>
      </div>
    </div>
  );
};

export default MetricCard;

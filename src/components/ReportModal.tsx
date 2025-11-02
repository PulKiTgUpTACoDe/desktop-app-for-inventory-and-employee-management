import React, { useState, useEffect } from "react";
import {
  Transition,
  Dialog,
  TransitionChild,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ReportPeriod } from "../types/report";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periods, setPeriods] = useState<ReportPeriod[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadPeriods = async () => {
      try {
        if (window.electronAPI && window.electronAPI.getReportPeriods) {
          const periods = await window.electronAPI.getReportPeriods();
          setPeriods(periods);
        }
      } catch (err) {
        console.error("Failed to load report periods:", err);
      }
    };

    if (isOpen) {
      loadPeriods();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleGenerate = async (period: ReportPeriod) => {
    try {
      setIsGenerating(true);
      setError(null);
      setSuccess(null);

      if (window.electronAPI && window.electronAPI.generateReport) {
        const result = await window.electronAPI.generateReport({
          months: period.months,
        });

        if (result.success) {
          setSuccess(
            `Report generated successfully! File saved to: ${
              result.data?.filePath || "Documents/Inventory Reports"
            }`
          );

          setTimeout(() => {
            onClose();
          }, 3000);
        } else {
          throw new Error(result.error || "Failed to generate report");
        }
      } else {
        throw new Error("Report API not available");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate report. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Generate Report
                </DialogTitle>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Select a time period for your report. The report will
                    include all data from your database.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {periods.map((period) => (
                    <button
                      key={period.months}
                      onClick={() => handleGenerate(period)}
                      disabled={isGenerating}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors ${
                        isGenerating ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isGenerating ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          {period.label}
                        </span>
                      ) : (
                        period.label
                      )}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mt-4 p-3 text-sm text-green-700 bg-green-100 rounded-md">
                    {success}
                  </div>
                )}

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                    disabled={isGenerating}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReportModal;

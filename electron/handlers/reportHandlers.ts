import { ipcMain } from 'electron';
import { ReportPeriod, ReportResult } from '../../src/types/report.js';

interface ReportService {
  generateReport: (months: number) => Promise<{ filePath: string }>;
  reportPeriods: ReportPeriod[];
}

export function reportHandlers(services: { reportService: ReportService }) {
  const { reportService } = services;

  console.log('Registering report handlers...');

  // Handle report generation
  ipcMain.handle('generate-report', async (_, params: { months: number }): Promise<ReportResult> => {
    try {
      console.log('generate-report handler called with:', params);
      const result = await reportService.generateReport(params.months);
      return {
        success: true,
        data: result,
        message: 'Report generated successfully'
      };
    } catch (error) {
      console.error('Report generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate report',
        message: 'Failed to generate report'
      };
    }
  });

  // Get available report periods
  ipcMain.handle('get-report-periods', async (): Promise<ReportPeriod[]> => {
    try {
      console.log('get-report-periods handler called');
      const periods = reportService.reportPeriods;
      console.log('Returning periods:', periods);
      return periods;
    } catch (error) {
      console.error('Failed to get report periods:', error);
      return [];
    }
  });

  console.log('✅ Report handlers registered successfully');
}


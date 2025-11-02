export interface ReportPeriod {
    label: string;
    months: number;
}

export interface ReportResult {
    success: boolean;
    data?: { filePath: string };
    error?: string;
    message?: string;
}

export interface ReportParams {
    months: number;
}


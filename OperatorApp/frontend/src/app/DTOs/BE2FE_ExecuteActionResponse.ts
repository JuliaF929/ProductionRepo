export interface BE2FE_ExecuteActionResponse {
    version: string;
    startExecutionDateTimeUTC: string;
    endExecutionDateTimeUTC: string;
    executionResult: string;
    operatorName: string;
    reportPdfPath: string;
  }
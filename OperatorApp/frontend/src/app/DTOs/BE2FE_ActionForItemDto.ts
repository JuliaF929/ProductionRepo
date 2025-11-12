export interface BE2FE_ActionForItemDto {
    itemSerialNumber: string;
    itemType: string;
    actionName: string;
    actionSWVersionForExecution: string;
    actionExeName: string;
    latestExecutionDateTimeUTC: string;
    latestResult: string;
    latestOperatorName: string;
    latestActionVersionNumber: string;
  }
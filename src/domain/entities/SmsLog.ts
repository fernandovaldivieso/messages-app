export type LogStatus = 'forwarded' | 'filtered' | 'error';

export interface SmsLog {
  id: string;
  sender: string;
  body: string;
  timestamp: number;
  status: LogStatus;
  errorReason?: string;
  matchedRuleId?: string;
}

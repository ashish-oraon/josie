export interface IBudget {
  Month: string;
  Category: string;
  Planned: number;
  Actual: number;
  Variance: number;
  Status: string;
  LastUpdated: string;
  PercentageUsed?: number;
}

export interface ICategory {
  ID: number;
  Name: string;
  Type: string;
  SubType: string;
  Icon: string;
  Color: string;
  MonthlyBudget: number;
  IsActive: boolean;
  SortOrder: number;
}

export interface IUser {
  ID: number;
  Name: string;
  Email: string;
  Role: string;
  IsActive: boolean;
  CreatedAt: string;
}

export interface ISettings {
  Currency: string;
  CurrencySymbol: string;
  PreviousMonthsToShow: number;
  DefaultBudget: number;
  NotificationsEnabled: boolean;
  AutoCategorization: boolean;
}

export interface IMonthlyStats {
  month: string;
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
  categoryBreakdown: { [key: string]: number };
}

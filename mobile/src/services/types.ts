export interface ApiUser {
  id: number;
  name: string;
  email: string;
  user_type: 'admin' | 'user';
  created_at?: string | null;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface LogoutResponse {
  message: string;
}

export interface MeResponse {
  user: ApiUser;
}

export interface ApiFieldErrors {
  [field: string]: string | string[];
}

export type ApiTransactionType = 'income' | 'expense' | 'liability';

export interface ApiCategory {
  id: number;
  name: string;
  type: ApiTransactionType;
  is_tuition: boolean;
  is_other: boolean;
  transactions_count?: number;
}

export interface ApiTransaction {
  id: number;
  category_id: number;
  type: ApiTransactionType;
  amount: number | string;
  transaction_date: string;
  description: string;
  remarks: string | null;
  deleted_at?: string | null;
  category: ApiCategory | null;
  user: ApiUser | null;
}

export interface ApiDashboard {
  month: string;
  categories: ApiCategory[];
  monthly_report: {
    income: number | string;
    expense: number | string;
    liability: number | string;
    net: number | string;
  };
  transactions: ApiTransaction[];
}

export interface ApiRecurring {
  id: number;
  category_id: number;
  category: ApiCategory | null;
  amount: number | string;
  frequency: 'monthly';
  start_date: string;
  end_date: string | null;
  description: string;
}

export interface ApiCollection<T> {
  data: T[];
  meta: {
    last_page: number;
  };
}

export interface ApiReportTransactionCollection {
  transactions: ApiTransaction[];
  meta: {
    last_page: number;
  };
}

export interface ApiAnnualReport {
  monthly: {
    month: string;
    income: number | string;
    expense: number | string;
    liability: number | string;
    net: number | string;
  }[];
  totals: {
    income: number | string;
    expense: number | string;
    liability: number | string;
    net: number | string;
  };
}

export interface ApiCategorySummary {
  categoryReport: {
    name: string;
    type: string;
    total: number;
  }[];
  year: number;
}

export interface ApiLog {
  id: number;
  user_name: string;
  user_email: string | null;
  action: string;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface ApiUserAccount extends ApiUser {
  created_at: string | null;
}

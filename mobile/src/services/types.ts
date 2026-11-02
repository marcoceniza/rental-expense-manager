/**
 * API types — a faithful mirror of the Laravel backend response contracts in
 * web/routes/api.php and web/app/Http/Controllers/Api/V1/*.
 *
 * The web API is the source of truth. Field names, casing and shapes below are
 * taken directly from the backend so the mobile client can never drift.
 *
 * NOTE: the mobile UI types in src/types are intentionally kept separate from
 * these API types. The API uses snake_case keys and lowercase enum values
 * (e.g. type: 'income'), while the UI uses camelCase and uppercase enums
 * (e.g. type: 'EXPENSE'). Convert between them at the call sites.
 */

export type ApiType = 'income' | 'expense' | 'liability';

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  user_type: 'admin' | 'user';
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ApiMeUser {
  id: number;
  name: string;
  email: string;
  user_type: 'admin' | 'user';
}

export interface ApiCategory {
  id: number;
  name: string;
  type: ApiType;
  is_tuition: boolean;
  is_other: boolean;
  transaction_count: number;
}

export interface ApiCategoryData {
  id: number;
  name: string;
  type: ApiType;
  is_tuition: boolean;
  is_other: boolean;
}

export interface ApiRecurring {
  id: number;
  category_id: number;
  category: ApiCategoryData | null;
  amount: string;
  frequency: 'monthly';
  start_date: string;
  end_date: string | null;
  last_generated_at: string | null;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ApiTransaction {
  id: number;
  user_id: number;
  category_id: number;
  type: ApiType;
  amount: string;
  transaction_date: string;
  description: string;
  remarks: string;
  recurring_id: number;
  is_recurring_generated: boolean;
  created_at: string;
  updated_at: string;
  category: ApiCategoryData | null;
  user: ApiMeUser | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface LogoutResponse {
  message: string;
}

export interface MeResponse {
  user: ApiMeUser;
}

export interface UpdateProfileResponse {
  user: ApiMeUser;
}

export interface TransactionsListResponse {
  data: ApiTransaction[];
  meta: PaginationMeta;
}

export interface CreatedResponse<T> {
  data: T;
}

export interface MessageResponse {
  message: string;
}

export interface TransactionsResponse {
  data: ApiTransaction;
}

export interface DeleteResponse {
  message: string;
}

export interface RestoreResponse {
  data: ApiTransaction;
}

export interface ForceDeleteResponse {
  message: string;
}

export interface CategoriesListResponse {
  data: ApiCategory[];
}

export interface RecurringListResponse {
  data: ApiRecurring[];
}

export interface ReportsDashboardResponse {
  month: string;
  categories: ApiCategory[];
  monthly_report: {
    income: string;
    expense: string;
    liability: string;
    net: string;
  };
  transactions: ApiTransaction[];
}

export interface AnnualReportResponse {
  monthly: {
    month: string;
    income: number;
    expense: number;
    liability: number;
    net: number;
  }[];
  totals: {
    income: number;
    expense: number;
    liability: number;
    net: number;
  };
}

export interface CharityReportResponse {
  expense: number;
  transactions: ApiTransaction[];
  meta: PaginationMeta;
}

export interface OthersReportResponse {
  income: number;
  transactions: ApiTransaction[];
  meta: PaginationMeta;
}

/** Validation error shape returned by the backend on 422. */
export interface ApiFieldErrors {
  [field: string]: string | string[];
}

/**
 * Auth token + user session state. Owned by the AuthProvider so the Axios
 * instance can attach the Sanctum token to every request automatically.
 */
export interface AuthState {
  token: string | null;
  user: ApiUser | null;
}

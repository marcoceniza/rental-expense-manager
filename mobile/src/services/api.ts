/**
 * API actions for the Rental Expense Manager.
 *
 * Every function maps 1:1 to a route in web/routes/api.php. Request payloads
 * match the backend form requests (web/app/Http/Requests/*) and responses are
 * typed from the backend controller output. Keep this file the single source
 * of truth for *how* the mobile app talks to the API.
 */
import { api, getAccessToken, clearAccessToken, setAccessToken } from './axios';
import type {
  ApiFieldErrors,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  UpdateProfileResponse,
  CategoriesListResponse,
  RecurringListResponse,
  TransactionsListResponse,
  TransactionsResponse,
  DeleteResponse,
  RestoreResponse,
  ForceDeleteResponse,
  ReportsDashboardResponse,
  AnnualReportResponse,
  CharityReportResponse,
  OthersReportResponse,
} from './types';

/* --------------------------------------------------------------------------
 * Auth
 * ------------------------------------------------------------------------ */

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  user_type: 'user' | 'admin';
}

export async function register(input: RegisterInput): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/register', input);
  await setAccessToken(res.data.token);
  return res.data;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/login', input);
  await setAccessToken(res.data.token);
  return res.data;
}

export async function logout(): Promise<LogoutResponse> {
  const res = await api.post('/api/logout');
  await clearAccessToken();
  return res.data;
}

export async function me(): Promise<MeResponse> {
  const res = await api.get<MeResponse>('/api/me');
  return res.data;
}

export async function updateProfile(input: {
  name?: string;
  email?: string;
}): Promise<UpdateProfileResponse> {
  const res = await api.patch<UpdateProfileResponse>('/api/me', input);
  return res.data;
}

/* --------------------------------------------------------------------------
 * Transactions
 * ------------------------------------------------------------------------ */

export interface TransactionInput {
  category_id: number;
  type: 'income' | 'expense' | 'liability';
  amount: string;
  transaction_date: string;
  description: string;
  remarks?: string;
}

export interface TransactionUpdateInput extends Partial<TransactionInput> {
  amount: string;
  transaction_date: string;
  description: string;
}

export interface ListTransactionsParams {
  month?: string;
  type?: 'income' | 'expense' | 'liability';
}

export async function listTransactions(params: ListTransactionsParams = {}): Promise<TransactionsListResponse> {
  const query: Record<string, string> = {};
  if (params.month) query.month = params.month;
  if (params.type) query.type = params.type;
  const res = await api.get<TransactionsListResponse>('/api/transactions', { params: query });
  return res.data;
}

export async function createTransaction(input: TransactionInput): Promise<TransactionsResponse> {
  const res = await api.post<TransactionsResponse>('/api/transactions', input);
  return res.data;
}

export async function updateTransaction(id: number, input: TransactionUpdateInput): Promise<TransactionsResponse> {
  const res = await api.patch<TransactionsResponse>(`/api/transactions/${id}`, input);
  return res.data;
}

export async function deleteTransaction(id: number): Promise<DeleteResponse> {
  const res = await api.delete<DeleteResponse>(`/api/transactions/${id}`);
  return res.data;
}

export async function restoreTransaction(id: number): Promise<RestoreResponse> {
  const res = await api.patch<RestoreResponse>(`/api/transactions/${id}/restore`);
  return res.data;
}

export async function forceDeleteTransaction(id: number): Promise<ForceDeleteResponse> {
  const res = await api.delete<ForceDeleteResponse>(`/api/transactions/${id}/force-delete`);
  return res.data;
}

/* --------------------------------------------------------------------------
 * Categories
 * ------------------------------------------------------------------------ */

export interface CategoryInput {
  name: string;
  type: 'income' | 'expense' | 'liability';
  is_tuition?: boolean;
  is_other?: boolean;
}

export async function listCategories(): Promise<CategoriesListResponse> {
  const res = await api.get<CategoriesListResponse>('/api/categories');
  return res.data;
}

export async function createCategory(input: CategoryInput): Promise<CategoriesListResponse> {
  const res = await api.post<CategoriesListResponse>('/api/categories', input);
  return res.data;
}

export async function updateCategory(
  id: number,
  input: CategoryInput,
): Promise<CategoriesListResponse> {
  const res = await api.patch<CategoriesListResponse>(`/api/categories/${id}`, input);
  return res.data;
}

export async function deleteCategory(id: number): Promise<DeleteResponse> {
  const res = await api.delete<DeleteResponse>(`/api/categories/${id}`);
  return res.data;
}

/** Convert a stored category payload into the API shape. */
export function toApiCategory(input: {
  name: string;
  type: 'income' | 'expense' | 'liability';
  is_tuition?: boolean;
  is_other?: boolean;
}): CategoryInput {
  return {
    name: input.name,
    type: input.type,
    is_tuition: input.is_tuition,
    is_other: input.is_other,
  };
}

/* --------------------------------------------------------------------------
 * Recurring
 * ------------------------------------------------------------------------ */

export interface RecurringInput {
  category_id: number;
  amount: string;
  frequency: 'monthly';
  start_date: string;
  end_date?: string;
  description: string;
}

export async function listRecurring(): Promise<RecurringListResponse> {
  const res = await api.get<RecurringListResponse>('/api/recurring');
  return res.data;
}

export async function createRecurring(input: RecurringInput): Promise<RecurringListResponse> {
  const res = await api.post<RecurringListResponse>('/api/recurring', input);
  return res.data;
}

export async function updateRecurring(
  id: number,
  input: RecurringInput,
): Promise<RecurringListResponse> {
  const res = await api.patch<RecurringListResponse>(`/api/recurring/${id}`, input);
  return res.data;
}

export async function deleteRecurring(id: number): Promise<DeleteResponse> {
  const res = await api.delete<DeleteResponse>(`/api/recurring/${id}`);
  return res.data;
}

/* --------------------------------------------------------------------------
 * Reports
 * ------------------------------------------------------------------------ */

export async function dashboardReport(month: string): Promise<ReportsDashboardResponse> {
  const res = await api.get<ReportsDashboardResponse>('/api/reports/dashboard', { params: { month } });
  return res.data;
}

export async function annualReport(year: number): Promise<AnnualReportResponse> {
  const res = await api.get<AnnualReportResponse>('/api/reports/annual', { params: { year } });
  return res.data;
}

export async function charityReport(year: number): Promise<CharityReportResponse> {
  const res = await api.get<CharityReportResponse>('/api/reports/charity', { params: { year } });
  return res.data;
}

export async function othersReport(year: number): Promise<OthersReportResponse> {
  const res = await api.get<OthersReportResponse>('/api/reports/others', { params: { year } });
  return res.data;
}

/* --------------------------------------------------------------------------
 * Auth helpers
 * ------------------------------------------------------------------------ */

/** Read the stored token without making a request. */
export async function getStoredToken(): Promise<string | null> {
  return getAccessToken();
}

/** The shape of a backend validation error, usable for inline UI feedback. */
export type { ApiFieldErrors };

/** Re-export the Axios instance for callers that need raw access. */
export { api };

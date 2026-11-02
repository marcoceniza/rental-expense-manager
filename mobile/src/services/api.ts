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
  const res = await api.post<LoginResponse>('/api/v1/register', input);
  await setAccessToken(res.data.token);
  return res.data;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/v1/login', input);
  await setAccessToken(res.data.token);
  return res.data;
}

export async function logout(): Promise<LogoutResponse> {
  const res = await api.post('/api/v1/logout');
  await clearAccessToken();
  return res.data;
}

export async function me(): Promise<MeResponse> {
  return (await api.get<MeResponse>('/api/v1/me')).data;
}

export async function updateProfile(input: {
  name?: string;
  email?: string;
}): Promise<UpdateProfileResponse> {
  return (await api.patch<UpdateProfileResponse>('/api/v1/me', input)).data;
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
  return (await api.get<TransactionsListResponse>('/api/v1/transactions', { params })).data;
}

export async function createTransaction(input: TransactionInput): Promise<TransactionsResponse> {
  return (await api.post<TransactionsResponse>('/api/v1/transactions', input)).data;
}

export async function updateTransaction(id: number, input: TransactionUpdateInput): Promise<TransactionsResponse> {
  return (await api.patch<TransactionsResponse>(`/api/v1/transactions/${id}`, input)).data;
}

export async function deleteTransaction(id: number): Promise<DeleteResponse> {
  return (await api.delete<DeleteResponse>(`/api/v1/transactions/${id}`)).data;
}

export async function restoreTransaction(id: number): Promise<RestoreResponse> {
  return (await api.patch<RestoreResponse>(`/api/v1/transactions/${id}/restore`)).data;
}

export async function forceDeleteTransaction(id: number): Promise<ForceDeleteResponse> {
  return (await api.delete<ForceDeleteResponse>(`/api/v1/transactions/${id}/force-delete`)).data;
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
  return (await api.get<CategoriesListResponse>('/api/v1/categories')).data;
}

export async function createCategory(input: CategoryInput): Promise<CategoriesListResponse> {
  return (await api.post<CategoriesListResponse>('/api/v1/categories', input)).data;
}

export async function updateCategory(
  id: number,
  input: CategoryInput,
): Promise<CategoriesListResponse> {
  return (await api.patch<CategoriesListResponse>(`/api/v1/categories/${id}`, input)).data;
}

export async function deleteCategory(id: number): Promise<DeleteResponse> {
  return (await api.delete<DeleteResponse>(`/api/v1/categories/${id}`)).data;
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
  return (await api.get<RecurringListResponse>('/api/v1/recurring')).data;
}

export async function createRecurring(input: RecurringInput): Promise<RecurringListResponse> {
  return (await api.post<RecurringListResponse>('/api/v1/recurring', input)).data;
}

export async function updateRecurring(
  id: number,
  input: RecurringInput,
): Promise<RecurringListResponse> {
  return (await api.patch<RecurringListResponse>(`/api/v1/recurring/${id}`, input)).data;
}

export async function deleteRecurring(id: number): Promise<DeleteResponse> {
  return (await api.delete<DeleteResponse>(`/api/v1/recurring/${id}`)).data;
}

/* --------------------------------------------------------------------------
 * Reports
 * ------------------------------------------------------------------------ */

export async function dashboardReport(month: string): Promise<ReportsDashboardResponse> {
  return (await api.get<ReportsDashboardResponse>('/api/v1/reports/dashboard', { params: { month } })).data;
}

export async function annualReport(year: number): Promise<AnnualReportResponse> {
  return (await api.get<AnnualReportResponse>('/api/v1/reports/annual', { params: { year } })).data;
}

export async function charityReport(year: number): Promise<CharityReportResponse> {
  return (await api.get<CharityReportResponse>('/api/v1/reports/charity', { params: { year } })).data;
}

export async function othersReport(year: number): Promise<OthersReportResponse> {
  return (await api.get<OthersReportResponse>('/api/v1/reports/others', { params: { year } })).data;
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

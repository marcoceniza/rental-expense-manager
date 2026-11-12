import { api, clearAccessToken, setAccessToken } from './axios';
import type {
  ApiAnnualReport,
  ApiCategory,
  ApiCollection,
  ApiCategorySummary,
  ApiLog,
  ApiRecurring,
  ApiReportTransactionCollection,
  ApiTransaction,
  ApiTransactionType,
  ApiUserAccount,
  LoginResponse,
  LogoutResponse,
  MeResponse,
} from './types';

interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/api/v1/login', input);
  await setAccessToken(response.data.token);
  return response.data;
}

export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await api.post<LogoutResponse>('/api/v1/logout');
    return response.data;
  } finally {
    await clearAccessToken();
  }
}

export async function me(): Promise<MeResponse> {
  return (await api.get<MeResponse>('/api/v1/me')).data;
}

async function getAllPages<T>(url: string): Promise<T[]> {
  const { data: firstPage } = await api.get<ApiCollection<T>>(url);
  const results = [...firstPage.data];

  if (firstPage.meta.last_page <= 1) return results;

  const pagePromises = [];
  for (let page = 2; page <= firstPage.meta.last_page; page += 1) {
    pagePromises.push(api.get<ApiCollection<T>>(url, { params: { page } }));
  }

  const responses = await Promise.all(pagePromises);
  responses.forEach(res => {
    results.push(...res.data.data);
  });

  return results;
}

async function getReportPages(url: string): Promise<ApiTransaction[]> {
  const { data: firstPage } = await api.get<ApiReportTransactionCollection>(url);
  const results = [...firstPage.transactions];

  if (firstPage.meta.last_page <= 1) return results;

  const pagePromises = [];
  for (let page = 2; page <= firstPage.meta.last_page; page += 1) {
    pagePromises.push(api.get<ApiReportTransactionCollection>(url, { params: { page } }));
  }

  const responses = await Promise.all(pagePromises);
  responses.forEach(res => {
    results.push(...res.data.transactions);
  });

  return results;
}

export async function getCategories(): Promise<ApiCategory[]> {
  return (await api.get<{ data: ApiCategory[] }>('/api/v1/categories')).data.data;
}

export async function getPaginatedTransactions(page: number = 1): Promise<{
  data: ApiTransaction[];
  last_page: number;
}> {
  const res = await api.get<ApiCollection<ApiTransaction>>(
    '/api/v1/transactions',
    { params: { page } },
  );
  return { data: res.data.data, last_page: res.data.meta.last_page };
}

export function getTransactions(): Promise<ApiTransaction[]> {
  return getAllPages<ApiTransaction>('/api/v1/transactions');
}

export function getTrashedTransactions(): Promise<ApiTransaction[]> {
  return getAllPages<ApiTransaction>('/api/v1/transactions/trash');
}

export async function restoreTransaction(id: string): Promise<ApiTransaction> {
  return (await api.patch<{ data: ApiTransaction }>(`/api/v1/transactions/${id}/restore`)).data.data;
}

export async function permanentlyDeleteTransaction(id: string): Promise<void> {
  await api.delete(`/api/v1/transactions/${id}/force-delete`);
}

export function getCharityTransactions(year: number): Promise<ApiTransaction[]> {
  return getReportPages(`/api/v1/reports/charity?year=${year}`);
}

export function getOtherTransactions(year: number): Promise<ApiTransaction[]> {
  return getReportPages(`/api/v1/reports/others?year=${year}`);
}

export async function getRecurringTransactions(): Promise<ApiRecurring[]> {
  return (await api.get<{ data: ApiRecurring[] }>('/api/v1/recurring')).data.data;
}

export async function getUsers(): Promise<ApiUserAccount[]> {
  return (await api.get<{ data: ApiUserAccount[] }>('/api/v1/users')).data.data;
}

export async function getActivityLogs(): Promise<ApiLog[]> {
  return getAllPages<ApiLog>('/api/v1/logs');
}

export async function getAnnualReport(year: number): Promise<ApiAnnualReport> {
  return (await api.get<ApiAnnualReport>('/api/v1/reports/annual', { params: { year } })).data;
}

export async function getCategorySummary(year: number): Promise<ApiCategorySummary> {
  return (await api.get<ApiCategorySummary>('/api/v1/reports/category-summary', { params: { year } })).data;
}

export async function createTransaction(input: {
  category_id: number;
  type: ApiTransactionType;
  amount: number;
  transaction_date: string;
  description: string;
  remarks?: string;
}): Promise<ApiTransaction> {
  return (await api.post<{ data: ApiTransaction }>('/api/v1/transactions', input)).data.data;
}

export async function updateTransaction(
  id: string,
  input: {
    category_id: number;
    type: ApiTransactionType;
    amount: number;
    transaction_date: string;
    description: string;
    remarks?: string;
  },
): Promise<ApiTransaction> {
  return (await api.patch<{ data: ApiTransaction }>(`/api/v1/transactions/${id}`, input)).data.data;
}

export async function createCategory(input: {
  name: string;
  type: ApiTransactionType;
  is_tuition: boolean;
  is_other: boolean;
}): Promise<ApiCategory> {
  return (await api.post<{ data: ApiCategory }>('/api/v1/categories', input)).data.data;
}

export async function updateCategory(
  id: string,
  input: {
    name: string;
    type: ApiTransactionType;
    is_tuition: boolean;
    is_other: boolean;
  },
): Promise<ApiCategory> {
  return (await api.patch<{ data: ApiCategory }>(`/api/v1/categories/${id}`, input)).data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/api/v1/categories/${id}`);
}

export async function createRecurring(input: {
  category_id: number;
  amount: number;
  frequency: 'monthly';
  start_date: string;
  description: string;
}): Promise<ApiRecurring> {
  return (await api.post<{ data: ApiRecurring }>('/api/v1/recurring', input)).data.data;
}

export async function updateRecurring(
  id: string,
  input: {
    category_id: number;
    amount: number;
    frequency: 'monthly';
    start_date: string;
    description: string;
  },
): Promise<ApiRecurring> {
  return (await api.patch<{ data: ApiRecurring }>(`/api/v1/recurring/${id}`, input)).data.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/api/v1/transactions/${id}`);
}

export async function deleteRecurring(id: string): Promise<void> {
  await api.delete(`/api/v1/recurring/${id}`);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<ApiUserAccount> {
  return (await api.post<{ data: ApiUserAccount }>('/api/v1/users', input)).data.data;
}

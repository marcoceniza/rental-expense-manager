/*

// ─── USER ROUTES ────────────────────────────────────────────────────────────

// User dashboard
export const userDashboard = (options?: RouteQueryOptions): RouteDefinition => ({
    url: userDashboard.url(options),
    method: 'get',
});

userDashboard.definition = {
    methods: ['get', 'head'],
    url: '/user/dashboard',
} as const;

userDashboard.url = (options?: RouteQueryOptions) =>
    userDashboard.definition.url + queryParams(options);

userDashboard.get = (options?: RouteQueryOptions): RouteDefinition => ({
    url: userDashboard.url(options),
    method: 'get',
});

userDashboard.head = (options?: RouteQueryOptions): RouteDefinition => ({
    url: userDashboard.url(options),
    method: 'head',
});

// ─── ADMIN ROUTES ───────────────────────────────────────────────────────────

// Admin dashboard
adminDashboard.definition = {
    methods: ['get', 'head'],
    url: '/admin/dashboard',
} as const;

adminDashboard.url = (options?: RouteQueryOptions) =>
    adminDashboard.definition.url + queryParams(options);

adminDashboard.get = (options?: RouteQueryOptions): RouteDefinition => ({
    url: adminDashboard.url(options),
    method: 'get',
});

adminDashboard.head = (options?: RouteQueryOptions): RouteDefinition => ({
    url: adminDashboard.url(options),
    method: 'head',
});

// ─── LOGOUT ─────────────────────────────────────────────────────────────────

export const logout = (options?: RouteQueryOptions): RouteDefinition => ({
    url: logout.url(options),
    method: 'post',
});

logout.definition = {
    methods: ['post'],
    url: '/logout',
} as const;

logout.url = (options?: RouteQueryOptions) =>
    logout.definition.url + queryParams(options);

// ─── LOGIN ──────────────────────────────────────────────────────────────────

export const login = (options?: RouteQueryOptions): RouteDefinition => ({
    url: login.url(options),
    method: 'get',
});

login.definition = {
    methods: ['get', 'head'],
    url: '/login',
} as const;

login.url = (options?: RouteQueryOptions) =>
    login.definition.url + queryParams(options);

// ─── REGISTER ───────────────────────────────────────────────────────────────

export const register = (options?: RouteQueryOptions): RouteDefinition => ({
    url: register.url(options),
    method: 'get',
});

register.definition = {
    methods: ['get', 'head'],
    url: '/register',
} as const;

register.url = (options?: RouteQueryOptions) =>
    register.definition.url + queryParams(options);

// ─── PASSWORD CONFIRM ───────────────────────────────────────────────────────

export const passwordConfirm = (options?: RouteQueryOptions): RouteDefinition => ({
    url: passwordConfirm.url(options),
    method: 'post',
});

passwordConfirm.definition = {
    methods: ['post'],
    url: '/password/confirm',
} as const;

passwordConfirm.url = (options?: RouteQueryOptions) =>
    passwordConfirm.definition.url + queryParams(options);

// ─── PASSWORD EMAIL ────────────────────────────────────────────────────────

export const passwordEmail = (options?: RouteQueryOptions): RouteDefinition => ({
    url: passwordEmail.url(options),
    method: 'post',
});

passwordEmail.definition = {
    methods: ['post'],
    url: '/forgot-password',
} as const;

passwordEmail.url = (options?: RouteQueryOptions) =>
    passwordEmail.definition.url + queryParams(options);

// ─── PASSWORD STORE ─────────────────────────────────────────────────────────

export const passwordStore = (options?: RouteQueryOptions): RouteDefinition => ({
    url: passwordStore.url(options),
    method: 'post',
});

passwordStore.definition = {
    methods: ['post'],
    url: '/reset-password',
} as const;

passwordStore.url = (options?: RouteQueryOptions) =>
    passwordStore.definition.url + queryParams(options);

// ─── VERIFICATION SEND ──────────────────────────────────────────────────────

export const verificationSend = (options?: RouteQueryOptions): RouteDefinition => ({
    url: verificationSend.url(options),
    method: 'post',
});

verificationSend.definition = {
    methods: ['post'],
    url: '/email/verification-notification',
} as const;

verificationSend.url = (options?: RouteQueryOptions) =>
    verificationSend.definition.url + queryParams(options);

// ─── ADMIN ROUTES (imported from route modules) ─────────────────────────────

import categories from '@/routes/admin/categories';
import transactions from '@/routes/admin/transactions';
import recurring from '@/routes/admin/recurring';
import logs from '@/routes/admin/logs';

// ─── ROUTE HELPER ───────────────────────────────────────────────────────────

function route(name: string, params?: Record<string, unknown>): string {
    const routeMap: Record<string, string> = {
        'dashboard': '/user/dashboard',
        'user.dashboard': '/user/dashboard',
        'transactions.user': '/user/transactions/user',
        'reports': '/user/reports',
        'charity': '/user/charity',
        'admin.dashboard': '/admin',
        'admin.transactions.index': '/admin/transactions',
        'admin.transactions.store': '/admin/transactions',
        'admin.transactions.update': '/admin/transactions/{id}',
        'admin.transactions.destroy': '/admin/transactions/{id}',
        'admin.transactions.restore': '/admin/transactions/{id}/restore',
        'admin.transactions.force-delete': '/admin/transactions/{id}/force-delete',
        'admin.recurring.index': '/admin/recurring',
        'admin.recurring.store': '/admin/recurring',
        'admin.recurring.update': '/admin/recurring/{id}',
        'admin.recurring.destroy': '/admin/recurring/{id}',
        'admin.categories.index': '/admin/categories',
        'admin.categories.store': '/admin/categories',
        'admin.categories.update': '/admin/categories/{id}',
        'admin.categories.destroy': '/admin/categories/{id}',
        'admin.categories.restore': '/admin/categories/{id}/restore',
        'admin.categories.force-delete': '/admin/categories/{id}/force-delete',
        'admin.charity': '/admin/charity',
        'admin.others': '/admin/others',
        'admin.reports': '/admin/reports',
        'admin.logs': '/admin/logs',
        'login': '/login',
        'register': '/register',
        'password.confirm': '/password/confirm',
        'password.email': '/forgot-password',
        'password.store': '/reset-password',
        'verification.send': '/email/verification-notification',
    };

    const url = routeMap[name] ?? '#';

    if (params) {
        const paramsStr = new URLSearchParams(
            Object.entries(params).map(([key, value]) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
            )
        ).toString();

        return url + (url.includes('?') ? '&' : '?') + paramsStr;
    }

    return url;
}

// ─── ADMIN ROUTE DECLARATIONS ───────────────────────────────────────────────

declare const adminDashboard: RouteDefinition;
declare const adminCharity: RouteDefinition;
declare const adminOthers: RouteDefinition;
declare const adminReports: RouteDefinition;

// ─── EXPORTS ────────────────────────────────────────────────────────────────

*/

export * from './routes/index';

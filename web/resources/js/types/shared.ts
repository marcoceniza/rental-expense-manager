import type { PageProps } from '@inertiajs/core';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    user_type?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Auth {
    user: User;
}

export type FlashProps = {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
};

export interface SharedData extends PageProps {
    name: string;
    quote: {
        message: string;
        author: string;
    };
    auth: Auth;
    flash: FlashProps;
}

export interface NavItem {
    title: string;
    href: string;
    isActive?: boolean;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export type BreadcrumbItemType = BreadcrumbItem;

declare module '@inertiajs/core' {
    interface PageProps {
        flash: FlashProps;
    }
}

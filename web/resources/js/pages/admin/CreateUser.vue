<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { store } from '@/routes/admin/create-user';
import { Head, useForm } from '@inertiajs/vue3';
import { LoaderCircle, UserPlus } from 'lucide-vue-next';

defineOptions({
    layout: AppLayout,
});

const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
});

const submit = () => {
    form.submit(store(), {
        preserveScroll: true,
    });
};
</script>

<template>
    <Head title="Create User" />

    <div class="mx-auto max-w-2xl space-y-6">
        <div>
            <h1
                class="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900"
            >
                <UserPlus class="h-8 w-8" />
                Create User
            </h1>
            <p class="mt-2 text-slate-500">
                Create a standard user account. Authentication remains managed
                by Fortify.
            </p>
        </div>

        <form
            @submit.prevent="submit"
            class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
            <div class="space-y-2">
                <label for="name" class="text-sm font-medium text-slate-700"
                    >Name</label
                >
                <input
                    id="name"
                    v-model="form.name"
                    name="name"
                    autocomplete="name"
                    required
                    class="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <p v-if="form.errors.name" class="text-sm text-red-600">
                    {{ form.errors.name }}
                </p>
            </div>

            <div class="space-y-2">
                <label for="email" class="text-sm font-medium text-slate-700"
                    >Email</label
                >
                <input
                    id="email"
                    v-model="form.email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required
                    class="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <p v-if="form.errors.email" class="text-sm text-red-600">
                    {{ form.errors.email }}
                </p>
            </div>

            <div class="space-y-2">
                <label for="password" class="text-sm font-medium text-slate-700"
                    >Password</label
                >
                <input
                    id="password"
                    v-model="form.password"
                    name="password"
                    type="password"
                    autocomplete="new-password"
                    required
                    class="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <p v-if="form.errors.password" class="text-sm text-red-600">
                    {{ form.errors.password }}
                </p>
            </div>

            <div class="space-y-2">
                <label
                    for="password_confirmation"
                    class="text-sm font-medium text-slate-700"
                    >Confirm password</label
                >
                <input
                    id="password_confirmation"
                    v-model="form.password_confirmation"
                    name="password_confirmation"
                    type="password"
                    autocomplete="new-password"
                    required
                    class="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
            </div>

            <button
                type="submit"
                :disabled="form.processing"
                class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
                <LoaderCircle
                    v-if="form.processing"
                    class="h-4 w-4 animate-spin"
                />
                {{ form.processing ? 'Creating…' : 'Create user' }}
            </button>
        </form>
    </div>
</template>

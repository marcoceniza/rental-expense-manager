<script setup lang="ts">
import Button from '@/ui/button.vue';
import type { RecurringCategoryOption } from '@/types';
import { X } from 'lucide-vue-next';
import { computed } from 'vue';

interface FormData {
    category_id: number | string;
    description: string;
    amount: number;
    frequency: string;
    start_date: string;
}

interface Props {
    isOpen: boolean;
    editingId?: number | null;
    formData: FormData;
    categories: RecurringCategoryOption[];
    loading?: boolean;
    errors?: Record<string, string[]>;
}

const props = defineProps<Props>();

const selectedCategory = computed(() => {
    return props.categories.find(
        (category) => category.id === props.formData.category_id,
    );
});

const descriptionOptions = computed(() => {
    return selectedCategory.value?.transaction_descriptions ?? [];
});

const emit = defineEmits<{
    'update:isOpen': [value: boolean];
    submit: [];
    close: [];
}>();

const close = () => {
    emit('update:isOpen', false);
    emit('close');
};

const handleSubmit = () => emit('submit');
</script>

<template>
    <Transition name="fade">
        <div
            v-if="isOpen"
            class="fixed inset-0 top-[-32px] z-50 flex min-h-screen items-start justify-center overflow-y-auto bg-slate-900/50 px-4 py-10 backdrop-blur-sm sm:items-center sm:p-4"
        >
            <Transition name="scale">
                <div
                    v-if="isOpen"
                    class="animate-in fade-in zoom-in w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl duration-200"
                >
                    <div
                        class="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6"
                    >
                        <h3 class="text-xl font-bold text-slate-900">
                            {{
                                editingId
                                    ? 'Edit Recurring Entry'
                                    : 'New Recurring Entry'
                            }}
                        </h3>

                        <button
                            @click="close"
                            class="inline-flex cursor-pointer items-center justify-center rounded-lg p-2 transition-colors hover:bg-white"
                        >
                            <X class="h-5 w-5 text-slate-400" />
                        </button>
                    </div>

                    <form @submit.prevent="handleSubmit" class="space-y-4 p-6">
                        <div class="space-y-1.5">
                            <label
                                class="text-xs font-bold text-slate-500 uppercase"
                                >Category</label
                            >
                            <select
                                v-model="formData.category_id"
                                required
                                :class="[
                                    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 transition-all',
                                    errors?.category_id?.length
                                        ? 'ring-2 ring-red-500'
                                        : 'focus:ring-blue-500',
                                ]"
                            >
                                <option value="" disabled>
                                    Select a category
                                </option>
                                <option
                                    v-for="c in categories"
                                    :key="c.id"
                                    :value="c.id"
                                >
                                    {{ c.name }} ({{ c.type }})
                                </option>
                            </select>
                            <p
                                v-if="errors?.category_id?.length"
                                class="text-xs text-red-500"
                            >
                                {{ errors.category_id[0] }}
                            </p>
                        </div>

                        <div class="space-y-1.5">
                            <label
                                class="text-xs font-bold text-slate-500 uppercase"
                                >Description</label
                            >

                            <template v-if="descriptionOptions.length">
                                <select
                                    v-model="formData.description"
                                    required
                                    :class="[
                                        'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 transition-all',
                                        errors?.description?.length
                                            ? 'ring-2 ring-red-500'
                                            : 'focus:ring-blue-500',
                                    ]"
                                >
                                    <option value="" disabled>
                                        Select a saved description
                                    </option>
                                    <option
                                        v-for="option in descriptionOptions"
                                        :key="option.description"
                                        :value="option.description"
                                    >
                                        {{ option.description }}
                                    </option>
                                </select>
                            </template>

                            <template v-else>
                                <input
                                    v-model="formData.description"
                                    type="text"
                                    required
                                    placeholder="e.g., Monthly Rent"
                                    :class="[
                                        'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 transition-all focus:ring-2',
                                        errors?.description?.length
                                            ? 'ring-2 ring-red-500'
                                            : 'focus:ring-blue-500',
                                    ]"
                                />
                            </template>

                            <p
                                v-if="errors?.description?.length"
                                class="text-xs text-red-500"
                            >
                                {{ errors.description[0] }}
                            </p>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label
                                    class="text-xs font-bold text-slate-500 uppercase"
                                    >Amount (PHP)</label
                                >
                                <input
                                    v-model.number="formData.amount"
                                    type="number"
                                    required
                                    :class="[
                                        'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg font-bold text-slate-900 transition-all',
                                        errors?.amount?.length
                                            ? 'ring-2 ring-red-500'
                                            : 'focus:ring-blue-500',
                                    ]"
                                />
                                <p
                                    v-if="errors?.amount?.length"
                                    class="text-xs text-red-500"
                                >
                                    {{ errors.amount[0] }}
                                </p>
                            </div>

                            <div class="space-y-1.5">
                                <label
                                    class="text-xs font-bold text-slate-500 uppercase"
                                    >Frequency</label
                                >
                                <select
                                    v-model="formData.frequency"
                                    disabled
                                    class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 font-medium text-slate-900"
                                >
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label
                                class="text-xs font-bold text-slate-500 uppercase"
                                >Start Date</label
                            >
                            <input
                                v-model="formData.start_date"
                                type="date"
                                required
                                :class="[
                                    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 transition-all',
                                    errors?.start_date?.length
                                        ? 'ring-2 ring-red-500'
                                        : 'focus:ring-blue-500',
                                ]"
                            />
                            <p
                                v-if="errors?.start_date?.length"
                                class="text-xs text-red-500"
                            >
                                {{ errors.start_date[0] }}
                            </p>
                        </div>

                        <div class="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                full-width
                                @click="close"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                variant="primary"
                                full-width
                                :loading="loading"
                            >
                                {{
                                    loading
                                        ? editingId
                                            ? 'Updating...'
                                            : 'Saving...'
                                        : editingId
                                          ? 'Update'
                                          : 'Save Recurring'
                                }}
                            </Button>
                        </div>
                    </form>
                </div>
            </Transition>
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.scale-enter-active {
    transition:
        transform 0.2s ease,
        opacity 0.2s ease;
}

.scale-enter-from {
    transform: scale(0.9);
    opacity: 0;
}

.scale-leave-to {
    transform: scale(0.9);
    opacity: 0;
}
</style>

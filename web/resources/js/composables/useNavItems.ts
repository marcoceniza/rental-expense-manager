import { SharedData } from '@/types';
import { usePage } from '@inertiajs/vue3';
import {
    FileChartPie,
    FileText,
    Heart,
    LayoutDashboard,
    LayoutGrid,
    ReceiptText,
    Repeat,
    Tag,
    UserPlus,
} from 'lucide-vue-next';
import { computed } from 'vue';
import {
    dashboard as adminDashboard,
    charity as adminCharity,
    logs as adminLogs,
    others as adminOthers,
    createUser as adminCreateUser,
    reports as adminReports,
} from '@/routes/admin';
import { index as adminCategoriesIndex } from '@/routes/admin/categories';
import { index as adminRecurringIndex } from '@/routes/admin/recurring';
import { index as adminTransactionsIndex } from '@/routes/admin/transactions';
import {
    charity as userCharity,
    dashboard as userDashboard,
    reports as userReports,
    transactions as userTransactions,
} from '@/routes/user';

export function useNavItems() {
    const page = usePage<SharedData>();

    const navItems = computed(() => {
        const user = page.props.auth?.user;
        const isAdmin = user?.user_type === 'admin';

        const userItems = [
            {
                name: 'Dashboard',
                path: userDashboard.url(),
                icon: LayoutDashboard,
            },
            {
                name: 'Transactions',
                path: userTransactions.url(),
                icon: ReceiptText,
            },
            { name: 'Reports', path: userReports.url(), icon: FileChartPie },
            { name: 'Charity', path: userCharity.url(), icon: Heart },
        ];

        const adminItems = [
            {
                name: 'Dashboard',
                path: adminDashboard.url(),
                icon: LayoutDashboard,
            },
            {
                name: 'Transactions',
                path: adminTransactionsIndex.url(),
                icon: ReceiptText,
            },
            { name: 'Reports', path: adminReports.url(), icon: FileChartPie },
            { name: 'Charity', path: adminCharity.url(), icon: Heart },
            {
                name: 'Recurring',
                path: adminRecurringIndex.url(),
                icon: Repeat,
            },
            { name: 'Categories', path: adminCategoriesIndex.url(), icon: Tag },
            { name: 'Others', path: adminOthers.url(), icon: LayoutGrid },
            {
                name: 'Create User',
                path: adminCreateUser.url(),
                icon: UserPlus,
            },
            { name: 'Activity Logs', path: adminLogs.url(), icon: FileText },
        ];

        return isAdmin ? adminItems : userItems;
    });

    return { navItems };
}

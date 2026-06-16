import { Head } from '@inertiajs/react';
import { BarChart3, ShoppingBag, Store, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

export default function DashboardIndex() {
    return (
        <>
            <Head title="Dashboard — OutletKu" />
            <div className="flex flex-col gap-6 p-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Ringkasan bisnis kamu hari ini
                    </p>
                </div>

                {/* Stat Cards — akan diisi dari DashboardService di Sprint 2-3 */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Omzet Hari Ini"
                        value="Rp 0"
                        subtitle="Belum ada transaksi"
                        icon={<BarChart3 className="w-5 h-5" />}
                        color="indigo"
                    />
                    <StatCard
                        title="Transaksi"
                        value="0"
                        subtitle="Transaksi valid hari ini"
                        icon={<ShoppingBag className="w-5 h-5" />}
                        color="emerald"
                    />
                    <StatCard
                        title="Outlet Aktif"
                        value="–"
                        subtitle="Outlet dengan status aktif"
                        icon={<Store className="w-5 h-5" />}
                        color="amber"
                    />
                    <StatCard
                        title="Stok Kritis"
                        value="0"
                        subtitle="Produk di bawah batas minimum"
                        icon={<Users className="w-5 h-5" />}
                        color="red"
                    />
                </div>

                {/* Empty state info */}
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
                    <Store className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Dashboard sedang disiapkan</h3>
                    <p className="text-xs text-gray-400">
                        Data statistik akan muncul setelah kamu menambahkan outlet, produk, dan transaksi.
                    </p>
                </div>
            </div>
        </>
    );
}

DashboardIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
        {page}
    </AppLayout>
);

// --- Sub-components ---

type StatCardProps = {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color: 'indigo' | 'emerald' | 'amber' | 'red';
};

const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
};

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{title}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            </div>
        </div>
    );
}

import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, BarChart3, ShoppingBag, Store } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { index as stocksIndex } from '@/actions/App/Http/Controllers/Stock/StockController';

type LowStockAlert = {
    id: string;
    outlet_id: string;
    product_id: string;
    quantity: number;
    low_stock_threshold: number;
    outlet: { id: string; name: string };
    product: { id: string; name: string; sku: string | null; unit: string };
};

type Props = {
    todayRevenue: number;
    todayTransactions: number;
    activeOutlets: number;
    lowStockAlerts: LowStockAlert[];
};

export default function DashboardIndex({
    todayRevenue,
    todayTransactions,
    activeOutlets,
    lowStockAlerts,
}: Props) {
    const hasLowStock = lowStockAlerts.length > 0;

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

                {/* Low Stock Banner */}
                {hasLowStock && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-amber-800">
                                {lowStockAlerts.length} produk stok menipis
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                {lowStockAlerts.slice(0, 3).map((s) => s.product.name).join(', ')}
                                {lowStockAlerts.length > 3 && ` dan ${lowStockAlerts.length - 3} lainnya`}
                            </p>
                        </div>
                        <Link
                            href={stocksIndex.url()}
                            className="shrink-0 text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
                        >
                            Lihat semua
                        </Link>
                    </div>
                )}

                {/* Stat Cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Omzet Hari Ini"
                        value={`Rp ${todayRevenue.toLocaleString('id-ID')}`}
                        subtitle={todayRevenue === 0 ? 'Belum ada transaksi' : 'Total penjualan valid'}
                        icon={<BarChart3 className="w-5 h-5" />}
                        color="indigo"
                    />
                    <StatCard
                        title="Transaksi"
                        value={todayTransactions.toString()}
                        subtitle="Transaksi valid hari ini"
                        icon={<ShoppingBag className="w-5 h-5" />}
                        color="emerald"
                    />
                    <StatCard
                        title="Outlet Aktif"
                        value={activeOutlets.toString()}
                        subtitle="Outlet dengan status aktif"
                        icon={<Store className="w-5 h-5" />}
                        color="amber"
                    />
                    <StatCard
                        title="Stok Kritis"
                        value={lowStockAlerts.length.toString()}
                        subtitle="Produk di bawah batas minimum"
                        icon={<AlertTriangle className="w-5 h-5" />}
                        color={lowStockAlerts.length > 0 ? 'red' : 'gray'}
                    />
                </div>

                {/* Low Stock Detail Table */}
                {hasLowStock ? (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-800">Produk Stok Menipis</h2>
                            <Link
                                href={stocksIndex.url()}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Lihat semua stok →
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {lowStockAlerts.slice(0, 8).map((alert) => (
                                <div key={alert.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {alert.product.name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {alert.outlet.name}
                                            {alert.product.sku && ` · SKU: ${alert.product.sku}`}
                                        </p>
                                    </div>
                                    <div className="ml-4 text-right shrink-0">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 ring-inset">
                                            {alert.quantity} {alert.product.unit}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-0.5">min. {alert.low_stock_threshold}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
                        <Store className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">Semua stok aman</h3>
                        <p className="text-xs text-gray-400">
                            Tidak ada produk yang stoknya di bawah batas minimum.
                        </p>
                    </div>
                )}
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
    color: 'indigo' | 'emerald' | 'amber' | 'red' | 'gray';
};

const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    red:     'bg-red-50 text-red-600',
    gray:    'bg-gray-100 text-gray-500',
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

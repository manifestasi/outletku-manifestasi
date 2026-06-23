import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    BarChart3,
    Clock,
    DollarSign,
    Package,
    Receipt,
    ShoppingBag,
    Store,
    TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { dashboard } from '@/routes';
import type { Auth } from '@/types/auth';

interface DayRevenue { date: string; revenue: number; count: number }
interface Transaction { id: string; invoice_number: string; transaction_date: string; outlet: { name: string } | null; user: { name: string } | null; total: number; payment_method: string }
interface TopProduct { id: string; product_name: string; total_qty: number; total_revenue: number }
interface OutletRow { id: string; name: string; todayRevenue: number; todayTransactions: number; openShifts: number }
interface LowStock { id: string; quantity: number; low_stock_threshold: number; outlet: { name: string } | null; product: { name: string; sku: string | null; unit: string | null } | null }

interface Props {
    todayRevenue: number;
    todayTransactions: number;
    activeOutlets: number;
    todayExpense: number;
    todayNetCash: number;
    lowStockCount: number;
    revenueChart: DayRevenue[];
    recentTrx: Transaction[];
    topProducts: TopProduct[];
    outletSummary: OutletRow[];
    lowStockAlerts: LowStock[];
}

const PAYMENT_LABEL: Record<string, string> = { cash: 'Tunai', transfer: 'Transfer', other: 'Lainnya' };

export default function Dashboard({
    todayRevenue, todayTransactions, activeOutlets, todayExpense, todayNetCash, lowStockCount,
    revenueChart, recentTrx, topProducts, outletSummary, lowStockAlerts,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const roles     = (auth.user.roles ?? []).map(r => r.name);
    const isOM      = roles.includes('owner') || roles.includes('manager');

    const fmt = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    const maxRevenue = Math.max(...revenueChart.map(d => d.revenue), 1);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Selamat datang, {auth.user.name} — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                {/* Low Stock Banner */}
                {lowStockCount > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        <span>
                            <strong>{lowStockCount} produk</strong> memiliki stok di bawah batas minimum.{' '}
                            <Link href="/reports/stock" className="underline font-medium">Lihat laporan stok →</Link>
                        </span>
                    </div>
                )}

                {/* Widget Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Omzet Hari Ini', value: fmt(todayRevenue), icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Transaksi', value: todayTransactions.toString(), icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Outlet Aktif', value: activeOutlets.toString(), icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Pengeluaran', value: fmt(todayExpense), icon: ArrowDown, color: 'text-red-500', bg: 'bg-red-50' },
                        { label: 'Kas Bersih', value: fmt(todayNetCash), icon: DollarSign, color: todayNetCash >= 0 ? 'text-emerald-600' : 'text-red-600', bg: todayNetCash >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
                        { label: 'Stok Rendah', value: lowStockCount.toString(), icon: AlertTriangle, color: lowStockCount > 0 ? 'text-amber-600' : 'text-gray-400', bg: lowStockCount > 0 ? 'bg-amber-50' : 'bg-gray-50' },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 leading-tight">{card.label}</span>
                                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                                    <card.icon className={`w-4 h-4 ${card.color}`} />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-gray-900 leading-none">{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Revenue Chart + Top Products */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Chart (7 hari) */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-800">Omzet 7 Hari Terakhir</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Hanya transaksi valid</p>
                            </div>
                            <Link href="/reports/sales" className="text-xs text-indigo-600 hover:underline">Laporan lengkap →</Link>
                        </div>
                        <div className="flex items-end gap-1.5 h-36">
                            {revenueChart.map(d => {
                                const heightPct = Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 4 : 0);
                                const label = new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
                                return (
                                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                                        <div
                                            className="w-full bg-indigo-500 rounded-t transition-all opacity-75 group-hover:opacity-100"
                                            style={{ height: `${heightPct}%` }}
                                        />
                                        <span className="text-[9px] text-gray-400 whitespace-nowrap hidden sm:block">{label}</span>
                                        <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            {fmt(d.revenue)} — {d.count} trx
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-sm font-semibold text-gray-800">Produk Terlaris</h2>
                            <span className="text-xs text-gray-400">Bulan ini</span>
                        </div>
                        {topProducts.length > 0 ? (
                            <div className="space-y-3">
                                {topProducts.map((p, i) => (
                                    <div key={p.id} className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-800 truncate">{p.product_name}</p>
                                            <p className="text-[10px] text-gray-400">{p.total_qty} pcs · {fmt(p.total_revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-6">Belum ada data bulan ini</p>
                        )}
                    </div>
                </div>

                {/* Recent Transactions + Outlet Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Transactions */}
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-800">5 Transaksi Terbaru</h2>
                            {isOM && <Link href="/transactions" className="text-xs text-indigo-600 hover:underline">Lihat semua →</Link>}
                        </div>
                        {recentTrx.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {recentTrx.map(trx => (
                                    <div key={trx.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/60 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                                <Receipt className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <Link href={`/transactions/${trx.id}`} className="text-xs font-semibold text-indigo-600 hover:underline font-mono">
                                                    {trx.invoice_number}
                                                </Link>
                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                    {trx.outlet?.name ?? '-'} · {trx.user?.name ?? '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs font-bold text-gray-900">{fmt(trx.total)}</p>
                                            <Badge className="mt-0.5 bg-gray-100 text-gray-500 border-none shadow-none text-[9px] h-4 px-1.5">
                                                {PAYMENT_LABEL[trx.payment_method] ?? trx.payment_method}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <ShoppingBag className="w-7 h-7 mb-2" />
                                <p className="text-xs">Belum ada transaksi hari ini</p>
                            </div>
                        )}
                    </div>

                    {/* Outlet Summary */}
                    {isOM && outletSummary.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <h2 className="text-sm font-semibold text-gray-800">Ringkasan per Outlet</h2>
                                <span className="text-xs text-gray-400">Hari ini</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {outletSummary.map(outlet => (
                                    <div key={outlet.id} className="flex items-center justify-between px-5 py-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                <Store className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{outlet.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-gray-400">{outlet.todayTransactions} trx</span>
                                                    {outlet.openShifts > 0 && (
                                                        <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                            <Clock className="w-2.5 h-2.5" />{outlet.openShifts} shift buka
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-gray-900 shrink-0">{fmt(outlet.todayRevenue)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Low Stock Alert Table */}
                {isOM && lowStockAlerts.length > 0 && (
                    <div className="bg-white border border-amber-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-amber-100 bg-amber-50/50">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            <h2 className="text-sm font-semibold text-amber-900">Produk Stok Menipis ({lowStockAlerts.length})</h2>
                            <Link href="/reports/stock" className="ml-auto text-xs text-amber-700 hover:underline">Export laporan →</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Produk</th>
                                        <th className="px-5 py-3 font-medium">Outlet</th>
                                        <th className="px-5 py-3 font-medium text-right">Stok</th>
                                        <th className="px-5 py-3 font-medium text-right">Min.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {lowStockAlerts.map(s => (
                                        <tr key={s.id} className="hover:bg-amber-50/30 transition-colors">
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-gray-900">{s.product?.name ?? '–'}</p>
                                                {s.product?.sku && <p className="text-[10px] text-gray-400 font-mono">{s.product.sku}</p>}
                                            </td>
                                            <td className="px-5 py-3 text-gray-600">{s.outlet?.name ?? '–'}</td>
                                            <td className="px-5 py-3 text-right font-bold text-red-600">{s.quantity}</td>
                                            <td className="px-5 py-3 text-right text-gray-400">{s.low_stock_threshold}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: dashboard() }]}>{page}</AppLayout>
);

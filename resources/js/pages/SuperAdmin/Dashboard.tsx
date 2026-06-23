import { Head } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { Activity, Building2, DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Stats {
    totalBusinesses: number;
    activeBusinesses: number;
    totalUsers: number;
    todayTransactions: number;
    todayRevenue: number;
    monthRevenue: number;
    newBusinessesThisMonth: number;
}
interface DayRevenue { date: string; revenue: number; count: number }
interface Business { id: string; name: string; slug: string; is_active: boolean; total_revenue: number; total_trx: number }
interface RecentBusiness { id: string; name: string; slug: string; owner_name: string; is_active: boolean; created_at: string; last_activity_at: string | null }

interface Props {
    stats: Stats;
    revenueChart: DayRevenue[];
    topBusinesses: Business[];
    recentBusinesses: RecentBusiness[];
}

const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function SuperAdminDashboard({ stats, revenueChart, topBusinesses, recentBusinesses }: Props) {
    const maxRevenue = Math.max(...revenueChart.map(d => d.revenue), 1);

    return (
        <>
            <Head title="Super Admin — Dashboard" />
            <div className="p-6 flex flex-col gap-6">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Statistik platform secara keseluruhan</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Bisnis', value: stats.totalBusinesses.toString(), icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', note: `${stats.activeBusinesses} aktif` },
                        { label: 'Total User', value: stats.totalUsers.toString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', note: null },
                        { label: 'Transaksi Hari Ini', value: stats.todayTransactions.toString(), icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50', note: null },
                        { label: 'Omzet Hari Ini', value: fmt(stats.todayRevenue), icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50', note: null },
                        { label: 'Omzet Bulan Ini', value: fmt(stats.monthRevenue), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50', note: null },
                        { label: 'Bisnis Baru Bulan Ini', value: stats.newBusinessesThisMonth.toString(), icon: Activity, color: 'text-pink-500', bg: 'bg-pink-50', note: null },
                    ].map(card => (
                        <div key={card.label} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 leading-tight">{card.label}</span>
                                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                                    <card.icon className={`w-4 h-4 ${card.color}`} />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-gray-900 leading-none">{card.value}</p>
                            {card.note && <p className="text-[10px] text-gray-400">{card.note}</p>}
                        </div>
                    ))}
                </div>

                {/* Revenue Chart 7 Days */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Omzet Platform 7 Hari Terakhir</h2>
                    <div className="flex items-end gap-1.5 h-36">
                        {revenueChart.map(d => {
                            const heightPct = Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 4 : 0);
                            const label = new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
                            return (
                                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div className="w-full bg-indigo-500 rounded-t transition-all opacity-75 group-hover:opacity-100" style={{ height: `${heightPct}%` }} />
                                    <span className="text-[9px] text-gray-400 whitespace-nowrap hidden sm:block">{label}</span>
                                    <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                        {fmt(d.revenue)} — {d.count} trx
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Businesses */}
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-800">Top 5 Bisnis (All Time)</h2>
                            <Link href="/super-admin/tenants" className="text-xs text-indigo-600 hover:underline">Semua →</Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {topBusinesses.map((b, i) => (
                                <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{b.name}</p>
                                        <p className="text-[10px] text-gray-400">{b.total_trx} trx</p>
                                    </div>
                                    <p className="text-xs font-bold text-gray-900 shrink-0">{fmt(b.total_revenue)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Businesses */}
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-800">Bisnis Terbaru</h2>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentBusinesses.map(b => (
                                <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                        <Building2 className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/super-admin/tenants/${b.slug}`} className="text-xs font-semibold text-gray-800 hover:text-indigo-600 truncate block">{b.name}</Link>
                                        <p className="text-[10px] text-gray-400">{b.owner_name}</p>
                                    </div>
                                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${b.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {b.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

SuperAdminDashboard.layout = (page: React.ReactNode) => (
    <SuperAdminLayout breadcrumbs={[{ title: 'Dashboard' }]}>{page}</SuperAdminLayout>
);

import { Head, Link, router } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { Button } from '@/components/ui/button';

interface Day { date: string; trx: number; revenue: number; signups: number }
interface Props { activityChart: Day[]; days: number }

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function AnalyticsIndex({ activityChart, days }: Props) {
    const maxTrx     = Math.max(...activityChart.map(d => d.trx), 1);
    const maxRevenue = Math.max(...activityChart.map(d => d.revenue), 1);

    const totalTrx     = activityChart.reduce((s, d) => s + d.trx, 0);
    const totalRevenue = activityChart.reduce((s, d) => s + d.revenue, 0);
    const totalSignups = activityChart.reduce((s, d) => s + d.signups, 0);

    return (
        <>
            <Head title="Super Admin — Analytics" />
            <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Aktivitas platform harian</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {[7, 14, 30].map(d => (
                            <Button key={d} size="sm" variant={days === d ? 'default' : 'outline'}
                                onClick={() => router.get('/super-admin/analytics', { days: d }, { replace: true })}>
                                {d}H
                            </Button>
                        ))}
                        <Link href="/super-admin/analytics/growth">
                            <Button size="sm" variant="outline">Growth</Button>
                        </Link>
                        <Link href="/super-admin/analytics/activity">
                            <Button size="sm" variant="outline">Per Bisnis</Button>
                        </Link>
                        <Link href="/super-admin/analytics/churn">
                            <Button size="sm" variant="outline">Churn</Button>
                        </Link>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: `Total Transaksi (${days}H)`, value: totalTrx.toLocaleString('id-ID') },
                        { label: `Total Omzet (${days}H)`, value: fmt(totalRevenue) },
                        { label: `Bisnis Baru (${days}H)`, value: totalSignups.toLocaleString('id-ID') },
                    ].map(c => (
                        <div key={c.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <p className="text-xs text-gray-500">{c.label}</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">{c.value}</p>
                        </div>
                    ))}
                </div>

                {/* Transaction chart */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Transaksi Harian</h2>
                    <div className="flex items-end gap-1 h-36">
                        {activityChart.map(d => {
                            const h = Math.max((d.trx / maxTrx) * 100, d.trx > 0 ? 3 : 0);
                            const label = new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
                            return (
                                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div className="w-full bg-emerald-500 rounded-t opacity-75 group-hover:opacity-100" style={{ height: `${h}%` }} />
                                    {activityChart.length <= 14 && <span className="text-[9px] text-gray-400 hidden sm:block">{label}</span>}
                                    <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                                        {label}: {d.trx} trx · {fmt(d.revenue)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Revenue chart */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Omzet Harian</h2>
                    <div className="flex items-end gap-1 h-36">
                        {activityChart.map(d => {
                            const h = Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 3 : 0);
                            return (
                                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <div className="w-full bg-indigo-500 rounded-t opacity-75 group-hover:opacity-100" style={{ height: `${h}%` }} />
                                    <div className="absolute bottom-full mb-1 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                                        {fmt(d.revenue)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

AnalyticsIndex.layout = (page: React.ReactNode) => (
    <SuperAdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/super-admin/dashboard' }, { title: 'Analytics' }]}>{page}</SuperAdminLayout>
);

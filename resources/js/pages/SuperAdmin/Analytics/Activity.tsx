import { Head, Link, router } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { Button } from '@/components/ui/button';

interface Row { id: string; name: string; slug: string; trx_count: number; revenue: number }
interface Props { activityByBusiness: Row[]; days: number }

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function AnalyticsActivity({ activityByBusiness, days }: Props) {
    return (
        <>
            <Head title="Super Admin — Activity" />
            <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Aktivitas per Bisnis</h1>
                    <div className="flex gap-2">
                        {[7, 14, 30].map(d => (
                            <Button key={d} size="sm" variant={days === d ? 'default' : 'outline'}
                                onClick={() => router.get('/super-admin/analytics/activity', { days: d }, { replace: true })}>
                                {d}H
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-3 font-medium">Bisnis</th>
                                <th className="px-5 py-3 font-medium text-right">Transaksi ({days}H)</th>
                                <th className="px-5 py-3 font-medium text-right">Omzet ({days}H)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {activityByBusiness.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50/60">
                                    <td className="px-5 py-3">
                                        <Link href={`/super-admin/tenants/${r.slug}`} className="font-medium text-indigo-600 hover:underline">{r.name}</Link>
                                    </td>
                                    <td className="px-5 py-3 text-right text-gray-800">{Number(r.trx_count).toLocaleString('id-ID')}</td>
                                    <td className="px-5 py-3 text-right font-bold text-gray-900">{fmt(r.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

AnalyticsActivity.layout = (page: React.ReactNode) => (
    <SuperAdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/super-admin/dashboard' }, { title: 'Analytics', href: '/super-admin/analytics' }, { title: 'Activity' }]}>{page}</SuperAdminLayout>
);

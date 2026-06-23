import { Head } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/super-admin-layout';

interface GrowthRow { month: string; new_businesses: number }
interface Props { growthData: GrowthRow[] }

export default function AnalyticsGrowth({ growthData }: Props) {
    const maxVal = Math.max(...growthData.map(r => Number(r.new_businesses)), 1);

    return (
        <>
            <Head title="Super Admin — Growth" />
            <div className="p-6 flex flex-col gap-6">
                <h1 className="text-xl font-bold text-gray-900">Growth Bisnis</h1>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Bisnis Baru per Bulan (12 bulan terakhir)</h2>
                    <div className="flex items-end gap-2 h-48">
                        {growthData.map(r => {
                            const h = Math.max((Number(r.new_businesses) / maxVal) * 100, Number(r.new_businesses) > 0 ? 3 : 0);
                            return (
                                <div key={r.month} className="flex-1 flex flex-col items-center gap-1 group relative min-w-0">
                                    <span className="text-[10px] font-bold text-gray-600 mb-1">{r.new_businesses}</span>
                                    <div className="w-full bg-indigo-500 rounded-t opacity-75 group-hover:opacity-100" style={{ height: `${h}%` }} />
                                    <span className="text-[9px] text-gray-400 truncate max-w-full">{r.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-5 py-3 font-medium text-left">Bulan</th>
                                <th className="px-5 py-3 font-medium text-right">Bisnis Baru</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[...growthData].reverse().map(r => (
                                <tr key={r.month} className="hover:bg-gray-50/60">
                                    <td className="px-5 py-3 text-gray-800">{r.month}</td>
                                    <td className="px-5 py-3 text-right font-bold text-indigo-600">{r.new_businesses}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

AnalyticsGrowth.layout = (page: React.ReactNode) => (
    <SuperAdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/super-admin/dashboard' }, { title: 'Analytics', href: '/super-admin/analytics' }, { title: 'Growth' }]}>{page}</SuperAdminLayout>
);

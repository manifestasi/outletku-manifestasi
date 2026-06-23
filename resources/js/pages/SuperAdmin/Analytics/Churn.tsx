import { Head, Link } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { AlertTriangle } from 'lucide-react';

interface ChurnRow { days: number; count: number }
interface Business { id: string; name: string; slug: string; owner_name: string; last_activity_at: string | null; created_at: string }
interface Props { churnData: ChurnRow[]; risky: Business[] }

export default function AnalyticsChurn({ churnData, risky }: Props) {
    function timeAgo(dateStr: string | null) {
        if (!dateStr) return 'Belum pernah aktif';
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / 86400000);
        return `${days} hari lalu`;
    }

    return (
        <>
            <Head title="Super Admin — Churn" />
            <div className="p-6 flex flex-col gap-6">
                <h1 className="text-xl font-bold text-gray-900">Analisis Churn</h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {churnData.map(r => (
                        <div key={r.days} className={`bg-white border rounded-xl p-5 shadow-sm text-center ${r.count > 0 ? 'border-amber-200' : 'border-gray-100'}`}>
                            <p className="text-xs font-medium text-gray-500 mb-1">Tidak aktif ≥ {r.days} hari</p>
                            <p className={`text-3xl font-bold ${r.count > 5 ? 'text-red-600' : r.count > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{r.count}</p>
                            <p className="text-xs text-gray-400 mt-1">bisnis aktif</p>
                        </div>
                    ))}
                </div>

                {risky.length > 0 && (
                    <div className="bg-white border border-amber-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-amber-100 bg-amber-50/50">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <h2 className="text-sm font-semibold text-amber-900">Bisnis Berisiko Churn ({risky.length})</h2>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Bisnis</th>
                                    <th className="px-5 py-3 font-medium">Owner</th>
                                    <th className="px-5 py-3 font-medium">Aktivitas Terakhir</th>
                                    <th className="px-5 py-3 font-medium">Bergabung</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {risky.map(b => (
                                    <tr key={b.id} className="hover:bg-amber-50/30">
                                        <td className="px-5 py-3">
                                            <Link href={`/super-admin/tenants/${b.slug}`} className="font-medium text-indigo-600 hover:underline">{b.name}</Link>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{b.owner_name}</td>
                                        <td className="px-5 py-3 text-amber-700 font-medium text-xs">{timeAgo(b.last_activity_at)}</td>
                                        <td className="px-5 py-3 text-gray-500 text-xs">{new Date(b.created_at).toLocaleDateString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

AnalyticsChurn.layout = (page: React.ReactNode) => (
    <SuperAdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/super-admin/dashboard' }, { title: 'Analytics', href: '/super-admin/analytics' }, { title: 'Churn' }]}>{page}</SuperAdminLayout>
);

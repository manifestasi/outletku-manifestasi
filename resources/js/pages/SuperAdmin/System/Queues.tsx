import { Head } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface FailedJob { id: number; connection: string; queue: string; payload: string; exception: string; failed_at: string }
interface PendingQueue { queue: string; count: number }
interface Props { failedJobs: FailedJob[]; pendingJobs: PendingQueue[] }

export default function SystemQueues({ failedJobs, pendingJobs }: Props) {
    return (
        <>
            <Head title="Super Admin — Queues" />
            <div className="p-6 flex flex-col gap-6">
                <h1 className="text-xl font-bold text-gray-900">Queue Monitor</h1>

                {/* Pending */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <h2 className="text-sm font-semibold text-gray-800">Pending Jobs</h2>
                    </div>
                    {pendingJobs.length > 0 ? (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Queue</th>
                                    <th className="px-5 py-3 font-medium text-right">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pendingJobs.map(j => (
                                    <tr key={j.queue} className="hover:bg-gray-50/60">
                                        <td className="px-5 py-3 font-mono text-gray-800">{j.queue}</td>
                                        <td className="px-5 py-3 text-right font-bold text-indigo-600">{j.count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-6 text-center text-gray-400 text-sm">Tidak ada pending jobs</div>
                    )}
                </div>

                {/* Failed */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <h2 className="text-sm font-semibold text-gray-800">Failed Jobs ({failedJobs.length})</h2>
                    </div>
                    {failedJobs.length > 0 ? (
                        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {failedJobs.map(j => (
                                <div key={j.id} className="px-5 py-4">
                                    <div className="flex items-center gap-3 flex-wrap mb-2">
                                        <Badge className="bg-red-50 text-red-700 border-none shadow-none text-[9px]">{j.queue}</Badge>
                                        <span className="text-xs text-gray-500">{j.failed_at}</span>
                                        <span className="text-xs font-medium text-gray-800">{j.payload}</span>
                                    </div>
                                    <p className="text-[10px] text-red-600 font-mono bg-red-50 p-2 rounded break-all">{j.exception}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 text-center text-gray-400 text-sm">Tidak ada failed jobs</div>
                    )}
                </div>
            </div>
        </>
    );
}

SystemQueues.layout = (page: React.ReactNode) => (
    <SuperAdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/super-admin/dashboard' }, { title: 'System', href: '/super-admin/system' }, { title: 'Queues' }]}>{page}</SuperAdminLayout>
);

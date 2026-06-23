import { Head, Link } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { Badge } from '@/components/ui/badge';
import { Database, FileText, List } from 'lucide-react';

interface SystemInfo {
    php_version: string; laravel_version: string; db_size_mb: number;
    environment: string; debug_mode: boolean; cache_driver: string;
    queue_driver: string; app_url: string;
}
interface Props { info: SystemInfo }

export default function SystemIndex({ info }: Props) {
    const rows = [
        { label: 'PHP Version', value: info.php_version },
        { label: 'Laravel Version', value: info.laravel_version },
        { label: 'Environment', value: info.environment, badge: info.environment === 'production' ? 'emerald' : 'amber' },
        { label: 'Debug Mode', value: info.debug_mode ? 'ON' : 'OFF', badge: info.debug_mode ? 'red' : 'gray' },
        { label: 'Database Size', value: `${info.db_size_mb} MB` },
        { label: 'Cache Driver', value: info.cache_driver },
        { label: 'Queue Driver', value: info.queue_driver },
        { label: 'App URL', value: info.app_url },
    ] as const;

    const badgeColor: Record<string, string> = {
        emerald: 'bg-emerald-50 text-emerald-700',
        amber: 'bg-amber-50 text-amber-700',
        red: 'bg-red-50 text-red-700',
        gray: 'bg-gray-100 text-gray-600',
    };

    return (
        <>
            <Head title="Super Admin — System" />
            <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">System Info</h1>
                    <div className="flex gap-3">
                        <Link href="/super-admin/system/logs" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600">
                            <FileText className="w-4 h-4" />Logs
                        </Link>
                        <Link href="/super-admin/system/queues" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600">
                            <List className="w-4 h-4" />Queues
                        </Link>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-100">
                            {rows.map(r => (
                                <tr key={r.label}>
                                    <td className="px-5 py-3 text-gray-500 font-medium w-48">{r.label}</td>
                                    <td className="px-5 py-3 text-gray-900">
                                        {'badge' in r && r.badge ? (
                                            <Badge className={`border-none shadow-none ${badgeColor[r.badge as string] ?? 'bg-gray-100 text-gray-600'}`}>{r.value}</Badge>
                                        ) : r.value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

SystemIndex.layout = (page: React.ReactNode) => (
    <SuperAdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/super-admin/dashboard' }, { title: 'System' }]}>{page}</SuperAdminLayout>
);

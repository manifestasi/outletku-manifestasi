import { Head } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { Badge } from '@/components/ui/badge';

interface LogEntry { timestamp: string; env: string; level: string; message: string }
interface Props { logs: LogEntry[] }

const LEVEL_COLOR: Record<string, string> = {
    error: 'bg-red-50 text-red-700',
    warning: 'bg-amber-50 text-amber-700',
    info: 'bg-blue-50 text-blue-700',
    debug: 'bg-gray-100 text-gray-600',
    critical: 'bg-red-100 text-red-800',
    emergency: 'bg-red-200 text-red-900',
};

export default function SystemLogs({ logs }: Props) {
    return (
        <>
            <Head title="Super Admin — Logs" />
            <div className="p-6 flex flex-col gap-6">
                <h1 className="text-xl font-bold text-gray-900">Application Logs <span className="text-gray-400 font-normal text-sm">({logs.length} entri terbaru)</span></h1>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    {logs.length > 0 ? (
                        <div className="divide-y divide-gray-100 max-h-[calc(100vh-220px)] overflow-y-auto">
                            {logs.map((entry, i) => (
                                <div key={i} className="px-5 py-3 hover:bg-gray-50/60">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-[10px] text-gray-400 font-mono shrink-0">{entry.timestamp}</span>
                                        <Badge className={`text-[9px] border-none shadow-none shrink-0 ${LEVEL_COLOR[entry.level] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {entry.level}
                                        </Badge>
                                        <span className="text-[10px] text-gray-400 shrink-0">[{entry.env}]</span>
                                    </div>
                                    <p className="text-xs text-gray-700 mt-1 font-mono break-all">{entry.message}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-gray-400 text-sm">Log kosong atau tidak dapat dibaca.</div>
                    )}
                </div>
            </div>
        </>
    );
}

SystemLogs.layout = (page: React.ReactNode) => (
    <SuperAdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/super-admin/dashboard' }, { title: 'System', href: '/super-admin/system' }, { title: 'Logs' }]}>{page}</SuperAdminLayout>
);

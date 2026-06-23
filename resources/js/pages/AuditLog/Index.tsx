import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Filter, X } from 'lucide-react';
import { useState } from 'react';

interface Activity {
    id: number;
    log_name: string;
    description: string;
    subject_type: string | null;
    subject_id: string | null;
    causer: { id: string; name: string } | null;
    properties: { attributes?: Record<string, unknown>; old?: Record<string, unknown> } | null;
    created_at: string;
}
interface User { id: string; name: string }
interface PaginationData { data: Activity[]; links: { url: string | null; label: string; active: boolean }[]; total: number }
interface Props { logs: PaginationData; users: User[]; logNames: string[]; filters: Record<string, string> }

const LOG_COLOR: Record<string, string> = {
    product: 'bg-blue-50 text-blue-700',
    stock: 'bg-amber-50 text-amber-700',
    transaction: 'bg-red-50 text-red-700',
    user: 'bg-purple-50 text-purple-700',
    outlet: 'bg-emerald-50 text-emerald-700',
};

const DESC_LABEL: Record<string, string> = {
    created: 'Dibuat',
    updated: 'Diperbarui',
    deleted: 'Dihapus',
};

export default function AuditLogIndex({ logs, users, logNames, filters }: Props) {
    const [form, setForm] = useState({ log_name: filters.log_name ?? '', causer_id: filters.causer_id ?? '', date_from: filters.date_from ?? '', date_to: filters.date_to ?? '' });

    function applyFilters() {
        router.get('/audit-log', form, { preserveState: true, replace: true });
    }

    function clearFilters() {
        const empty = { log_name: '', causer_id: '', date_from: '', date_to: '' };
        setForm(empty);
        router.get('/audit-log', empty, { replace: true });
    }

    function parseSubjectType(type: string | null) {
        if (!type) return '-';
        return type.split('\\').pop() ?? type;
    }

    function formatProperties(props: Activity['properties']) {
        if (!props) return null;
        const attrs = props.attributes;
        const old   = props.old;
        if (!attrs) return null;
        return Object.entries(attrs).map(([key, val]) => (
            <span key={key} className="inline-flex items-center gap-1 mr-1 mb-1">
                <span className="font-mono text-gray-500">{key}:</span>
                {old && key in old && (
                    <><span className="line-through text-red-400 font-mono">{JSON.stringify(old[key])}</span><span className="text-gray-400">→</span></>
                )}
                <span className="text-indigo-700 font-mono">{JSON.stringify(val)}</span>
            </span>
        ));
    }

    return (
        <>
            <Head title="Audit Log" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="w-5 h-5 text-gray-400" />
                        <h1 className="text-xl font-bold text-gray-900">Audit Log <span className="text-gray-400 font-normal text-sm">({logs.total} entri)</span></h1>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Tipe Aksi</label>
                            <select
                                value={form.log_name}
                                onChange={e => setForm(f => ({ ...f, log_name: e.target.value }))}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Semua</option>
                                {logNames.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">User</label>
                            <select
                                value={form.causer_id}
                                onChange={e => setForm(f => ({ ...f, causer_id: e.target.value }))}
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Semua User</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Dari Tanggal</label>
                            <Input type="date" value={form.date_from} onChange={e => setForm(f => ({ ...f, date_from: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Sampai Tanggal</label>
                            <Input type="date" value={form.date_to} onChange={e => setForm(f => ({ ...f, date_to: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" onClick={applyFilters}>
                            <Filter className="w-3.5 h-3.5 mr-1.5" />Filter
                        </Button>
                        <Button size="sm" variant="ghost" onClick={clearFilters} className="text-gray-500">
                            <X className="w-3.5 h-3.5 mr-1.5" />Reset
                        </Button>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Waktu</th>
                                    <th className="px-5 py-3 font-medium">Tipe</th>
                                    <th className="px-5 py-3 font-medium">Aksi</th>
                                    <th className="px-5 py-3 font-medium">Objek</th>
                                    <th className="px-5 py-3 font-medium">Oleh</th>
                                    <th className="px-5 py-3 font-medium">Perubahan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.data.length > 0 ? logs.data.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50/60 align-top">
                                        <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-5 py-3">
                                            <Badge className={`border-none shadow-none text-[9px] ${LOG_COLOR[log.log_name] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {log.log_name}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3 text-gray-700 text-xs font-medium">
                                            {DESC_LABEL[log.description] ?? log.description}
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-500">
                                            {parseSubjectType(log.subject_type)}
                                            {log.subject_id && <span className="text-[9px] font-mono text-gray-400 ml-1">#{log.subject_id.slice(0, 8)}</span>}
                                        </td>
                                        <td className="px-5 py-3 text-xs font-medium text-gray-800">
                                            {log.causer?.name ?? '–'}
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-600 max-w-xs">
                                            <div className="flex flex-wrap">{formatProperties(log.properties)}</div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">Tidak ada data audit log</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {logs.links.length > 3 && (
                        <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-gray-100">
                            {logs.links.map((link, i) =>
                                link.url ? (
                                    <Link key={i} href={link.url} className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 hover:bg-gray-50 border-gray-200'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span key={i} className="px-3 py-1.5 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

AuditLogIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Audit Log', href: '/audit-log' }]}>{page}</AppLayout>
);

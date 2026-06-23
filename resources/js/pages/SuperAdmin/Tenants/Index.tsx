import { Head, Link, router } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Search } from 'lucide-react';
import { useState } from 'react';

interface Tenant {
    id: string; name: string; slug: string; owner_name: string; email: string | null;
    is_active: boolean; users_count: number; outlets_count: number; created_at: string; last_activity_at: string | null;
}
interface Pagination { data: Tenant[]; links: { url: string | null; label: string; active: boolean }[]; total: number }
interface Props { tenants: Pagination; filters: { search?: string; status?: string } }

export default function TenantsIndex({ tenants, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilter(overrides: Record<string, string>) {
        router.get('/super-admin/tenants', { search, ...filters, ...overrides }, { preserveState: true, replace: true });
    }

    function timeAgo(dateStr: string | null) {
        if (!dateStr) return 'Belum pernah';
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / 86400000);
        if (days === 0) return 'Hari ini';
        if (days === 1) return 'Kemarin';
        return `${days} hari lalu`;
    }

    return (
        <>
            <Head title="Super Admin — Tenants" />
            <div className="p-6 flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h1 className="text-xl font-bold text-gray-900">Tenant / Bisnis <span className="text-gray-400 font-normal text-sm">({tenants.total})</span></h1>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-48 max-w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilter({ search })}
                            placeholder="Cari nama, email, owner..."
                            className="pl-9"
                        />
                    </div>
                    {['', 'active', 'inactive'].map(s => (
                        <Button key={s} variant={filters.status === s || (!filters.status && s === '') ? 'default' : 'outline'} size="sm"
                            onClick={() => applyFilter({ status: s })}>
                            {s === '' ? 'Semua' : s === 'active' ? 'Aktif' : 'Nonaktif'}
                        </Button>
                    ))}
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Bisnis</th>
                                    <th className="px-5 py-3 font-medium">Owner</th>
                                    <th className="px-5 py-3 font-medium text-center">User</th>
                                    <th className="px-5 py-3 font-medium text-center">Outlet</th>
                                    <th className="px-5 py-3 font-medium">Aktivitas Terakhir</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                    <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tenants.data.length > 0 ? tenants.data.map(t => (
                                    <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                                    <Building2 className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <Link href={`/super-admin/tenants/${t.slug}`} className="font-medium text-gray-900 hover:text-indigo-600">{t.name}</Link>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{t.owner_name}</td>
                                        <td className="px-5 py-3 text-center text-gray-600">{t.users_count}</td>
                                        <td className="px-5 py-3 text-center text-gray-600">{t.outlets_count}</td>
                                        <td className="px-5 py-3 text-gray-500 text-xs">{timeAgo(t.last_activity_at)}</td>
                                        <td className="px-5 py-3">
                                            <Badge className={`border-none shadow-none ${t.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {t.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Link href={`/super-admin/tenants/${t.slug}`} className="text-xs text-indigo-600 hover:underline font-medium">Detail</Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">Tidak ada data tenant</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {tenants.links.length > 3 && (
                        <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-gray-100">
                            {tenants.links.map((link, i) =>
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

TenantsIndex.layout = (page: React.ReactNode) => (
    <SuperAdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/super-admin/dashboard' }, { title: 'Tenants' }]}>{page}</SuperAdminLayout>
);

import { Head, Link, router } from '@inertiajs/react';
import SuperAdminLayout from '@/layouts/super-admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowLeft, Building2, KeyRound, LogIn, Power, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface Tenant {
    id: string; name: string; slug: string; owner_name: string; email: string | null; phone: string | null;
    address: string | null; is_active: boolean; created_at: string; last_activity_at: string | null;
    users_count: number; outlets_count: number;
    outlets: { id: string; name: string; is_active: boolean }[];
}
interface User { id: string; name: string; email: string | null; phone: string | null; is_active: boolean; last_login_at: string | null; created_at: string; roles: { name: string }[] }
interface DayRevenue { date: string; revenue: number }
interface Props { tenant: Tenant; totalRevenue: number; totalTransactions: number; revenueChart: DayRevenue[]; users: User[] }

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function TenantShow({ tenant, totalRevenue, totalTransactions, revenueChart, users }: Props) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const maxRevenue = Math.max(...revenueChart.map(d => d.revenue), 1);

    function handleToggle() {
        router.post(`/super-admin/tenants/${tenant.slug}/toggle-active`, {}, { preserveScroll: true });
    }
    function handleResetPassword() {
        if (confirm('Reset password owner bisnis ini?')) {
            router.post(`/super-admin/tenants/${tenant.slug}/reset-password`, {}, { preserveScroll: true });
        }
    }
    function handleImpersonate() {
        router.post(`/super-admin/tenants/${tenant.slug}/impersonate`);
    }
    function handleDelete() {
        router.delete(`/super-admin/tenants/${tenant.slug}`);
    }

    return (
        <>
            <Head title={`Super Admin — ${tenant.name}`} />
            <div className="p-6 flex flex-col gap-6 max-w-5xl">
                <div className="flex items-center gap-4">
                    <Link href="/super-admin/tenants" className="text-gray-400 hover:text-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
                            <Badge className={`border-none shadow-none ${tenant.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                {tenant.is_active ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{tenant.owner_name} · {tenant.email ?? '-'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <Button size="sm" variant="outline" onClick={handleImpersonate}>
                            <LogIn className="w-3.5 h-3.5 mr-1.5" />Impersonate
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleResetPassword}>
                            <KeyRound className="w-3.5 h-3.5 mr-1.5" />Reset Password
                        </Button>
                        <Button size="sm" variant={tenant.is_active ? 'outline' : 'default'} onClick={handleToggle}>
                            <Power className="w-3.5 h-3.5 mr-1.5" />
                            {tenant.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />Hapus
                        </Button>
                    </div>
                </div>

                {confirmDelete && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                        <span className="flex-1">Yakin ingin menghapus bisnis <strong>{tenant.name}</strong>? Aksi tidak bisa diurungkan.</span>
                        <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="destructive" onClick={handleDelete}>Hapus</Button>
                            <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>Batal</Button>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Omzet', value: fmt(totalRevenue) },
                        { label: 'Total Transaksi', value: totalTransactions.toString() },
                        { label: 'User', value: (tenant.users_count ?? users.length).toString() },
                        { label: 'Outlet', value: tenant.outlets_count?.toString() ?? tenant.outlets.length.toString() },
                    ].map(s => (
                        <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <p className="text-xs text-gray-500">{s.label}</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Revenue Chart 30 days */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
                    <h2 className="text-sm font-semibold text-gray-800 mb-4">Omzet 30 Hari Terakhir</h2>
                    <div className="flex items-end gap-0.5 h-24">
                        {revenueChart.map(d => {
                            const h = Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 3 : 0);
                            return <div key={d.date} title={`${d.date}: ${fmt(d.revenue)}`} className="flex-1 bg-indigo-400 rounded-t hover:bg-indigo-600 transition-colors" style={{ height: `${h}%` }} />;
                        })}
                    </div>
                </div>

                {/* Users table */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                        <Users className="w-4 h-4 text-gray-400" />
                        <h2 className="text-sm font-semibold text-gray-800">User ({users.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Nama</th>
                                    <th className="px-5 py-3 font-medium">Role</th>
                                    <th className="px-5 py-3 font-medium">Email</th>
                                    <th className="px-5 py-3 font-medium">Login Terakhir</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                                        <td className="px-5 py-3">{u.roles.map(r => <Badge key={r.name} className="mr-1 text-[9px] bg-indigo-50 text-indigo-700 border-none shadow-none">{r.name}</Badge>)}</td>
                                        <td className="px-5 py-3 text-gray-500">{u.email ?? '-'}</td>
                                        <td className="px-5 py-3 text-gray-500 text-xs">{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('id-ID') : '-'}</td>
                                        <td className="px-5 py-3"><Badge className={`border-none shadow-none ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{u.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

TenantShow.layout = (page: React.ReactNode) => (
    <SuperAdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/super-admin/dashboard' }, { title: 'Tenants', href: '/super-admin/tenants' }, { title: 'Detail' }]}>{page}</SuperAdminLayout>
);

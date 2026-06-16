import { Head, Link, router } from '@inertiajs/react';
import { Edit, Pin, Plus, PowerOff, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { PaginatedData } from '@/types/outletku';
import type { User } from '@/types/auth';

type Props = {
    users: PaginatedData<User>;
    filters: { search?: string; role?: string };
};

const roleLabel: Record<string, string> = {
    owner: 'Owner',
    manager: 'Manager',
    cashier: 'Kasir',
};

const roleBadgeClass: Record<string, string> = {
    owner: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    manager: 'bg-amber-50 text-amber-700 border-amber-100',
    cashier: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export default function UsersIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? '');

    function handleFilter(newRole: string) {
        setRole(newRole);
        router.get('/users', { search, role: newRole === 'all' ? '' : newRole }, {
            preserveState: true, replace: true,
        });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get('/users', { search, role }, { preserveState: true, replace: true });
    }

    function handleDeactivate(user: User) {
        if (!confirm(`Nonaktifkan user "${user.name}"?`)) return;
        router.delete(`/users/${user.id}`);
    }

    return (
        <>
            <Head title="Tim & Kasir — OutletKu" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tim & Kasir</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Kelola semua user di bisnis kamu
                        </p>
                    </div>
                    <Link href="/users/create">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4" />
                            Tambah User
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Cari nama..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-48"
                        />
                        <Button type="submit" variant="outline">Cari</Button>
                    </form>
                    <Select value={role || 'all'} onValueChange={handleFilter}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Semua role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Role</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="cashier">Kasir</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* User Table */}
                {users.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                        <UserCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">Belum ada user</h3>
                        <p className="text-xs text-gray-400 mb-4">
                            Tambahkan tim atau kasir untuk bisnis kamu.
                        </p>
                        <Link href="/users/create">
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="w-4 h-4 mr-1" /> Tambah User
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="border-b border-gray-100 bg-gray-50/50">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Nama</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Email / Login</th>
                                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.data.map((user) => {
                                    const roleName = user.roles?.[0]?.name ?? 'unknown';
                                    const isCashier = roleName === 'cashier';
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-indigo-600">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{user.name}</p>
                                                        {user.phone && (
                                                            <p className="text-xs text-gray-400">{user.phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${roleBadgeClass[roleName] ?? ''}`}
                                                >
                                                    {roleLabel[roleName] ?? roleName}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                {isCashier ? (
                                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                                        <Pin className="w-3 h-3" /> Login via PIN
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600 text-xs truncate max-w-[160px] block">{user.email}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className={user.is_active
                                                        ? 'text-emerald-700 bg-emerald-50 border-emerald-100 text-xs'
                                                        : 'text-gray-500 bg-gray-50 border-gray-100 text-xs'
                                                    }
                                                >
                                                    {user.is_active ? 'Aktif' : 'Non-aktif'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Link href={`/users/${user.id}/edit`}>
                                                        <Button size="icon" variant="ghost" className="w-8 h-8 text-gray-400 hover:text-gray-600">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    {user.is_active && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="w-8 h-8 text-gray-400 hover:text-red-600"
                                                            onClick={() => handleDeactivate(user)}
                                                        >
                                                            <PowerOff className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {users.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors
                                    ${link.active
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : link.url
                                            ? 'border-gray-200 hover:bg-gray-50'
                                            : 'border-gray-100 text-gray-300 cursor-not-allowed pointer-events-none'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

UsersIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tim & Kasir', href: '/users' },
    ]}>
        {page}
    </AppLayout>
);

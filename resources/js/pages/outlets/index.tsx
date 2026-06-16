import { Head, Link, router } from '@inertiajs/react';
import { Edit, MapPin, Phone, Plus, PowerOff, Store } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { Outlet, PaginatedData } from '@/types/outletku';
import { index as outletsIndex, create as outletsCreate } from '@/actions/App/Http/Controllers/Outlet/OutletController';

type Props = {
    outlets: PaginatedData<Outlet>;
    filters: { search?: string };
};

export default function OutletsIndex({ outlets, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(outletsIndex.url(), { search }, { preserveState: true, replace: true });
    }

    function handleDeactivate(outlet: Outlet) {
        if (!confirm(`Nonaktifkan outlet "${outlet.name}"?`)) return;
        router.delete(`/outlets/${outlet.id}`);
    }

    return (
        <>
            <Head title="Outlet — OutletKu" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Outlet</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Kelola semua outlet bisnis kamu
                        </p>
                    </div>
                    <Link href="/outlets/create">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4" />
                            Tambah Outlet
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
                    <Input
                        placeholder="Cari outlet..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" variant="outline">Cari</Button>
                </form>

                {/* Outlet Cards */}
                {outlets.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                        <Store className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">Belum ada outlet</h3>
                        <p className="text-xs text-gray-400 mb-4">
                            Tambahkan outlet pertama untuk mulai mengelola bisnis kamu.
                        </p>
                        <Link href="/outlets/create">
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="w-4 h-4 mr-1" />
                                Tambah Outlet
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {outlets.data.map((outlet) => (
                            <OutletCard
                                key={outlet.id}
                                outlet={outlet}
                                onDeactivate={() => handleDeactivate(outlet)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {outlets.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                        {outlets.links.map((link, i) => (
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

OutletsIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Outlet', href: '/outlets' },
    ]}>
        {page}
    </AppLayout>
);

// --- Sub-components ---

type OutletCardProps = {
    outlet: Outlet;
    onDeactivate: () => void;
};

function OutletCard({ outlet, onDeactivate }: OutletCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{outlet.name}</h3>
                        <Badge
                            variant="outline"
                            className={outlet.is_active
                                ? 'text-emerald-700 bg-emerald-50 border-emerald-100 text-xs'
                                : 'text-gray-500 bg-gray-50 border-gray-100 text-xs'
                            }
                        >
                            {outlet.is_active ? 'Aktif' : 'Non-aktif'}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-1 shrink-0">
                    <Link href={`/outlets/${outlet.id}/edit`}>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-gray-400 hover:text-gray-600">
                            <Edit className="w-4 h-4" />
                        </Button>
                    </Link>
                    {outlet.is_active && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8 text-gray-400 hover:text-red-600"
                            onClick={onDeactivate}
                        >
                            <PowerOff className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1.5 text-sm text-gray-500">
                {outlet.address && (
                    <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
                        <span className="line-clamp-2">{outlet.address}</span>
                    </div>
                )}
                {outlet.phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span>{outlet.phone}</span>
                    </div>
                )}
                <div className="text-xs text-gray-400 mt-1">
                    {outlet.users_count ?? 0} kasir terdaftar
                </div>
            </div>
        </div>
    );
}

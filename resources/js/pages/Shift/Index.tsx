import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Clock, Eye, Store, User } from 'lucide-react';
import { useState } from 'react';

interface Outlet {
    id: string;
    name: string;
}

interface ShiftUser {
    id: string;
    name: string;
}

interface Shift {
    id: string;
    started_at: string;
    ended_at: string | null;
    starting_cash: number;
    ending_cash: number | null;
    expected_cash: number | null;
    outlet: Outlet;
    user: ShiftUser;
}

interface PaginationData {
    data: Shift[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
}

interface ShiftIndexProps {
    shifts: PaginationData;
    filters?: {
        status?: string;
    };
}

export default function ShiftIndex({ shifts, filters }: ShiftIndexProps) {
    const [status, setStatus] = useState(filters?.status || 'all');

    const handleFilter = (value: string) => {
        setStatus(value);
        router.get('/shifts', { status: value === 'all' ? undefined : value }, { preserveState: true });
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(dateString));
    };

    const duration = (start: string, end: string | null) => {
        if (!end) return 'Berjalan';
        const ms = new Date(end).getTime() - new Date(start).getTime();
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        return `${hours}j ${minutes}m`;
    };

    return (
        <>
            <Head title="Daftar Shift" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Shift Kasir</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Riwayat buka dan tutup shift per outlet
                        </p>
                    </div>
                    <Select value={status} onValueChange={handleFilter}>
                        <SelectTrigger className="w-full sm:w-44">
                            <SelectValue placeholder="Semua status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Shift</SelectItem>
                            <SelectItem value="open">Sedang Berjalan</SelectItem>
                            <SelectItem value="closed">Sudah Ditutup</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">Mulai</th>
                                    <th className="px-4 py-3">Kasir</th>
                                    <th className="px-4 py-3">Outlet</th>
                                    <th className="px-4 py-3 text-right">Kas Awal</th>
                                    <th className="px-4 py-3 text-right">Kas Akhir</th>
                                    <th className="px-4 py-3 text-center">Durasi</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shifts.data.length > 0 ? (
                                    shifts.data.map((shift) => (
                                        <tr key={shift.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                                                {formatDateTime(shift.started_at)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {shift.user.name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Store className="w-4 h-4 text-gray-400" />
                                                    {shift.outlet.name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right text-gray-900">
                                                {formatCurrency(shift.starting_cash)}
                                            </td>
                                            <td className="px-4 py-4 text-right text-gray-900">
                                                {formatCurrency(shift.ending_cash)}
                                            </td>
                                            <td className="px-4 py-4 text-center text-gray-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {duration(shift.started_at, shift.ended_at)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {!shift.ended_at ? (
                                                    <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-none shadow-none">
                                                        Berjalan
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">
                                                        Selesai
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                                                    asChild
                                                >
                                                    <Link href={`/shifts/${shift.id}`}>
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                            Belum ada data shift.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {shifts.links.length > 3 && (
                        <div className="flex items-center justify-center gap-1 p-4 border-t border-gray-100">
                            {shifts.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-3 py-1 border rounded-md text-sm ${
                                            link.active
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-3 py-1 text-sm text-gray-400"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ShiftIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Shift Kasir', href: '/shifts' }]}>
        {page}
    </AppLayout>
);

import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Receipt } from 'lucide-react';
import { useState } from 'react';
import type { Auth } from '@/types/auth';

interface Outlet {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
}

interface Transaction {
    id: string;
    invoice_number: string;
    transaction_date: string;
    total: number;
    payment_method: string;
    is_void: boolean;
    outlet: Outlet;
    user: User;
}

interface PaginationData {
    data: Transaction[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
}

interface TransactionIndexProps {
    transactions: PaginationData;
    outlets: Outlet[];
    filters: {
        outlet_id?: string;
        date?: string;
    };
}

export default function TransactionIndex({ transactions, outlets, filters }: TransactionIndexProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const roles = (auth.user.roles ?? []).map((r) => r.name);
    const canCreate = roles.includes('owner') || roles.includes('manager');

    const [outletId, setOutletId] = useState(filters.outlet_id || 'all');
    const [date, setDate] = useState(filters.date || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/transactions',
            {
                outlet_id: outletId === 'all' ? undefined : outletId,
                date: date || undefined,
            },
            { preserveState: true },
        );
    };

    const handleReset = () => {
        setOutletId('all');
        setDate('');
        router.get('/transactions');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(dateString));
    };

    const hasFilters = outletId !== 'all' || date !== '';

    return (
        <>
            <Head title="Riwayat Transaksi" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Riwayat Transaksi</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pantau semua penjualan dari outlet bisnis kamu
                        </p>
                    </div>
                    {canCreate && (
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                            <Link href="/transactions/create">
                                <Plus className="w-4 h-4 mr-2" />
                                Transaksi Baru
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/50"
                    >
                        <div className="w-full sm:w-56">
                            <Select value={outletId} onValueChange={setOutletId}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Semua Outlet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Outlet</SelectItem>
                                    {outlets.map((out) => (
                                        <SelectItem key={out.id} value={out.id}>
                                            {out.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full sm:w-44">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" variant="secondary">
                                <Search className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                            {hasFilters && (
                                <Button type="button" variant="ghost" onClick={handleReset}>
                                    Reset
                                </Button>
                            )}
                        </div>
                    </form>

                    {transactions.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">Waktu</th>
                                            <th className="px-5 py-3 font-medium">Invoice</th>
                                            <th className="px-5 py-3 font-medium">Outlet</th>
                                            <th className="px-5 py-3 font-medium">Kasir</th>
                                            <th className="px-5 py-3 font-medium text-right">Total</th>
                                            <th className="px-5 py-3 font-medium text-center">Status</th>
                                            <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.data.map((trx) => (
                                            <tr
                                                key={trx.id}
                                                className={`hover:bg-gray-50/80 transition-colors ${
                                                    trx.is_void ? 'bg-red-50/40' : ''
                                                }`}
                                            >
                                                <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                                                    {formatDate(trx.transaction_date)}
                                                </td>
                                                <td className="px-5 py-4 font-medium text-gray-900">
                                                    {trx.invoice_number}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">{trx.outlet.name}</td>
                                                <td className="px-5 py-4 text-gray-600">{trx.user.name}</td>
                                                <td className="px-5 py-4 text-right font-semibold text-gray-900">
                                                    {formatCurrency(trx.total)}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    {trx.is_void ? (
                                                        <Badge
                                                            variant="destructive"
                                                            className="bg-red-100 text-red-700 hover:bg-red-100 border-none"
                                                        >
                                                            Dibatalkan
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">
                                                            Sukses
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                                                        asChild
                                                    >
                                                        <Link href={`/transactions/${trx.id}`}>
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {transactions.links.length > 3 && (
                                <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-gray-100">
                                    {transactions.links.map((link, i) =>
                                        link.url ? (
                                            <Link
                                                key={i}
                                                href={link.url}
                                                className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'text-gray-700 hover:bg-gray-50 border-gray-200'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 text-sm text-gray-400"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ),
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                                <Receipt className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                Belum ada transaksi
                            </h3>
                            <p className="text-xs text-gray-400 max-w-sm">
                                {hasFilters
                                    ? 'Tidak ada transaksi yang cocok dengan filter ini. Coba ubah outlet atau tanggal.'
                                    : 'Transaksi penjualan akan muncul di sini setelah ada penjualan di POS.'}
                            </p>
                            {hasFilters && (
                                <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

TransactionIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Transaksi', href: '/transactions' }]}>
        {page}
    </AppLayout>
);

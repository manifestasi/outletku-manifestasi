import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, AlertCircle } from 'lucide-react';
import { useState } from 'react';

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
    const [outletId, setOutletId] = useState(filters.outlet_id || 'all');
    const [date, setDate] = useState(filters.date || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/transactions', { 
            outlet_id: outletId === 'all' ? undefined : outletId,
            date: date || undefined
        }, { preserveState: true });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('id-ID', { 
            dateStyle: 'medium', 
            timeStyle: 'short' 
        }).format(new Date(dateString));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Transaksi', href: '/transactions' }]}>
            <Head title="Daftar Transaksi" />

            <div className="flex flex-col space-y-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="w-full sm:w-64">
                            <Select value={outletId} onValueChange={setOutletId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Outlet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Outlet</SelectItem>
                                    {outlets.map(out => (
                                        <SelectItem key={out.id} value={out.id}>{out.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full sm:w-48">
                            <Input 
                                type="date" 
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="secondary"><Search className="w-4 h-4 mr-2"/> Filter</Button>
                        {(outletId !== 'all' || date) && (
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => {
                                    setOutletId('all');
                                    setDate('');
                                    router.get('/transactions');
                                }}
                            >
                                Reset
                            </Button>
                        )}
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">Waktu</th>
                                    <th className="px-4 py-3">Invoice</th>
                                    <th className="px-4 py-3">Outlet</th>
                                    <th className="px-4 py-3">Kasir</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.data.length > 0 ? transactions.data.map(trx => (
                                    <tr key={trx.id} className={`border-b hover:bg-gray-50 ${trx.is_void ? 'bg-red-50/50' : ''}`}>
                                        <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                                            {formatDate(trx.transaction_date)}
                                        </td>
                                        <td className="px-4 py-4 font-medium text-gray-900">
                                            {trx.invoice_number}
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">{trx.outlet.name}</td>
                                        <td className="px-4 py-4 text-gray-600">{trx.user.name}</td>
                                        <td className="px-4 py-4 text-right font-bold text-gray-900">
                                            {formatCurrency(trx.total)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {trx.is_void ? (
                                                <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Dibatalkan</Badge>
                                            ) : (
                                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">Sukses</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600" asChild>
                                                <Link href={`/transactions/${trx.id}`}>
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                                            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                            Belum ada transaksi pada kriteria ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.links.length > 3 && (
                        <div className="flex items-center justify-center space-x-1 mt-6">
                            {transactions.links.map((link, i) => (
                                link.url ? (
                                    <Link 
                                        key={i} 
                                        href={link.url} 
                                        className={`px-3 py-1 border rounded-md text-sm ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i} className="px-3 py-1 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

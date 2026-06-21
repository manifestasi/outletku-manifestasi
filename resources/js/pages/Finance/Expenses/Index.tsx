import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit2, Eye, Plus, Receipt, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    index as expensesIndex,
    create as expensesCreate,
    edit as expensesEdit,
    destroy as expensesDestroy,
} from '@/actions/App/Http/Controllers/Finance/ExpenseController';

interface Outlet { id: string; name: string }
interface Category { id: string; name: string }
interface Expense {
    id: string;
    amount: number;
    expense_date: string;
    description: string | null;
    outlet: Outlet | null;
    category: { id: string; name: string } | null;
    created_by: { id: string; name: string };
}
interface PaginationData {
    data: Expense[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
}

interface Props {
    expenses: PaginationData;
    outlets: Outlet[];
    categories: Category[];
    totalAmount: number;
    filters: { outlet_id?: string; category_id?: string; start_date?: string; end_date?: string };
}

export default function ExpensesIndex({ expenses, outlets, categories, totalAmount, filters }: Props) {
    const [outletId, setOutletId]   = useState(filters.outlet_id ?? 'all');
    const [catId, setCatId]         = useState(filters.category_id ?? 'all');
    const [startDate, setStartDate] = useState(filters.start_date ?? '');
    const [endDate, setEndDate]     = useState(filters.end_date ?? '');

    const fmt = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    const fmtDate = (d: string) =>
        new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(d));

    function handleFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get(expensesIndex.url(), {
            outlet_id:   outletId === 'all' ? undefined : outletId,
            category_id: catId === 'all' ? undefined : catId,
            start_date:  startDate || undefined,
            end_date:    endDate || undefined,
        }, { preserveState: true });
    }

    function handleReset() {
        setOutletId('all'); setCatId('all'); setStartDate(''); setEndDate('');
        router.get(expensesIndex.url());
    }

    function handleDelete(id: string) {
        if (!confirm('Hapus pengeluaran ini?')) return;
        router.delete(expensesDestroy.url({ expense: id }));
    }

    const hasFilters = outletId !== 'all' || catId !== 'all' || startDate || endDate;

    return (
        <>
            <Head title="Pengeluaran" />
            <div className="flex flex-col gap-6 p-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pengeluaran</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Catat dan pantau pengeluaran operasional bisnis
                        </p>
                    </div>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                        <Link href={expensesCreate.url()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Pengeluaran
                        </Link>
                    </Button>
                </div>

                {/* Summary Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:col-span-1">
                        <p className="text-sm text-gray-500">Total Pengeluaran (Filter Aktif)</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{fmt(totalAmount)}</p>
                    </div>
                    <div className="sm:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-wrap gap-3 items-center">
                        <Link href="/finance/daily" className="text-sm text-indigo-600 hover:underline font-medium">
                            → Ringkasan Harian
                        </Link>
                        <Link href="/finance/profit-loss" className="text-sm text-indigo-600 hover:underline font-medium">
                            → Laporan L/R
                        </Link>
                        <Link href="/cash-transfers" className="text-sm text-indigo-600 hover:underline font-medium">
                            → Transfer Kas
                        </Link>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    {/* Filter bar */}
                    <form
                        onSubmit={handleFilter}
                        className="flex flex-wrap gap-3 p-4 border-b border-gray-100 bg-gray-50/50"
                    >
                        <div className="w-full sm:w-44">
                            <Select value={outletId} onValueChange={setOutletId}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Semua Outlet" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Outlet</SelectItem>
                                    {outlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full sm:w-44">
                            <Select value={catId} onValueChange={setCatId}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full sm:w-40 bg-white" />
                        <Input type="date" value={endDate}   onChange={e => setEndDate(e.target.value)}   className="w-full sm:w-40 bg-white" />
                        <div className="flex gap-2">
                            <Button type="submit" variant="secondary">Filter</Button>
                            {hasFilters && <Button type="button" variant="ghost" onClick={handleReset}>Reset</Button>}
                        </div>
                    </form>

                    {expenses.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">Tanggal</th>
                                            <th className="px-5 py-3 font-medium">Kategori</th>
                                            <th className="px-5 py-3 font-medium">Outlet</th>
                                            <th className="px-5 py-3 font-medium">Deskripsi</th>
                                            <th className="px-5 py-3 font-medium text-right">Jumlah</th>
                                            <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {expenses.data.map(exp => (
                                            <tr key={exp.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{fmtDate(exp.expense_date)}</td>
                                                <td className="px-5 py-4">
                                                    {exp.category ? (
                                                        <Badge className="bg-indigo-50 text-indigo-700 border-none shadow-none hover:bg-indigo-100">
                                                            {exp.category.name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">–</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-gray-600">{exp.outlet?.name ?? <span className="text-gray-400">Semua</span>}</td>
                                                <td className="px-5 py-4 text-gray-600 max-w-xs truncate">{exp.description ?? '–'}</td>
                                                <td className="px-5 py-4 text-right font-semibold text-red-600">{fmt(exp.amount)}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600" asChild>
                                                            <Link href={expensesEdit.url({ expense: exp.id })}>
                                                                <Edit2 className="w-4 h-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-8 w-8 text-gray-400 hover:text-red-600"
                                                            onClick={() => handleDelete(exp.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {expenses.links.length > 3 && (
                                <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-gray-100">
                                    {expenses.links.map((link, i) =>
                                        link.url ? (
                                            <Link key={i} href={link.url}
                                                className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 hover:bg-gray-50 border-gray-200'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span key={i} className="px-3 py-1.5 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                                <Receipt className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Belum ada pengeluaran</h3>
                            <p className="text-xs text-gray-400 max-w-xs">
                                {hasFilters ? 'Tidak ada pengeluaran dengan filter ini.' : 'Mulai catat pengeluaran operasional bisnis kamu.'}
                            </p>
                            {hasFilters
                                ? <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>Reset Filter</Button>
                                : <Button asChild size="sm" className="mt-4 bg-indigo-600 hover:bg-indigo-700"><Link href={expensesCreate.url()}>Catat Sekarang</Link></Button>
                            }
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ExpensesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pengeluaran', href: '/expenses' }]}>{page}</AppLayout>
);

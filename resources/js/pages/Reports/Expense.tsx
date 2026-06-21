import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, FileText, Receipt } from 'lucide-react';
import { useState } from 'react';
import {
    expense,
    exportExpenseExcel,
    exportExpensePdf,
} from '@/actions/App/Http/Controllers/Reports/ReportController';

interface Outlet { id: string; name: string }
interface Category { id: string; name: string }
interface CategorySummary { category_name: string; total: number; count: number }
interface ExpenseRow {
    id: string;
    expense_date: string;
    amount: number;
    description: string | null;
    outlet: { name: string } | null;
    category: { name: string } | null;
    createdBy: { name: string } | null;
}
interface Filters { outletId: string | null; startDate: string; endDate: string }

interface Props {
    outlets: Outlet[];
    categories: Category[];
    byCategory: CategorySummary[];
    rows: ExpenseRow[];
    totalAmount: number;
    filters: Filters;
}

export default function ReportExpense({ outlets, categories, byCategory, rows, totalAmount, filters }: Props) {
    const [outletId, setOutletId] = useState(filters.outletId ?? 'all');
    const [startDate, setStartDate] = useState(filters.startDate);
    const [endDate, setEndDate]     = useState(filters.endDate);

    const fmt = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    function buildQuery() {
        return {
            outlet_id:  outletId === 'all' ? undefined : outletId,
            start_date: startDate,
            end_date:   endDate,
        };
    }

    function handleFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get(expense.url(), buildQuery(), { preserveState: true });
    }

    function exportUrl(fn: (opts?: any) => any) {
        const q = buildQuery();
        const params = new URLSearchParams(Object.fromEntries(Object.entries(q).filter(([_, v]) => v !== undefined)) as Record<string, string>);
        return fn.url() + (params.toString() ? '?' + params.toString() : '');
    }

    const COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-teal-500'];

    return (
        <>
            <Head title="Laporan Pengeluaran" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan Pengeluaran</h1>
                        <p className="text-sm text-muted-foreground mt-1">Analisis biaya operasional per kategori</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={exportUrl(exportExpenseExcel)} target="_blank">
                                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />Excel
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={exportUrl(exportExpensePdf)} target="_blank">
                                <FileText className="w-4 h-4 mr-1.5 text-red-500" />PDF
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
                        <div className="space-y-1 w-full sm:w-52">
                            <label className="text-xs font-medium text-gray-600">Outlet</label>
                            <Select value={outletId} onValueChange={setOutletId}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Semua Outlet" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Outlet</SelectItem>
                                    {outlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1 w-full sm:w-40">
                            <label className="text-xs font-medium text-gray-600">Dari</label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-1 w-full sm:w-40">
                            <label className="text-xs font-medium text-gray-600">Sampai</label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white" />
                        </div>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Tampilkan</Button>
                    </form>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{fmt(totalAmount)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Periode yang dipilih</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <p className="text-sm font-medium text-gray-600">Jumlah Transaksi</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{rows.length}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Catatan pengeluaran</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <p className="text-sm font-medium text-gray-600">Kategori Terbesar</p>
                        <p className="text-xl font-bold text-gray-900 mt-1 truncate">
                            {byCategory[0]?.category_name ?? '–'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {byCategory[0] ? fmt(byCategory[0].total) : ''}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Category breakdown */}
                    {byCategory.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">Per Kategori</h2>
                            <div className="space-y-3">
                                {byCategory.map((cat, i) => {
                                    const pct = totalAmount > 0 ? (cat.total / totalAmount) * 100 : 0;
                                    return (
                                        <div key={cat.category_name}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-gray-700 truncate max-w-[140px]">{cat.category_name}</span>
                                                <span className="text-gray-500 shrink-0">{pct.toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${COLORS[i % COLORS.length]}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                                                <span>{cat.count} catatan</span>
                                                <span>{fmt(cat.total)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Detail table */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-700">Detail Pengeluaran</h2>
                        </div>
                        {rows.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">Tanggal</th>
                                            <th className="px-5 py-3 font-medium">Kategori</th>
                                            <th className="px-5 py-3 font-medium">Outlet</th>
                                            <th className="px-5 py-3 font-medium">Deskripsi</th>
                                            <th className="px-5 py-3 font-medium text-right">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {rows.map(exp => (
                                            <tr key={exp.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                    {new Date(exp.expense_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                                </td>
                                                <td className="px-5 py-3 text-gray-700">{exp.category?.name ?? '–'}</td>
                                                <td className="px-5 py-3 text-gray-600">{exp.outlet?.name ?? 'Semua'}</td>
                                                <td className="px-5 py-3 text-gray-500 max-w-[180px] truncate">{exp.description ?? '–'}</td>
                                                <td className="px-5 py-3 text-right font-semibold text-red-600">{fmt(exp.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-gray-200 bg-gray-50">
                                            <td colSpan={4} className="px-5 py-3 font-bold text-right text-gray-700">Total</td>
                                            <td className="px-5 py-3 text-right font-bold text-red-600">{fmt(totalAmount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-14 text-center">
                                <Receipt className="w-8 h-8 text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500">Tidak ada data pengeluaran untuk periode ini</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

ReportExpense.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Laporan', href: '/reports/sales' }, { title: 'Pengeluaran', href: '/reports/expense' }]}>
        {page}
    </AppLayout>
);

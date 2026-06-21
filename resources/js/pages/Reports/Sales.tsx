import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Download, FileSpreadsheet, FileText, ShoppingBag, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import {
    sales,
    exportSalesExcel,
    exportSalesPdf,
} from '@/actions/App/Http/Controllers/Reports/ReportController';

interface Outlet { id: string; name: string }
interface Transaction {
    id: string;
    invoice_number: string;
    transaction_date: string;
    outlet: { name: string } | null;
    user: { name: string } | null;
    subtotal: number;
    discount: number;
    total: number;
    payment_method: string;
}
interface DayRow { date: string; revenue: number; count: number }
interface TopProduct { id: string; product_name: string; total_qty: number; total_revenue: number }
interface Summary { totalRevenue: number; totalTransactions: number; avgTransaction: number; totalDiscount: number }
interface Filters { outletId: string | null; startDate: string; endDate: string }

interface Props {
    outlets: Outlet[];
    transactions: Transaction[];
    summary: Summary;
    byDay: DayRow[];
    topProducts: TopProduct[];
    filters: Filters;
}

const PAYMENT_LABELS: Record<string, string> = {
    cash: 'Tunai', transfer: 'Transfer', other: 'Lainnya',
};

export default function ReportSales({ outlets, transactions, summary, byDay, topProducts, filters }: Props) {
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
        router.get(sales.url(), buildQuery(), { preserveState: true });
    }

    function exportUrl(fn: (opts?: any) => any) {
        const q = buildQuery();
        const params = new URLSearchParams(Object.fromEntries(Object.entries(q).filter(([_, v]) => v !== undefined)) as Record<string, string>);
        return fn.url() + (params.toString() ? '?' + params.toString() : '');
    }

    const maxRevenue = Math.max(...byDay.map(d => d.revenue), 1);

    return (
        <>
            <Head title="Laporan Penjualan" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan Penjualan</h1>
                        <p className="text-sm text-muted-foreground mt-1">Analisis omzet dan transaksi per periode</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={exportUrl(exportSalesExcel)} target="_blank">
                                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
                                Excel
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={exportUrl(exportSalesPdf)} target="_blank">
                                <FileText className="w-4 h-4 mr-1.5 text-red-500" />
                                PDF
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Filter */}
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

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Omzet', value: fmt(summary.totalRevenue), sub: 'Semua transaksi valid', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Jumlah Transaksi', value: summary.totalTransactions.toString(), sub: 'Transaksi valid', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Rata-rata/Transaksi', value: fmt(summary.avgTransaction), sub: 'Nilai per transaksi', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Total Diskon', value: fmt(summary.totalDiscount), sub: 'Diskon diberikan', icon: Download, color: 'text-red-500', bg: 'bg-red-50' },
                    ].map(card => (
                        <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-600">{card.label}</span>
                                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                                    <card.icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Daily Chart */}
                    {byDay.length > 0 && (
                        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">Omzet Harian</h2>
                            <div className="flex items-end gap-1 h-32">
                                {byDay.map(d => (
                                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                                        <div
                                            className="w-full bg-indigo-500 rounded-t opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                                            style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 4)}%` }}
                                        />
                                        <span className="text-[9px] text-gray-400 rotate-45 origin-left whitespace-nowrap hidden sm:block">
                                            {new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                        </span>
                                        <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                            {fmt(d.revenue)} ({d.count} trx)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Top Products */}
                    {topProducts.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-gray-700 mb-4">Produk Terlaris</h2>
                            <div className="space-y-3">
                                {topProducts.slice(0, 7).map((p, i) => (
                                    <div key={p.id} className="flex items-center gap-3">
                                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-700 truncate">{p.product_name}</p>
                                            <p className="text-[10px] text-gray-400">{p.total_qty} pcs · {fmt(p.total_revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Transactions Table */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-700">Detail Transaksi</h2>
                    </div>
                    {transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Invoice</th>
                                        <th className="px-5 py-3 font-medium">Tanggal</th>
                                        <th className="px-5 py-3 font-medium">Outlet</th>
                                        <th className="px-5 py-3 font-medium">Kasir</th>
                                        <th className="px-5 py-3 font-medium text-right">Subtotal</th>
                                        <th className="px-5 py-3 font-medium text-right">Diskon</th>
                                        <th className="px-5 py-3 font-medium text-right">Total</th>
                                        <th className="px-5 py-3 font-medium">Bayar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map(trx => (
                                        <tr key={trx.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-5 py-3">
                                                <Link href={`/transactions/${trx.id}`} className="text-indigo-600 hover:underline font-mono text-xs">
                                                    {trx.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                {new Date(trx.transaction_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </td>
                                            <td className="px-5 py-3 text-gray-700">{trx.outlet?.name ?? '–'}</td>
                                            <td className="px-5 py-3 text-gray-700">{trx.user?.name ?? '–'}</td>
                                            <td className="px-5 py-3 text-right text-gray-500">
                                                {new Intl.NumberFormat('id-ID').format(trx.subtotal)}
                                            </td>
                                            <td className="px-5 py-3 text-right text-gray-500">
                                                {trx.discount > 0 ? new Intl.NumberFormat('id-ID').format(trx.discount) : '–'}
                                            </td>
                                            <td className="px-5 py-3 text-right font-semibold text-gray-900">
                                                {fmt(trx.total)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <Badge className="bg-gray-100 text-gray-700 border-none shadow-none text-[10px]">
                                                    {PAYMENT_LABELS[trx.payment_method] ?? trx.payment_method}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-14 text-center">
                            <BarChart3 className="w-8 h-8 text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500">Belum ada data transaksi untuk periode ini</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ReportSales.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Laporan', href: '/reports/sales' }, { title: 'Penjualan', href: '/reports/sales' }]}>
        {page}
    </AppLayout>
);

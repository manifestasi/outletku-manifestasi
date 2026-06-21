import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSpreadsheet, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import {
    profitLoss,
    exportProfitLossExcel,
    exportProfitLossPdf,
} from '@/actions/App/Http/Controllers/Reports/ReportController';

interface Outlet { id: string; name: string }
interface Report {
    income: number;
    cogs: number;
    grossProfit: number;
    totalExpense: number;
    netProfit: number;
    totalTransactions: number;
}
interface Filters { outletId: string | null; startDate: string; endDate: string }

interface Props {
    outlets: Outlet[];
    report: Report;
    filters: Filters;
}

export default function ReportProfitLoss({ outlets, report, filters }: Props) {
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
        router.get(profitLoss.url(), buildQuery(), { preserveState: true });
    }

    function exportUrl(fn: (opts?: any) => any) {
        const q = buildQuery();
        const params = new URLSearchParams(Object.fromEntries(Object.entries(q).filter(([_, v]) => v !== undefined)) as Record<string, string>);
        return fn.url() + (params.toString() ? '?' + params.toString() : '');
    }

    const netPositive = report.netProfit >= 0;
    const grossPct = report.income > 0 ? ((report.grossProfit / report.income) * 100).toFixed(1) : '0';
    const netPct   = report.income > 0 ? ((report.netProfit / report.income) * 100).toFixed(1) : '0';

    function PLRow({ label, value, sub, bold, valueColor }: { label: string; value: number; sub?: string; bold?: boolean; valueColor?: string }) {
        return (
            <div className={`flex justify-between items-start py-3.5 ${bold ? 'border-t-2 border-gray-200 mt-1' : 'border-t border-gray-100'}`}>
                <div>
                    <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}</span>
                    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                </div>
                <span className={`text-sm font-bold ${valueColor ?? 'text-gray-900'}`}>{fmt(value)}</span>
            </div>
        );
    }

    return (
        <>
            <Head title="Laporan Laba Rugi" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan Laba Rugi</h1>
                        <p className="text-sm text-muted-foreground mt-1">Analisis pendapatan, HPP, dan laba bersih per periode</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={exportUrl(exportProfitLossExcel)} target="_blank">
                                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />Excel
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={exportUrl(exportProfitLossPdf)} target="_blank">
                                <FileText className="w-4 h-4 mr-1.5 text-red-500" />PDF
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
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Hitung L/R</Button>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* P&L Statement */}
                    <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                        <h2 className="text-base font-bold text-gray-800 mb-1">Laporan Laba Rugi</h2>
                        <p className="text-xs text-gray-400 mb-5">
                            Periode: {new Date(startDate).toLocaleDateString('id-ID', { dateStyle: 'long' })} –{' '}
                            {new Date(endDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                        </p>
                        <div>
                            <PLRow
                                label="Pendapatan (Omzet)"
                                value={report.income}
                                sub={`${report.totalTransactions} transaksi valid`}
                            />
                            <PLRow
                                label="HPP / Harga Pokok Penjualan"
                                value={-report.cogs}
                                sub="Biaya modal produk terjual"
                                valueColor="text-red-600"
                            />
                            <PLRow
                                label="Laba Kotor"
                                value={report.grossProfit}
                                bold
                                valueColor={report.grossProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}
                            />
                            <PLRow
                                label="Total Pengeluaran Operasional"
                                value={-report.totalExpense}
                                sub="Biaya operasional outlet"
                                valueColor="text-red-600"
                            />
                            <div className={`rounded-lg p-4 mt-3 ${netPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-800">LABA BERSIH</span>
                                    <span className={`text-xl font-extrabold ${netPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                                        {fmt(report.netProfit)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                        <div className={`rounded-xl border p-6 ${netPositive ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${netPositive ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {netPositive
                                    ? <TrendingUp className="w-6 h-6 text-emerald-600" />
                                    : <TrendingDown className="w-6 h-6 text-red-600" />}
                            </div>
                            <p className="text-sm font-medium text-gray-600">Laba Bersih</p>
                            <p className={`text-3xl font-bold mt-1 ${netPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                                {fmt(report.netProfit)}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                {netPositive ? 'Bisnis menghasilkan keuntungan' : 'Bisnis mengalami kerugian'} pada periode ini.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-4 text-sm">
                            <h3 className="font-semibold text-gray-800">Analisis Margin</h3>
                            {[
                                { label: 'Margin Kotor', value: `${grossPct}%`, color: parseFloat(grossPct) >= 0 ? 'text-emerald-600' : 'text-red-600' },
                                { label: 'Margin Bersih', value: `${netPct}%`, color: netPositive ? 'text-emerald-600' : 'text-red-600' },
                            ].map(m => (
                                <div key={m.label} className="flex justify-between items-center">
                                    <span className="text-gray-500">{m.label}</span>
                                    <span className={`font-bold ${m.color}`}>{m.value}</span>
                                </div>
                            ))}
                            <div className="pt-3 border-t border-gray-100 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Total Transaksi</span>
                                    <span className="font-bold">{report.totalTransactions}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Total Pendapatan</span>
                                    <span className="font-bold">{fmt(report.income)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Total HPP</span>
                                    <span className="font-bold text-red-600">{fmt(report.cogs)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Total Operasional</span>
                                    <span className="font-bold text-red-600">{fmt(report.totalExpense)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ReportProfitLoss.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Laporan', href: '/reports/sales' }, { title: 'Laba Rugi', href: '/reports/profit-loss' }]}>
        {page}
    </AppLayout>
);

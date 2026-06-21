import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { profitLoss } from '@/actions/App/Http/Controllers/Finance/FinanceController';

interface Outlet { id: string; name: string }
interface Report {
    income: number;
    cogs: number;
    grossProfit: number;
    totalExpense: number;
    netProfit: number;
    totalTransactions: number;
}

interface Props {
    outlets: Outlet[];
    startDate: string;
    endDate: string;
    outletId: string | null;
    report: Report | null;
}

export default function FinanceProfitLoss({ outlets, startDate, endDate, outletId, report }: Props) {
    const [start, setStart]     = useState(startDate);
    const [end, setEnd]         = useState(endDate);
    const [outlet, setOutlet]   = useState(outletId ?? 'all');

    const fmt = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    function handleApply(e: React.FormEvent) {
        e.preventDefault();
        router.get(profitLoss.url(), {
            start_date: start,
            end_date:   end,
            outlet_id:  outlet === 'all' ? undefined : outlet,
        }, { preserveState: true });
    }

    const netPositive = (report?.netProfit ?? 0) >= 0;

    function Row({ label, value, sub, bold, color }: { label: string; value: number; sub?: string; bold?: boolean; color?: string }) {
        return (
            <div className={`flex justify-between items-start py-3 ${bold ? 'border-t border-gray-200 mt-1' : ''}`}>
                <div>
                    <span className={`text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{label}</span>
                    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                </div>
                <span className={`text-sm font-semibold ${color ?? (bold ? 'text-gray-900' : 'text-gray-700')}`}>
                    {fmt(value)}
                </span>
            </div>
        );
    }

    return (
        <>
            <Head title="Laporan Laba Rugi" />
            <div className="flex flex-col gap-6 p-6">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Laporan Laba Rugi</h1>
                    <p className="text-sm text-muted-foreground mt-1">Hitung pendapatan, HPP, dan laba/rugi bersih untuk periode tertentu</p>
                </div>

                {/* Filter */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                    <form onSubmit={handleApply} className="flex flex-wrap gap-3 items-end">
                        <div className="space-y-1 w-full sm:w-44">
                            <label className="text-xs font-medium text-gray-600">Dari Tanggal</label>
                            <Input type="date" value={start} onChange={e => setStart(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-1 w-full sm:w-44">
                            <label className="text-xs font-medium text-gray-600">Sampai Tanggal</label>
                            <Input type="date" value={end} onChange={e => setEnd(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-1 w-full sm:w-52">
                            <label className="text-xs font-medium text-gray-600">Outlet</label>
                            <Select value={outlet} onValueChange={setOutlet}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Semua Outlet" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Outlet</SelectItem>
                                    {outlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Hitung L/R</Button>
                    </form>
                </div>

                {report ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Report */}
                        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold mb-1">Laporan Laba Rugi</h2>
                            <p className="text-xs text-gray-400 mb-6">
                                Periode: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(start))} –{' '}
                                {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(end))}
                                {outlet !== 'all' && ` · ${outlets.find(o => o.id === outlet)?.name}`}
                            </p>

                            <div className="divide-y divide-gray-100">
                                <Row label="Pendapatan (Omzet)" value={report.income}
                                    sub={`${report.totalTransactions} transaksi valid`} />
                                <Row label="HPP / Harga Pokok Penjualan" value={-report.cogs}
                                    sub="Biaya modal produk terjual" color="text-red-600" />
                                <Row label="Laba Kotor" value={report.grossProfit} bold
                                    color={report.grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600'} />
                                <Row label="Total Pengeluaran Operasional" value={-report.totalExpense}
                                    sub="Biaya operasional outlet" color="text-red-600" />
                                <Row label="Laba Bersih" value={report.netProfit} bold
                                    color={netPositive ? 'text-emerald-700' : 'text-red-700'} />
                            </div>
                        </div>

                        {/* Net Profit Highlight */}
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

                            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 space-y-3 text-sm">
                                <h3 className="font-semibold text-gray-800">Margin</h3>
                                <div className="flex justify-between text-gray-600">
                                    <span>Margin Kotor</span>
                                    <span className="font-medium">
                                        {report.income > 0 ? ((report.grossProfit / report.income) * 100).toFixed(1) : '0.0'}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Margin Bersih</span>
                                    <span className={`font-medium ${netPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {report.income > 0 ? ((report.netProfit / report.income) * 100).toFixed(1) : '0.0'}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-100">
                                    <span>Total Transaksi</span>
                                    <span className="font-medium">{report.totalTransactions}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">Pilih periode & klik "Hitung L/R"</h3>
                        <p className="text-xs text-gray-400 max-w-sm">
                            Laporan akan menampilkan pendapatan, HPP, dan laba bersih sesuai filter yang dipilih.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

FinanceProfitLoss.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Keuangan', href: '/finance/daily' }, { title: 'Laporan L/R', href: '/finance/profit-loss' }]}>
        {page}
    </AppLayout>
);

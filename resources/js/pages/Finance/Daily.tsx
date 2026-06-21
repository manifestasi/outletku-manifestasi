import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ArrowUp, BarChart3, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { daily } from '@/actions/App/Http/Controllers/Finance/FinanceController';

interface Outlet { id: string; name: string }
interface Summary {
    income: number;
    expense: number;
    netCash: number;
    totalTransactions: number;
}

interface Props {
    outlets: Outlet[];
    selectedOutlet: string | null;
    selectedDate: string;
    summary: Summary;
}

export default function FinanceDaily({ outlets, selectedOutlet, selectedDate, summary }: Props) {
    const [outletId, setOutletId] = useState(selectedOutlet ?? '');
    const [date, setDate]         = useState(selectedDate);

    const fmt = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    function handleApply(e: React.FormEvent) {
        e.preventDefault();
        router.get(daily.url(), { outlet_id: outletId || undefined, date }, { preserveState: true });
    }

    const netPositive = summary.netCash >= 0;

    return (
        <>
            <Head title="Ringkasan Keuangan Harian" />
            <div className="flex flex-col gap-6 p-6">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Ringkasan Harian</h1>
                    <p className="text-sm text-muted-foreground mt-1">Laporan pemasukan dan pengeluaran per outlet per hari</p>
                </div>

                {/* Filter */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                    <form onSubmit={handleApply} className="flex flex-wrap gap-3 items-end">
                        <div className="space-y-1 w-full sm:w-56">
                            <label className="text-xs font-medium text-gray-600">Outlet</label>
                            <Select value={outletId || 'none'} onValueChange={v => setOutletId(v === 'none' ? '' : v)}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Pilih outlet..." /></SelectTrigger>
                                <SelectContent>
                                    {outlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1 w-full sm:w-44">
                            <label className="text-xs font-medium text-gray-600">Tanggal</label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white" />
                        </div>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Tampilkan</Button>
                    </form>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Pemasukan</span>
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <ArrowUp className="w-5 h-5 text-emerald-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{fmt(summary.income)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Total penjualan valid</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Pengeluaran</span>
                            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                                <ArrowDown className="w-5 h-5 text-red-500" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{fmt(summary.expense)}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Total biaya operasional</p>
                        </div>
                    </div>

                    <div className={`rounded-xl border shadow-sm p-5 flex flex-col gap-3 ${netPositive ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Kas Bersih</span>
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${netPositive ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                <DollarSign className={`w-5 h-5 ${netPositive ? 'text-emerald-600' : 'text-red-600'}`} />
                            </div>
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${netPositive ? 'text-emerald-700' : 'text-red-700'}`}>{fmt(summary.netCash)}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Pemasukan − Pengeluaran</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Transaksi</span>
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{summary.totalTransactions}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Transaksi valid hari ini</p>
                        </div>
                    </div>
                </div>

                {/* Quick links */}
                <div className="flex flex-wrap gap-3">
                    <a href="/expenses" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        Daftar Pengeluaran
                    </a>
                    <a href="/finance/profit-loss" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        Laporan L/R
                    </a>
                    <a href="/cash-transfers" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        Transfer Kas
                    </a>
                </div>
            </div>
        </>
    );
}

FinanceDaily.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Keuangan', href: '/finance/daily' }, { title: 'Ringkasan Harian', href: '/finance/daily' }]}>
        {page}
    </AppLayout>
);

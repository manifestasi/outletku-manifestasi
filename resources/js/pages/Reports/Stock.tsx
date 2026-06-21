import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileSpreadsheet, FileText } from 'lucide-react';
import { useState } from 'react';
import {
    stock,
    exportStockExcel,
    exportStockPdf,
} from '@/actions/App/Http/Controllers/Reports/ReportController';

interface Outlet { id: string; name: string }
interface StockItem {
    id: string;
    quantity: number;
    low_stock_threshold: number;
    outlet: { name: string } | null;
    product: { name: string; sku: string | null } | null;
}
interface Movement {
    id: string;
    type: string;
    quantity_change: number;
    quantity_before: number;
    quantity_after: number;
    note: string | null;
    created_at: string;
    user: { name: string } | null;
    stock: { product: { name: string } | null; outlet: { name: string } | null } | null;
}
interface Filters { outletId: string | null; startDate: string; endDate: string }

interface Props {
    outlets: Outlet[];
    stocks: StockItem[];
    movements: Movement[];
    filters: Filters;
}

const MOVEMENT_TYPE: Record<string, { label: string; color: string }> = {
    restock:    { label: 'Restock',    color: 'bg-emerald-50 text-emerald-700' },
    sale:       { label: 'Penjualan',  color: 'bg-blue-50 text-blue-700' },
    adjustment: { label: 'Koreksi',    color: 'bg-amber-50 text-amber-700' },
    void:       { label: 'Void',       color: 'bg-gray-100 text-gray-600' },
};

export default function ReportStock({ outlets, stocks, movements, filters }: Props) {
    const [outletId, setOutletId] = useState(filters.outletId ?? 'all');
    const [startDate, setStartDate] = useState(filters.startDate);
    const [endDate, setEndDate]     = useState(filters.endDate);
    const [activeTab, setActiveTab] = useState<'current' | 'movements'>('current');

    function buildQuery() {
        return {
            outlet_id:  outletId === 'all' ? undefined : outletId,
            start_date: startDate,
            end_date:   endDate,
        };
    }

    function handleFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get(stock.url(), buildQuery(), { preserveState: true });
    }

    function exportUrl(fn: (opts?: any) => any) {
        const q = buildQuery();
        const params = new URLSearchParams(Object.fromEntries(Object.entries(q).filter(([_, v]) => v !== undefined)) as Record<string, string>);
        return fn.url() + (params.toString() ? '?' + params.toString() : '');
    }

    const lowStockCount = stocks.filter(s => s.quantity <= s.low_stock_threshold).length;

    return (
        <>
            <Head title="Laporan Stok" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan Stok</h1>
                        <p className="text-sm text-muted-foreground mt-1">Posisi stok saat ini dan histori pergerakan</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={exportUrl(exportStockExcel)} target="_blank">
                                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />Excel
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={exportUrl(exportStockPdf)} target="_blank">
                                <FileText className="w-4 h-4 mr-1.5 text-red-500" />PDF
                            </a>
                        </Button>
                    </div>
                </div>

                {lowStockCount > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        <span><strong>{lowStockCount} produk</strong> memiliki stok di bawah batas minimum — perlu diisi ulang.</span>
                    </div>
                )}

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
                            <label className="text-xs font-medium text-gray-600">Pergerakan Dari</label>
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white" />
                        </div>
                        <div className="space-y-1 w-full sm:w-40">
                            <label className="text-xs font-medium text-gray-600">Sampai</label>
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-white" />
                        </div>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Tampilkan</Button>
                    </form>
                </div>

                {/* Tabs */}
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        {(['current', 'movements'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab === 'current' ? `Posisi Stok (${stocks.length})` : `Pergerakan (${movements.length})`}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'current' ? (
                        stocks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">Produk</th>
                                            <th className="px-5 py-3 font-medium">SKU</th>
                                            <th className="px-5 py-3 font-medium">Outlet</th>
                                            <th className="px-5 py-3 font-medium text-right">Stok</th>
                                            <th className="px-5 py-3 font-medium text-right">Min. Stok</th>
                                            <th className="px-5 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {stocks.map(s => {
                                            const low = s.quantity <= s.low_stock_threshold;
                                            return (
                                                <tr key={s.id} className={`hover:bg-gray-50/80 transition-colors ${low ? 'bg-red-50/30' : ''}`}>
                                                    <td className="px-5 py-3 font-medium text-gray-900">{s.product?.name ?? '–'}</td>
                                                    <td className="px-5 py-3 text-gray-400 font-mono text-xs">{s.product?.sku ?? '–'}</td>
                                                    <td className="px-5 py-3 text-gray-600">{s.outlet?.name ?? '–'}</td>
                                                    <td className={`px-5 py-3 text-right font-bold ${low ? 'text-red-600' : 'text-gray-900'}`}>{s.quantity}</td>
                                                    <td className="px-5 py-3 text-right text-gray-400">{s.low_stock_threshold}</td>
                                                    <td className="px-5 py-3">
                                                        <Badge className={`${low ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'} border-none shadow-none text-[10px]`}>
                                                            {low ? 'Rendah' : 'Normal'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-14 text-center text-gray-400 text-sm">Tidak ada data stok</div>
                        )
                    ) : (
                        movements.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">Waktu</th>
                                            <th className="px-5 py-3 font-medium">Produk</th>
                                            <th className="px-5 py-3 font-medium">Outlet</th>
                                            <th className="px-5 py-3 font-medium">Tipe</th>
                                            <th className="px-5 py-3 font-medium text-right">Sebelum</th>
                                            <th className="px-5 py-3 font-medium text-right">Perubahan</th>
                                            <th className="px-5 py-3 font-medium text-right">Sesudah</th>
                                            <th className="px-5 py-3 font-medium">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {movements.map(m => {
                                            const typeInfo = MOVEMENT_TYPE[m.type] ?? { label: m.type, color: 'bg-gray-100 text-gray-600' };
                                            return (
                                                <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                        {new Date(m.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </td>
                                                    <td className="px-5 py-3 font-medium text-gray-900">{m.stock?.product?.name ?? '–'}</td>
                                                    <td className="px-5 py-3 text-gray-600">{m.stock?.outlet?.name ?? '–'}</td>
                                                    <td className="px-5 py-3">
                                                        <Badge className={`${typeInfo.color} border-none shadow-none text-[10px]`}>
                                                            {typeInfo.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-5 py-3 text-right text-gray-500">{m.quantity_before}</td>
                                                    <td className={`px-5 py-3 text-right font-bold ${m.quantity_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {m.quantity_change >= 0 ? '+' : ''}{m.quantity_change}
                                                    </td>
                                                    <td className="px-5 py-3 text-right font-semibold text-gray-900">{m.quantity_after}</td>
                                                    <td className="px-5 py-3 text-gray-400 text-xs max-w-[200px] truncate">{m.note ?? '–'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-14 text-center text-gray-400 text-sm">Tidak ada pergerakan stok pada periode ini</div>
                        )
                    )}
                </div>
            </div>
        </>
    );
}

ReportStock.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Laporan', href: '/reports/sales' }, { title: 'Stok', href: '/reports/stock' }]}>
        {page}
    </AppLayout>
);

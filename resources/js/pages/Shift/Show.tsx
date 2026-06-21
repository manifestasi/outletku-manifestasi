import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, ArrowLeft, Clock, Store, User } from 'lucide-react';
import { useState } from 'react';

interface Transaction {
    id: string;
    invoice_number: string;
    transaction_date: string;
    total: number;
    payment_method: string;
    is_void: boolean;
}

interface Shift {
    id: string;
    started_at: string;
    ended_at: string | null;
    starting_cash: number;
    ending_cash: number | null;
    expected_cash: number | null;
    notes: string | null;
    outlet: { id: string; name: string };
    user: { id: string; name: string };
    transactions: Transaction[];
}

interface ShiftShowProps {
    shift: Shift;
    cashSales: number;
    totalSales: number;
    transactionCount: number;
}

export default function ShiftShow({ shift, cashSales, totalSales, transactionCount }: ShiftShowProps) {
    const [isForceCloseOpen, setIsForceCloseOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        notes: '',
    });

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
            dateStyle: 'full',
            timeStyle: 'short',
        }).format(new Date(dateString));
    };

    const cashDifference =
        shift.ending_cash !== null && shift.expected_cash !== null
            ? shift.ending_cash - shift.expected_cash
            : null;

    const handleForceClose = () => {
        post(`/shifts/${shift.id}/force-close`, {
            onSuccess: () => {
                setIsForceCloseOpen(false);
                reset();
            },
        });
    };

    return (
        <>
            <Head title={`Shift ${shift.user.name}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/shifts">
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Detail Shift</h1>
                            <p className="text-sm text-gray-500 mt-0.5">{formatDateTime(shift.started_at)}</p>
                        </div>
                    </div>

                    {!shift.ended_at && (
                        <Dialog open={isForceCloseOpen} onOpenChange={setIsForceCloseOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="bg-red-600">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Force Close
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Force Close Shift</DialogTitle>
                                </DialogHeader>
                                <p className="text-sm text-gray-500 mt-2">
                                    Shift kasir <span className="font-semibold">{shift.user.name}</span> di{' '}
                                    <span className="font-semibold">{shift.outlet.name}</span> akan ditutup paksa.
                                    Kas akhir akan diset ke nilai expected cash.
                                </p>
                                <div className="space-y-2 mt-4">
                                    <label className="text-sm font-medium text-gray-700">Catatan (opsional)</label>
                                    <Textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Alasan force close..."
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <Button variant="ghost" onClick={() => setIsForceCloseOpen(false)}>
                                        Batal
                                    </Button>
                                    <Button
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                        onClick={handleForceClose}
                                        disabled={processing}
                                    >
                                        {processing ? 'Memproses...' : 'Ya, Force Close'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold mb-4">Informasi Shift</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <User className="w-5 h-5 text-indigo-500" />
                                    <div>
                                        <p className="text-gray-500">Kasir</p>
                                        <p className="font-semibold text-gray-900">{shift.user.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <Store className="w-5 h-5 text-indigo-500" />
                                    <div>
                                        <p className="text-gray-500">Outlet</p>
                                        <p className="font-semibold text-gray-900">{shift.outlet.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <Clock className="w-5 h-5 text-indigo-500" />
                                    <div>
                                        <p className="text-gray-500">Mulai</p>
                                        <p className="font-semibold text-gray-900">{formatDateTime(shift.started_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                    <Clock className="w-5 h-5 text-indigo-500" />
                                    <div>
                                        <p className="text-gray-500">Selesai</p>
                                        <p className="font-semibold text-gray-900">
                                            {shift.ended_at ? formatDateTime(shift.ended_at) : 'Masih berjalan'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {shift.notes && (
                                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm text-amber-800">
                                    {shift.notes}
                                </div>
                            )}
                        </div>

                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-bold">Transaksi Shift</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3">Waktu</th>
                                            <th className="px-4 py-3">Invoice</th>
                                            <th className="px-4 py-3">Bayar</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shift.transactions.length > 0 ? (
                                            shift.transactions.map((trx) => (
                                                <tr key={trx.id} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                                                        {formatDateTime(trx.transaction_date)}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <Link
                                                            href={`/transactions/${trx.id}`}
                                                            className="font-medium text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            {trx.invoice_number}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-4 text-gray-600 capitalize">
                                                        {trx.payment_method === 'cash' ? 'Tunai' : trx.payment_method}
                                                    </td>
                                                    <td className="px-4 py-4 text-right font-medium">
                                                        {formatCurrency(trx.total)}
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {trx.is_void ? (
                                                            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-none">
                                                                Void
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">
                                                                Valid
                                                            </Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                    Belum ada transaksi pada shift ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">Status</h2>
                                {!shift.ended_at ? (
                                    <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-none shadow-none">
                                        Berjalan
                                    </Badge>
                                ) : (
                                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">
                                        Selesai
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Jumlah Transaksi</span>
                                    <span className="font-medium">{transactionCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Total Penjualan</span>
                                    <span className="font-medium">{formatCurrency(totalSales)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Penjualan Tunai</span>
                                    <span className="font-medium">{formatCurrency(cashSales)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 text-white border border-gray-800 rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold mb-4">Rekap Kas</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Kas Awal</span>
                                    <span>{formatCurrency(shift.starting_cash)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Penjualan Tunai</span>
                                    <span>{formatCurrency(cashSales)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-700">
                                    <span className="text-gray-400">Expected Cash</span>
                                    <span className="font-semibold">
                                        {formatCurrency(shift.expected_cash ?? shift.starting_cash + cashSales)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Kas Akhir</span>
                                    <span>{formatCurrency(shift.ending_cash)}</span>
                                </div>
                                {cashDifference !== null && (
                                    <div
                                        className={`flex justify-between pt-2 border-t border-gray-700 font-bold ${
                                            Math.abs(cashDifference) >= 10000
                                                ? 'text-red-400'
                                                : cashDifference === 0
                                                  ? 'text-emerald-400'
                                                  : 'text-amber-400'
                                        }`}
                                    >
                                        <span>Selisih</span>
                                        <span>{formatCurrency(cashDifference)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ShiftShow.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Shift Kasir', href: '/shifts' }]}>
        {page}
    </AppLayout>
);

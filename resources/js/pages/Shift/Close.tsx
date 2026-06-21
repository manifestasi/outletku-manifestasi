import { Head, Link, useForm } from '@inertiajs/react';
import KasirLayout from '@/layouts/kasir-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LogOut, Calculator } from 'lucide-react';
import { useMemo } from 'react';

interface Shift {
    id: string;
    started_at: string;
    starting_cash: number;
}

interface ShiftCloseProps {
    shift: Shift;
    cashSales: number;
    expectedCash: number;
}

export default function ShiftClose({ shift, cashSales, expectedCash }: ShiftCloseProps) {
    const { data, setData, post, processing, errors } = useForm({
        ending_cash: expectedCash.toString(),
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/shift/close');
    };

    const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        setData('ending_cash', val || '0');
    };

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount));
    };

    const difference = useMemo(() => {
        return Number(data.ending_cash) - expectedCash;
    }, [data.ending_cash, expectedCash]);

    return (
        <KasirLayout title="Tutup Shift">
            <Head title="Tutup Shift Kasir" />

            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-8 relative">
                
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calculator className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Rekapitulasi Shift</h1>
                    <p className="text-slate-400 text-sm">Hitung uang di laci fisik dan sesuaikan dengan catatan sistem sebelum menutup shift.</p>
                </div>

                <div className="bg-slate-950 rounded-xl p-5 mb-6 space-y-3 border border-slate-800">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Modal Awal</span>
                        <span className="font-medium">{formatCurrency(shift.starting_cash)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Penjualan Tunai</span>
                        <span className="font-medium text-emerald-400">+{formatCurrency(cashSales)}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-slate-300 font-medium">Ekspektasi Sistem</span>
                        <span className="font-bold text-lg">{formatCurrency(expectedCash)}</span>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex justify-between">
                            Uang Fisik Aktual
                            <span className={`text-xs ${difference === 0 ? 'text-slate-500' : difference > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                Selisih: {formatCurrency(difference)}
                            </span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={new Intl.NumberFormat('id-ID').format(Number(data.ending_cash))}
                                onChange={handleCashChange}
                                className={`pl-12 h-14 text-lg font-bold bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 text-white ${difference !== 0 ? 'border-red-500/50 focus-visible:ring-red-500' : ''}`}
                            />
                        </div>
                        {errors.ending_cash && <p className="text-red-400 text-sm">{errors.ending_cash}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Catatan Akhir (Opsional)</label>
                        <Textarea 
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder={difference !== 0 ? "Tulis penjelasan terkait selisih uang..." : "Catatan selama shift..."}
                            className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 text-white min-h-[80px]"
                        />
                        {errors.notes && <p className="text-red-400 text-sm">{errors.notes}</p>}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button 
                            type="button" 
                            variant="outline"
                            asChild
                            className="flex-1 h-12 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            <Link href="/pos">Kembali ke POS</Link>
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
                        >
                            {processing ? 'Memproses...' : 'Tutup Shift'}
                        </Button>
                    </div>
                </form>
            </div>
        </KasirLayout>
    );
}

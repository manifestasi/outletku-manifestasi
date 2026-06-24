import { Head, Link, useForm } from '@inertiajs/react';
import KasirLayout from '@/layouts/kasir-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Banknote } from 'lucide-react';

export default function ShiftOpen() {
    const { data, setData, post, processing, errors } = useForm({
        starting_cash: '0',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/shift/open');
    };

    const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only numbers
        const val = e.target.value.replace(/\D/g, '');
        setData('starting_cash', val || '0');
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('id-ID').format(Number(amount));
    };

    return (
        <KasirLayout title="Buka Shift">
            <Head title="Buka Shift Kasir" />

            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 relative">
                
                <div className="absolute top-6 right-6">
                    <Link href="/kasir/logout" method="post" as="button" className="text-slate-500 hover:text-red-400 flex items-center text-sm transition-colors">
                        <LogOut className="w-4 h-4 mr-2" /> Keluar
                    </Link>
                </div>

                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Banknote className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Buka Laci Kasir</h1>
                    <p className="text-slate-400 text-sm">Masukkan jumlah uang tunai fisik yang ada di laci saat ini sebelum mulai bertransaksi.</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Uang Modal (Kas Awal)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                            <Input
                                type="text"
                                inputMode="numeric"
                                value={formatCurrency(data.starting_cash)}
                                onChange={handleCashChange}
                                className="pl-12 h-14 text-lg font-bold bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 text-white"
                                placeholder="0"
                            />
                        </div>
                        {errors.starting_cash && <p className="text-red-400 text-sm">{errors.starting_cash}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {['50000', '100000', '200000'].map((amount) => (
                            <button
                                key={amount}
                                type="button"
                                onClick={() => setData('starting_cash', amount)}
                                className="py-2 px-3 rounded-lg border border-slate-700 bg-slate-800 text-sm font-medium hover:bg-slate-700 hover:border-slate-600 transition-colors"
                            >
                                {formatCurrency(amount)}
                            </button>
                        ))}
                    </div>

                    <Button 
                        type="submit" 
                        isLoading={processing} 
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold"
                    >
                        {processing ? 'Memproses...' : 'Mulai Shift'}
                    </Button>
                </form>
            </div>
        </KasirLayout>
    );
}

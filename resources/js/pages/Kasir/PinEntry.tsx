import { Head, Link, useForm } from '@inertiajs/react';
import KasirLayout from '@/layouts/kasir-layout';
import { UserCircle2, ArrowLeft, Delete } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Business {
    name: string;
    slug: string;
}

interface Outlet {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
    avatar: string | null;
}

interface PinEntryProps {
    business: Business;
    outlet: Outlet;
    user: User;
}

export default function PinEntry({ business, outlet, user }: PinEntryProps) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        pin: '',
    });

    const [pinDisplay, setPinDisplay] = useState<string[]>(Array(6).fill(''));

    // Sync pinDisplay with data.pin
    useEffect(() => {
        const newPinDisplay = Array(6).fill('');
        for (let i = 0; i < data.pin.length; i++) {
            newPinDisplay[i] = '*'; // Mask the PIN
        }
        setPinDisplay(newPinDisplay);

        if (data.pin.length === 6) {
            submit();
        }
    }, [data.pin]);

    const handleNumberClick = (num: number) => {
        if (processing) return;
        if (errors.pin) clearErrors('pin');
        
        if (data.pin.length < 6) {
            setData('pin', data.pin + num.toString());
        }
    };

    const handleDelete = () => {
        if (processing) return;
        if (errors.pin) clearErrors('pin');

        if (data.pin.length > 0) {
            setData('pin', data.pin.slice(0, -1));
        }
    };

    const submit = () => {
        post(`/kasir/${business.slug}/${outlet.id}/${user.id}/pin`, {
            preserveScroll: true,
            onError: () => {
                setData('pin', '');
            }
        });
    };

    return (
        <KasirLayout title={outlet.name}>
            <Head title={`Masukkan PIN - ${user.name}`} />

            <div className="w-full max-w-sm relative mx-auto">
                <Link 
                    href={`/kasir/${business.slug}/${outlet.id}`}
                    className="absolute -top-16 left-0 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Batal
                </Link>

                <div className="flex flex-col items-center mb-8">
                    {user.avatar ? (
                        <img 
                            src={`/storage/${user.avatar}`} 
                            alt={user.name} 
                            className="w-20 h-20 rounded-full object-cover border-4 border-slate-800 mb-4"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-800 mb-4">
                            <UserCircle2 className="w-10 h-10 text-slate-500" />
                        </div>
                    )}
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-slate-400 text-sm mt-1">Masukkan PIN 6 digit Anda</p>
                </div>

                {/* PIN Dots */}
                <div className="flex justify-center gap-3 mb-8">
                    {pinDisplay.map((digit, index) => (
                        <div 
                            key={index} 
                            className={`w-4 h-4 rounded-full transition-all ${
                                digit ? 'bg-indigo-500 scale-110' : 'bg-slate-800'
                            } ${errors.pin ? 'bg-red-500' : ''}`}
                        />
                    ))}
                </div>

                {errors.pin && (
                    <div className="text-red-400 text-center text-sm mb-6 font-medium animate-pulse">
                        {errors.pin}
                    </div>
                )}

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => handleNumberClick(num)}
                            disabled={processing}
                            className="h-16 rounded-2xl bg-slate-900 border border-slate-800 text-2xl font-semibold hover:bg-slate-800 hover:border-indigo-500 transition-colors active:bg-slate-700 disabled:opacity-50"
                        >
                            {num}
                        </button>
                    ))}
                    
                    <div className="col-start-2">
                        <button
                            type="button"
                            onClick={() => handleNumberClick(0)}
                            disabled={processing}
                            className="w-full h-16 rounded-2xl bg-slate-900 border border-slate-800 text-2xl font-semibold hover:bg-slate-800 hover:border-indigo-500 transition-colors active:bg-slate-700 disabled:opacity-50"
                        >
                            0
                        </button>
                    </div>

                    <div className="col-start-3">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={processing || data.pin.length === 0}
                            className="w-full h-16 rounded-2xl bg-slate-900/50 border border-slate-800 text-2xl font-semibold flex items-center justify-center hover:bg-slate-800 hover:border-red-500/50 hover:text-red-400 transition-colors active:bg-slate-700 disabled:opacity-50"
                        >
                            <Delete className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </KasirLayout>
    );
}

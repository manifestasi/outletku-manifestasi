import { Head, Link } from '@inertiajs/react';
import KasirLayout from '@/layouts/kasir-layout';
import { Store } from 'lucide-react';

interface Business {
    name: string;
    slug: string;
}

interface Outlet {
    id: string;
    name: string;
    address: string | null;
}

interface SelectOutletProps {
    business: Business;
    outlets: Outlet[];
}

export default function SelectOutlet({ business, outlets }: SelectOutletProps) {
    return (
        <KasirLayout title="Pilih Outlet">
            <Head title={`Pilih Outlet - ${business.name}`} />

            <div className="w-full max-w-3xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-2">Selamat Datang di {business.name}</h1>
                    <p className="text-slate-400">Silakan pilih outlet tempat Anda bertugas hari ini.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {outlets.map((outlet) => (
                        <Link
                            key={outlet.id}
                            href={`/kasir/${business.slug}/${outlet.id}`}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500 hover:bg-slate-800/80 transition-all group flex flex-col items-center text-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                                <Store className="w-8 h-8 text-slate-400 group-hover:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-200 group-hover:text-white">{outlet.name}</h3>
                                {outlet.address && (
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{outlet.address}</p>
                                )}
                            </div>
                        </Link>
                    ))}

                    {outlets.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            Belum ada outlet yang aktif.
                        </div>
                    )}
                </div>
            </div>
        </KasirLayout>
    );
}

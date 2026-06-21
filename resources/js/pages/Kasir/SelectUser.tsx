import { Head, Link } from '@inertiajs/react';
import KasirLayout from '@/layouts/kasir-layout';
import { UserCircle2, ArrowLeft } from 'lucide-react';

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

interface SelectUserProps {
    business: Business;
    outlet: Outlet;
    users: User[];
}

export default function SelectUser({ business, outlet, users }: SelectUserProps) {
    return (
        <KasirLayout title={outlet.name}>
            <Head title={`Pilih Kasir - ${outlet.name}`} />

            <div className="w-full max-w-2xl relative">
                <Link 
                    href={`/kasir/${business.slug}`}
                    className="absolute -top-16 left-0 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Link>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-2">Pilih Profil Anda</h1>
                    <p className="text-slate-400">Pilih nama Anda untuk melanjutkan ke layar PIN.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <Link
                            key={user.id}
                            href={`/kasir/${business.slug}/${outlet.id}/${user.id}/pin`}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500 hover:bg-slate-800/80 transition-all group flex flex-col items-center text-center gap-4"
                        >
                            {user.avatar ? (
                                <img 
                                    src={`/storage/${user.avatar}`} 
                                    alt={user.name} 
                                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-800 group-hover:border-indigo-500/50 transition-colors"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                                    <UserCircle2 className="w-10 h-10 text-slate-500 group-hover:text-indigo-400" />
                                </div>
                            )}
                            <h3 className="font-semibold text-slate-200 group-hover:text-white line-clamp-1">{user.name}</h3>
                        </Link>
                    ))}

                    {users.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            Belum ada staf kasir yang ditugaskan ke outlet ini.
                        </div>
                    )}
                </div>
            </div>
        </KasirLayout>
    );
}

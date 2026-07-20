import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import type { Outlet } from '@/types/outletku';
import type { User } from '@/types/auth';

type Props = {
    outlet: Outlet;
    availableUsers: User[];
    assignedUserIds: string[];
};

export default function OutletsEdit({ outlet, availableUsers, assignedUserIds }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: outlet.name,
        address: outlet.address ?? '',
        phone: outlet.phone ?? '',
        is_active: outlet.is_active,
        user_ids: assignedUserIds as string[],
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/outlets/${outlet.id}`);
    }

    function toggleUser(userId: string) {
        setData('user_ids', data.user_ids.includes(userId)
            ? data.user_ids.filter((id) => id !== userId)
            : [...data.user_ids, userId]
        );
    }

    return (
        <>
            <Head title={`Edit ${outlet.name} — OutletKu`} />
            <div className="flex flex-col gap-6 p-6 max-w-xl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <a href="/outlets" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Outlet</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">{outlet.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Info Outlet */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
                        <h2 className="font-semibold text-gray-800 text-sm">Informasi Outlet</h2>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Outlet <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama outlet"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Alamat</Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Jl. Contoh No. 1, Kota..."
                                rows={3}
                            />
                            <InputError message={errors.address} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Nomor Telepon</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="021-xxxxxxxx"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        <div className="flex items-center justify-between py-1">
                            <div>
                                <Label htmlFor="is_active" className="cursor-pointer">Status Outlet</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Non-aktifkan outlet jika sedang tidak beroperasi
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(v) => setData('is_active', v)}
                            />
                        </div>
                    </div>

                    {/* Assign Users */}
                    {availableUsers.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <h2 className="font-semibold text-gray-800 text-sm mb-4">Kasir Terdaftar</h2>
                            <div className="flex flex-col gap-2">
                                {availableUsers.map((user) => {
                                    const isAssigned = data.user_ids.includes(user.id);
                                    const role = user.roles?.[0]?.name ?? '–';
                                    return (
                                        <label
                                            key={user.id}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isAssigned}
                                                onChange={() => toggleUser(user.id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-400 capitalize">{role}</p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 flex-1"
                            isLoading={processing}
                        >
                            
                            Simpan Perubahan
                        </Button>
                        <a href="/outlets">
                            <Button type="button" variant="outline">Batal</Button>
                        </a>
                    </div>
                </form>
            </div>
        </>
    );
}

OutletsEdit.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Outlet', href: '/outlets' },
        { title: 'Edit Outlet', href: '#' },
    ]}>
        {page}
    </AppLayout>
);

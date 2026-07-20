import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import type { Outlet } from '@/types/outletku';

type Props = {
    outlets: Pick<Outlet, 'id' | 'name'>[];
};

export default function UsersCreate({ outlets }: Props) {
    const [showPin, setShowPin] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        role: '',
        email: '',
        phone: '',
        password: '',
        pin: '',
        outlet_ids: [] as string[],
    });

    const isCashier = data.role === 'cashier';

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/users');
    }

    function toggleOutlet(outletId: string) {
        setData('outlet_ids', data.outlet_ids.includes(outletId)
            ? data.outlet_ids.filter((id) => id !== outletId)
            : [...data.outlet_ids, outletId]
        );
    }

    return (
        <>
            <Head title="Tambah User — OutletKu" />
            <div className="flex flex-col gap-6 p-6 max-w-xl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <a href="/users" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tambah User</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Tambah anggota tim atau kasir baru</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
                        <h2 className="font-semibold text-gray-800 text-sm">Informasi User</h2>

                        {/* Role (first, affects other fields) */}
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                            <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Pilih role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="cashier">Kasir (login via PIN)</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role} />
                        </div>

                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama lengkap"
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Phone */}
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Nomor HP</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="08xxxxxxxxxx"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        {/* Non-cashier: Email + Password */}
                        {!isCashier && data.role !== '' && (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required={!isCashier}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required={!isCashier}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Min. 8 karakter"
                                    />
                                    <InputError message={errors.password} />
                                </div>
                            </>
                        )}

                        {/* Cashier: PIN */}
                        {isCashier && (
                            <div className="grid gap-2">
                                <Label htmlFor="pin">PIN Kasir (6 digit) <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        id="pin"
                                        type={showPin ? 'text' : 'password'}
                                        inputMode="numeric"
                                        pattern="[0-9]{6}"
                                        maxLength={6}
                                        required
                                        value={data.pin}
                                        onChange={(e) => setData('pin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="6 digit PIN"
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPin(!showPin)}
                                    >
                                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.pin} />
                            </div>
                        )}
                    </div>

                    {/* Assign to Outlet */}
                    {outlets.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <h2 className="font-semibold text-gray-800 text-sm mb-4">
                                Assign ke Outlet{' '}
                                {isCashier && <span className="text-xs font-normal text-gray-400">(wajib untuk kasir)</span>}
                            </h2>
                            <div className="flex flex-col gap-2">
                                {outlets.map((outlet) => (
                                    <label
                                        key={outlet.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.outlet_ids.includes(outlet.id)}
                                            onChange={() => toggleOutlet(outlet.id)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-800">{outlet.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 flex-1"
                            isLoading={processing} disabled={processing || !data.role}
                        >
                            
                            Simpan User
                        </Button>
                        <a href="/users">
                            <Button type="button" variant="outline">Batal</Button>
                        </a>
                    </div>
                </form>
            </div>
        </>
    );
}

UsersCreate.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tim & Kasir', href: '/users' },
        { title: 'Tambah User', href: '/users/create' },
    ]}>
        {page}
    </AppLayout>
);

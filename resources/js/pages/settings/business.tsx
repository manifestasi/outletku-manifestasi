import { Head, useForm } from '@inertiajs/react';
import { Building2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { Business } from '@/types/outletku';

type Props = {
    business: Business;
};

export default function SettingsBusiness({ business }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        business.logo ? `/storage/${business.logo}` : null
    );

    const { data, setData, put, processing, errors } = useForm({
        name: business.name,
        phone: business.phone ?? '',
        address: business.address ?? '',
        logo: null as File | null,
    });

    function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('logo', file);
        setLogoPreview(URL.createObjectURL(file));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put('/settings/business', {
            forceFormData: true,
        });
    }

    return (
        <>
            <Head title="Pengaturan Bisnis — OutletKu" />
            <div className="flex flex-col gap-6 p-6 max-w-xl">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pengaturan Bisnis</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Kelola informasi bisnis kamu
                    </p>
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col gap-5">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
                        {/* Logo */}
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-8 h-8 text-gray-300" />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium text-gray-700">Logo Bisnis</p>
                                <p className="text-xs text-gray-400">JPEG, PNG, atau WebP. Maks 2MB.</p>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    name="logo"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={handleLogoChange}
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 w-fit"
                                    onClick={() => fileRef.current?.click()}
                                >
                                    <Upload className="w-4 h-4" />
                                    Ganti Logo
                                </Button>
                                <InputError message={errors.logo} />
                            </div>
                        </div>

                        {/* Business name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Bisnis <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama bisnis kamu"
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Phone */}
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Nomor Telepon Bisnis</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="08xxxxxxxxxx"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        {/* Address */}
                        <div className="grid gap-2">
                            <Label htmlFor="address">Alamat Bisnis</Label>
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Alamat lengkap bisnis..."
                                rows={3}
                            />
                            <InputError message={errors.address} />
                        </div>

                        {/* Info: read-only fields */}
                        <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="font-medium text-gray-500">Slug URL Kasir:</span>
                                <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                    /kasir/{business.slug}
                                </code>
                            </div>
                            <p className="text-xs text-gray-400">
                                Slug tidak dapat diubah setelah dibuat untuk menjaga konsistensi URL kasir.
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 w-full"
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Simpan Pengaturan
                    </Button>
                </form>
            </div>
        </>
    );
}

SettingsBusiness.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pengaturan Bisnis', href: '/settings/business' },
    ]}>
        {page}
    </AppLayout>
);

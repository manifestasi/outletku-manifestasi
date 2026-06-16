import { Form, Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { store as outletsStore } from '@/actions/App/Http/Controllers/Outlet/OutletController';

export default function OutletsCreate() {
    return (
        <>
            <Head title="Tambah Outlet — OutletKu" />
            <div className="flex flex-col gap-6 p-6 max-w-xl">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <a href="/outlets" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tambah Outlet</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Isi informasi outlet baru
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <Form {...outletsStore.form()} className="flex flex-col gap-5">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama Outlet <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        autoFocus
                                        placeholder="Contoh: Warung Barokah - Pusat"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Alamat</Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        placeholder="Jl. Contoh No. 1, Kota..."
                                        rows={3}
                                    />
                                    <InputError message={errors.address} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Nomor Telepon</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="021-xxxxxxxx"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-700 flex-1"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Simpan Outlet
                                    </Button>
                                    <a href="/outlets">
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </a>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

OutletsCreate.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Outlet', href: '/outlets' },
        { title: 'Tambah Outlet', href: '/outlets/create' },
    ]}>
        {page}
    </AppLayout>
);

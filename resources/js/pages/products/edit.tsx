import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';
import InputError from '@/components/input-error';

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    sku: string | null;
    unit: string;
    selling_price: number;
    cost_price: number;
    image: string | null;
    is_active: boolean;
    category_id: string | null;
}

export default function ProductEdit({ categories, product }: { categories: Category[], product: Product }) {
    const { data, setData, post, processing, errors } = useForm({
        name: product?.name || '',
        category_id: product?.category_id || '',
        sku: product?.sku || '',
        unit: product?.unit || '',
        selling_price: product?.selling_price?.toString() || '',
        cost_price: product?.cost_price?.toString() || '',
        image: null as File | null,
        is_active: product?.is_active ?? true,
        _method: 'PUT', // For file uploads in Laravel with PUT
    });

    if (!product) {
        return <div className="p-6">Loading or Product not found...</div>;
    }

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(`/products/${product.id}`);
    };

    return (
        <>
            <Head title={`Edit Produk: ${product.name}`} />

            <div className="max-w-3xl mx-auto p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/products">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
                </div>

                <form onSubmit={submit} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nama Produk <span className="text-red-500">*</span></label>
                            <Input value={data.name} onChange={e => setData('name', e.target.value)} required />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Kategori</label>
                            <Select value={data.category_id} onValueChange={v => setData('category_id', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">-- Tanpa Kategori --</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category_id} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">SKU (Kode Barang)</label>
                            <Input value={data.sku} onChange={e => setData('sku', e.target.value)} />
                            <InputError message={errors.sku} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Satuan (Unit) <span className="text-red-500">*</span></label>
                            <Input value={data.unit} onChange={e => setData('unit', e.target.value)} required placeholder="pcs, porsi, botol" />
                            <InputError message={errors.unit} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Harga Jual (Rp) <span className="text-red-500">*</span></label>
                            <Input type="number" min="0" value={data.selling_price} onChange={e => setData('selling_price', e.target.value)} required />
                            <InputError message={errors.selling_price} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Harga Modal / HPP (Rp) <span className="text-red-500">*</span></label>
                            <Input type="number" min="0" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} required />
                            <InputError message={errors.cost_price} />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm font-medium">Gambar Produk Baru (Opsional)</label>
                            <Input type="file" accept="image/*" onChange={e => setData('image', e.target.files ? e.target.files[0] : null)} />
                            <InputError message={errors.image} />
                            {product.image && (
                                <p className="text-xs text-gray-500 mt-2">Biarkan kosong jika tidak ingin mengubah gambar.</p>
                            )}
                        </div>

                        <div className="col-span-1 md:col-span-2 flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                            <Switch checked={data.is_active} onCheckedChange={v => setData('is_active', v)} id="is-active" />
                            <label htmlFor="is-active" className="text-sm font-medium cursor-pointer">
                                {data.is_active ? 'Produk Aktif' : 'Produk Nonaktif'}
                                <p className="text-xs text-gray-500 font-normal">Produk nonaktif tidak akan muncul di halaman kasir POS.</p>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <Button type="button" variant="ghost" className="mr-4" asChild>
                            <Link href="/products">Batal</Link>
                        </Button>
                        <Button type="submit" isLoading={processing} className="bg-indigo-600 hover:bg-indigo-700">
                            <Save className="w-4 h-4 mr-2" />
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ProductEdit.layout = (page: any) => {
    const product = page.props?.product || {};
    return (
        <AppLayout breadcrumbs={[
            { title: 'Produk', href: '/products' },
            { title: 'Edit Produk', href: `/products/${product.id || ''}/edit` }
        ]}>
            {page}
        </AppLayout>
    );
};

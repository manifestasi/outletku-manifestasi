import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

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
    category?: Category;
}

interface PaginationData {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
}

interface IndexProps {
    products: PaginationData;
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
    };
}

export default function ProductIndex({ products, categories, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const handleDelete = (product: Product) => {
        setProductToDelete(product);
    };

    const confirmDelete = () => {
        if (productToDelete) {
            router.delete(`/products/${productToDelete.id}`, {
                onSuccess: () => setProductToDelete(null),
                preserveScroll: true,
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/products', { search, category_id: categoryId === 'all' ? undefined : categoryId }, { preserveState: true });
    };

    const handleCategoryFilter = (value: string) => {
        setCategoryId(value);
        router.get('/products', { search, category_id: value === 'all' ? undefined : value }, { preserveState: true });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <>
            <Head title="Manajemen Produk" />

            <div className="flex flex-col space-y-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Daftar Produk</h1>
                    <div className="flex items-center space-x-2">
                        <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
                            <Link href="/products/create">
                                <Plus className="w-4 h-4 mr-2" /> Tambah Produk
                            </Link>
                        </Button>
                    </div>
                </div>

                <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-gray-500 mt-2">
                            Apakah Anda yakin ingin menonaktifkan produk <span className="font-semibold text-gray-900">"{productToDelete?.name}"</span>? 
                            Produk tidak akan muncul lagi di kasir POS.
                        </p>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button type="button" variant="ghost" onClick={() => setProductToDelete(null)}>Batal</Button>
                            <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Ya, Hapus</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input 
                                type="text" 
                                placeholder="Cari nama produk atau SKU..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-64">
                            <Select value={categoryId} onValueChange={handleCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" variant="secondary"><Search className="w-4 h-4 mr-2"/> Cari</Button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">Produk</th>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3">SKU</th>
                                    <th className="px-4 py-3 text-right">Harga Jual</th>
                                    <th className="px-4 py-3 text-right">HPP</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.length > 0 ? products.data.map(product => (
                                    <tr key={product.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-4 font-medium text-gray-900">
                                            {product.name}
                                            <div className="text-xs text-gray-500">Unit: {product.unit}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {product.category ? (
                                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100">{product.category.name}</Badge>
                                            ) : (
                                                <span className="text-gray-400 italic">Tanpa Kategori</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">{product.sku || '-'}</td>
                                        <td className="px-4 py-4 text-right font-medium">{formatCurrency(product.selling_price)}</td>
                                        <td className="px-4 py-4 text-right text-gray-600">{formatCurrency(product.cost_price)}</td>
                                        <td className="px-4 py-4 text-center">
                                            {product.is_active ? (
                                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">Aktif</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-500">Nonaktif</Badge>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600" asChild>
                                                    <Link href={`/products/${product.id}/edit`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                {product.is_active && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                                                        onClick={() => handleDelete(product)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                            Tidak ada produk ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {products.links.length > 3 && (
                        <div className="flex items-center justify-center space-x-1 mt-6">
                            {products.links.map((link, i) => (
                                link.url ? (
                                    <Link 
                                        key={i} 
                                        href={link.url} 
                                        className={`px-3 py-1 border rounded-md text-sm ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span key={i} className="px-3 py-1 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ProductIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Produk', href: '/products' }]}>
        {page}
    </AppLayout>
);

import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, FormEvent } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';

interface Category {
    id: string;
    name: string;
}

interface PaginationData {
    data: Category[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
}

interface IndexProps {
    categories: PaginationData;
    filters: {
        search?: string;
    };
}

export default function CategoryIndex({ categories, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    
    // Create state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, errors: createErrors, reset: createReset } = useForm({
        name: ''
    });

    // Edit state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, errors: editErrors, reset: editReset } = useForm({
        name: ''
    });

    // Delete state
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/categories', { search }, { preserveState: true });
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();
        postCreate('/categories', {
            onSuccess: () => {
                createReset();
                setIsCreateModalOpen(false);
            }
        });
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setEditData('name', category.name);
        setIsEditModalOpen(true);
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;
        
        putEdit(`/categories/${editingCategory.id}`, {
            onSuccess: () => {
                editReset();
                setIsEditModalOpen(false);
                setEditingCategory(null);
            }
        });
    };

    const handleDelete = (category: Category) => {
        setCategoryToDelete(category);
    };

    const confirmDelete = () => {
        if (categoryToDelete) {
            router.delete(`/categories/${categoryToDelete.id}`, {
                onSuccess: () => setCategoryToDelete(null)
            });
        }
    };

    return (
        <>
            <Head title="Manajemen Kategori" />

            <div className="flex flex-col space-y-6 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kategori Produk</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola daftar kategori untuk mengelompokkan produk Anda.</p>
                    </div>
                    
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Kategori Baru</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submitCreate} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Nama Kategori</label>
                                    <Input
                                        value={createData.name}
                                        onChange={e => setCreateData('name', e.target.value)}
                                        placeholder="Contoh: Minuman, Makanan Ringan"
                                        className="mt-1"
                                    />
                                    <InputError message={createErrors.name} className="mt-1" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={createProcessing} className="bg-indigo-600 hover:bg-indigo-700">Simpan</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={(open) => {
                    setIsEditModalOpen(open);
                    if (!open) {
                        setEditingCategory(null);
                        editReset();
                    }
                }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Kategori</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Nama Kategori</label>
                                <Input
                                    value={editData.name}
                                    onChange={e => setEditData('name', e.target.value)}
                                    placeholder="Contoh: Minuman, Makanan Ringan"
                                    className="mt-1"
                                />
                                <InputError message={editErrors.name} className="mt-1" />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                                <Button type="submit" disabled={editProcessing} className="bg-indigo-600 hover:bg-indigo-700">Simpan Perubahan</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-gray-500 mt-2">
                            Apakah Anda yakin ingin menghapus kategori <span className="font-semibold text-gray-900">"{categoryToDelete?.name}"</span>? 
                            Ini tidak akan menghapus produk yang berada di bawah kategori ini.
                        </p>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button type="button" variant="ghost" onClick={() => setCategoryToDelete(null)}>Batal</Button>
                            <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>Ya, Hapus</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-6 max-w-md">
                        <Input 
                            type="text" 
                            placeholder="Cari nama kategori..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" variant="secondary"><Search className="w-4 h-4 mr-2"/> Cari</Button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">Nama Kategori</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.data.length > 0 ? categories.data.map(category => (
                                    <tr key={category.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-4 font-medium text-gray-900">
                                            {category.name}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                                                    onClick={() => openEditModal(category)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDelete(category)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                                            Tidak ada kategori ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {categories.links.length > 3 && (
                        <div className="flex items-center justify-center space-x-1 mt-6">
                            {categories.links.map((link, i) => (
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

CategoryIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Kategori', href: '/categories' }]}>
        {page}
    </AppLayout>
);

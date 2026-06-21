import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { store as expensesStore, index as expensesIndex } from '@/actions/App/Http/Controllers/Finance/ExpenseController';

interface Outlet { id: string; name: string }
interface Category { id: string; name: string }

interface Props {
    outlets: Outlet[];
    categories: Category[];
    today: string;
}

export default function ExpensesCreate({ outlets, categories, today }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        outlet_id:           '',
        expense_category_id: '',
        amount:              '',
        expense_date:        today,
        description:         '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(expensesStore.url());
    }

    return (
        <>
            <Head title="Tambah Pengeluaran" />
            <div className="flex flex-col gap-6 p-6 max-w-2xl">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={expensesIndex.url()}><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tambah Pengeluaran</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Catat biaya operasional outlet</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label>Outlet <span className="text-gray-400 text-xs">(opsional)</span></Label>
                                <Select value={data.outlet_id} onValueChange={v => setData('outlet_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih outlet..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">— Tidak spesifik —</SelectItem>
                                        {outlets.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Kategori <span className="text-gray-400 text-xs">(opsional)</span></Label>
                                <Select value={data.expense_category_id} onValueChange={v => setData('expense_category_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih kategori..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">— Tidak ada —</SelectItem>
                                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="amount">Jumlah (Rp) <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        min={1}
                                        step={100}
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className="pl-10"
                                        placeholder="0"
                                    />
                                </div>
                                {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="expense_date">Tanggal <span className="text-red-500">*</span></Label>
                                <Input
                                    id="expense_date"
                                    type="date"
                                    value={data.expense_date}
                                    onChange={e => setData('expense_date', e.target.value)}
                                />
                                {errors.expense_date && <p className="text-xs text-red-500">{errors.expense_date}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description">Deskripsi <span className="text-gray-400 text-xs">(opsional)</span></Label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Keterangan pengeluaran..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" type="button" asChild>
                                <Link href={expensesIndex.url()}>Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                {processing ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

ExpensesCreate.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Pengeluaran', href: '/expenses' }, { title: 'Tambah', href: '/expenses/create' }]}>
        {page}
    </AppLayout>
);

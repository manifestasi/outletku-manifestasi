import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import {
    store as transfersStore,
    index as transfersIndex,
} from '@/actions/App/Http/Controllers/Finance/CashTransferController';

interface Outlet { id: string; name: string }
interface Props { outlets: Outlet[]; today: string }

type TransferType = 'outlet_to_outlet' | 'outlet_to_owner' | 'owner_to_outlet';

export default function CashTransfersCreate({ outlets, today }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        type: TransferType;
        from_outlet_id: string;
        to_outlet_id: string;
        amount: string;
        transfer_date: string;
        description: string;
    }>({
        type:           'outlet_to_outlet',
        from_outlet_id: '',
        to_outlet_id:   '',
        amount:         '',
        transfer_date:  today,
        description:    '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(transfersStore.url());
    }

    const needFrom = data.type === 'outlet_to_outlet' || data.type === 'outlet_to_owner';
    const needTo   = data.type === 'outlet_to_outlet' || data.type === 'owner_to_outlet';

    return (
        <>
            <Head title="Tambah Transfer Kas" />
            <div className="flex flex-col gap-6 p-6 max-w-2xl">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={transfersIndex.url()}><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Transfer Kas</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Catat perpindahan kas antar outlet atau dengan owner</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                    <form onSubmit={submit} className="space-y-5">

                        <div className="space-y-1.5">
                            <Label>Tipe Transfer <span className="text-red-500">*</span></Label>
                            <Select value={data.type} onValueChange={v => {
                                setData(prev => ({ ...prev, type: v as TransferType, from_outlet_id: '', to_outlet_id: '' }));
                            }}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="outlet_to_outlet">Outlet → Outlet</SelectItem>
                                    <SelectItem value="outlet_to_owner">Outlet → Owner (Setoran)</SelectItem>
                                    <SelectItem value="owner_to_outlet">Owner → Outlet (Tambahan Modal)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {needFrom && (
                                <div className="space-y-1.5">
                                    <Label>Dari Outlet <span className="text-red-500">*</span></Label>
                                    <Select value={data.from_outlet_id} onValueChange={v => setData('from_outlet_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih outlet asal..." /></SelectTrigger>
                                        <SelectContent>
                                            {outlets
                                                .filter(o => o.id !== data.to_outlet_id)
                                                .map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.from_outlet_id && <p className="text-xs text-red-500">{errors.from_outlet_id}</p>}
                                </div>
                            )}

                            {needTo && (
                                <div className="space-y-1.5">
                                    <Label>Ke Outlet <span className="text-red-500">*</span></Label>
                                    <Select value={data.to_outlet_id} onValueChange={v => setData('to_outlet_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih outlet tujuan..." /></SelectTrigger>
                                        <SelectContent>
                                            {outlets
                                                .filter(o => o.id !== data.from_outlet_id)
                                                .map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.to_outlet_id && <p className="text-xs text-red-500">{errors.to_outlet_id}</p>}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="amount">Jumlah (Rp) <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rp</span>
                                    <Input
                                        id="amount"
                                        type="number"
                                        min={1}
                                        step={1000}
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className="pl-10"
                                        placeholder="0"
                                    />
                                </div>
                                {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="transfer_date">Tanggal <span className="text-red-500">*</span></Label>
                                <Input
                                    id="transfer_date"
                                    type="date"
                                    value={data.transfer_date}
                                    onChange={e => setData('transfer_date', e.target.value)}
                                />
                                {errors.transfer_date && <p className="text-xs text-red-500">{errors.transfer_date}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description">Keterangan <span className="text-gray-400 text-xs">(opsional)</span></Label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                placeholder="Catatan tambahan..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" type="button" asChild>
                                <Link href={transfersIndex.url()}>Batal</Link>
                            </Button>
                            <Button type="submit" isLoading={processing} className="bg-indigo-600 hover:bg-indigo-700">
                                {processing ? 'Menyimpan...' : 'Simpan Transfer'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

CashTransfersCreate.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Transfer Kas', href: '/cash-transfers' }, { title: 'Tambah', href: '/cash-transfers/create' }]}>
        {page}
    </AppLayout>
);

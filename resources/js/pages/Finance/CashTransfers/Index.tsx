import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    index as transfersIndex,
    create as transfersCreate,
    destroy as transfersDestroy,
} from '@/actions/App/Http/Controllers/Finance/CashTransferController';

interface Transfer {
    id: string;
    type: 'outlet_to_outlet' | 'outlet_to_owner' | 'owner_to_outlet';
    from_outlet: { id: string; name: string } | null;
    to_outlet: { id: string; name: string } | null;
    amount: number;
    transfer_date: string;
    description: string | null;
    created_by: { id: string; name: string };
}

interface PaginationData {
    data: Transfer[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    transfers: PaginationData;
    outlets: { id: string; name: string }[];
    filters: { type?: string; start_date?: string; end_date?: string };
}

const TYPE_LABELS: Record<string, string> = {
    outlet_to_outlet: 'Outlet → Outlet',
    outlet_to_owner:  'Outlet → Owner',
    owner_to_outlet:  'Owner → Outlet',
};

const TYPE_COLORS: Record<string, string> = {
    outlet_to_outlet: 'bg-blue-50 text-blue-700',
    outlet_to_owner:  'bg-amber-50 text-amber-700',
    owner_to_outlet:  'bg-emerald-50 text-emerald-700',
};

export default function CashTransfersIndex({ transfers, outlets, filters }: Props) {
    const [type, setType]           = useState(filters.type ?? 'all');
    const [startDate, setStartDate] = useState(filters.start_date ?? '');
    const [endDate, setEndDate]     = useState(filters.end_date ?? '');

    const fmt = (n: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    const fmtDate = (d: string) =>
        new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(d));

    function handleFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get(transfersIndex.url(), {
            type:       type === 'all' ? undefined : type,
            start_date: startDate || undefined,
            end_date:   endDate   || undefined,
        }, { preserveState: true });
    }

    function handleReset() {
        setType('all'); setStartDate(''); setEndDate('');
        router.get(transfersIndex.url());
    }

    function handleDelete(id: string) {
        if (!confirm('Hapus transfer kas ini?')) return;
        router.delete(transfersDestroy.url({ cashTransfer: id }));
    }

    const hasFilters = type !== 'all' || startDate || endDate;

    return (
        <>
            <Head title="Transfer Kas" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Transfer Kas</h1>
                        <p className="text-sm text-muted-foreground mt-1">Catat perpindahan kas antar outlet atau dengan owner</p>
                    </div>
                    <Button asChild className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                        <Link href={transfersCreate.url()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Transfer
                        </Link>
                    </Button>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    <form
                        onSubmit={handleFilter}
                        className="flex flex-wrap gap-3 p-4 border-b border-gray-100 bg-gray-50/50"
                    >
                        <div className="w-full sm:w-52">
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="bg-white"><SelectValue placeholder="Semua Tipe" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="outlet_to_outlet">Outlet → Outlet</SelectItem>
                                    <SelectItem value="outlet_to_owner">Outlet → Owner</SelectItem>
                                    <SelectItem value="owner_to_outlet">Owner → Outlet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full sm:w-40 bg-white" />
                        <Input type="date" value={endDate}   onChange={e => setEndDate(e.target.value)}   className="w-full sm:w-40 bg-white" />
                        <div className="flex gap-2">
                            <Button type="submit" variant="secondary">Filter</Button>
                            {hasFilters && <Button type="button" variant="ghost" onClick={handleReset}>Reset</Button>}
                        </div>
                    </form>

                    {transfers.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">Tanggal</th>
                                            <th className="px-5 py-3 font-medium">Tipe</th>
                                            <th className="px-5 py-3 font-medium">Dari</th>
                                            <th className="px-5 py-3 font-medium">Ke</th>
                                            <th className="px-5 py-3 font-medium">Keterangan</th>
                                            <th className="px-5 py-3 font-medium text-right">Jumlah</th>
                                            <th className="px-5 py-3 font-medium text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transfers.data.map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{fmtDate(t.transfer_date)}</td>
                                                <td className="px-5 py-4">
                                                    <Badge className={`${TYPE_COLORS[t.type]} border-none shadow-none hover:opacity-90`}>
                                                        {TYPE_LABELS[t.type]}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 text-gray-700">{t.from_outlet?.name ?? <em className="text-gray-400">Owner</em>}</td>
                                                <td className="px-5 py-4 text-gray-700">{t.to_outlet?.name ?? <em className="text-gray-400">Owner</em>}</td>
                                                <td className="px-5 py-4 text-gray-500 max-w-xs truncate">{t.description ?? '–'}</td>
                                                <td className="px-5 py-4 text-right font-semibold text-gray-900">{fmt(t.amount)}</td>
                                                <td className="px-5 py-4 text-right">
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                                                        onClick={() => handleDelete(t.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {transfers.links.length > 3 && (
                                <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-gray-100">
                                    {transfers.links.map((link, i) =>
                                        link.url ? (
                                            <Link key={i} href={link.url}
                                                className={`px-3 py-1.5 border rounded-md text-sm transition-colors ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 hover:bg-gray-50 border-gray-200'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span key={i} className="px-3 py-1.5 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                                <ArrowLeftRight className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Belum ada transfer kas</h3>
                            <p className="text-xs text-gray-400 max-w-xs">
                                {hasFilters ? 'Tidak ada data dengan filter ini.' : 'Catat perpindahan kas antar outlet atau dengan owner.'}
                            </p>
                            {hasFilters
                                ? <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>Reset Filter</Button>
                                : <Button asChild size="sm" className="mt-4 bg-indigo-600 hover:bg-indigo-700"><Link href={transfersCreate.url()}>Catat Transfer</Link></Button>
                            }
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

CashTransfersIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Transfer Kas', href: '/cash-transfers' }]}>{page}</AppLayout>
);

import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Printer, AlertTriangle, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Product {
    id: string;
    name: string;
}

interface Item {
    id: string;
    product_name: string;
    product_sku: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount: number;
    total: number;
    product: Product | null;
}

interface Transaction {
    id: string;
    invoice_number: string;
    transaction_date: string;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    payment_method: string;
    payment_amount: number;
    change_amount: number;
    is_void: boolean;
    voided_at: string | null;
    outlet: { id: string; name: string; address: string | null };
    user: { id: string; name: string };
    voided_by?: { id: string; name: string } | null;
    items: Item[];
}

interface ShowProps {
    transaction: Transaction;
    canVoid?: boolean;
}

export default function TransactionShow({ transaction, canVoid = false }: ShowProps) {
    const [isVoidOpen, setIsVoidOpen] = useState(false);

    // Auto print if ?print=true is in URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('print') === 'true') {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('id-ID', { 
            dateStyle: 'full', 
            timeStyle: 'medium' 
        }).format(new Date(dateString));
    };

    const handleVoid = () => {
        router.delete(`/transactions/${transaction.id}`, {
            onSuccess: () => setIsVoidOpen(false),
        });
    };

    return (
        <>
            <Head title={`Invoice ${transaction.invoice_number}`} />

            {/* Print Styling */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-section, #print-section * { visibility: visible; }
                    #print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm; /* Standard thermal width */
                        margin: 0;
                        padding: 10px;
                        font-family: monospace;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="flex flex-col gap-6 p-6 no-print">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" asChild>
                            <Link href="/transactions"><ArrowLeft className="w-4 h-4" /></Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">Detail Transaksi</h1>
                    </div>
                    
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.print()} className="bg-white">
                            <Printer className="w-4 h-4 mr-2" /> Cetak
                        </Button>

                        {!transaction.is_void && canVoid && (
                            <Dialog open={isVoidOpen} onOpenChange={setIsVoidOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="bg-red-600">
                                        <AlertTriangle className="w-4 h-4 mr-2" /> Void
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Konfirmasi Void Transaksi</DialogTitle>
                                    </DialogHeader>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Apakah Anda yakin ingin membatalkan (void) transaksi <span className="font-bold text-gray-900">{transaction.invoice_number}</span>? 
                                        Tindakan ini akan mengembalikan stok produk yang terjual dan tidak bisa dibatalkan.
                                    </p>
                                    <div className="flex justify-end gap-2 mt-6">
                                        <Button variant="ghost" onClick={() => setIsVoidOpen(false)}>Batal</Button>
                                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleVoid}>Ya, Void Transaksi</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
                    {/* Left: Detail */}
                    <div className="lg:col-span-2 space-y-6">
                        {transaction.is_void && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold">Transaksi Dibatalkan (Void)</h4>
                                    <p className="text-sm mt-1">Dibatalkan pada {transaction.voided_at ? formatDate(transaction.voided_at) : '-'} oleh {transaction.voided_by?.name || 'Sistem'}.</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center"><FileText className="w-5 h-5 mr-2 text-indigo-500" /> Item Pembelian</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3">Produk</th>
                                            <th className="px-4 py-3 text-right">Harga</th>
                                            <th className="px-4 py-3 text-center">Qty</th>
                                            <th className="px-4 py-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transaction.items.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium text-gray-900">{item.product_name}</div>
                                                    {item.product_sku && <div className="text-xs text-gray-500">SKU: {item.product_sku}</div>}
                                                </td>
                                                <td className="px-4 py-4 text-right">{formatCurrency(item.unit_price)}</td>
                                                <td className="px-4 py-4 text-center font-medium">{item.quantity}</td>
                                                <td className="px-4 py-4 text-right font-medium">{formatCurrency(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary */}
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold mb-4">Informasi</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Invoice</span>
                                    <span className="font-bold">{transaction.invoice_number}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Tanggal</span>
                                    <span className="font-medium text-right">{formatDate(transaction.transaction_date)}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Outlet</span>
                                    <span className="font-medium text-right">{transaction.outlet.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Kasir</span>
                                    <span className="font-medium">{transaction.user.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Metode Bayar</span>
                                    <span className="font-medium capitalize">{transaction.payment_method === 'cash' ? 'Tunai' : transaction.payment_method}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 text-white border border-gray-800 rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold mb-4">Ringkasan</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span>{formatCurrency(transaction.subtotal)}</span>
                                </div>
                                {transaction.discount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Diskon</span>
                                        <span className="text-red-400">-{formatCurrency(transaction.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-3 border-t border-gray-700 font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-emerald-400">{formatCurrency(transaction.total)}</span>
                                </div>
                                <div className="flex justify-between pt-3 text-gray-300">
                                    <span>Dibayar</span>
                                    <span>{formatCurrency(transaction.payment_amount)}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Kembali</span>
                                    <span>{formatCurrency(transaction.change_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Section (Thermal Receipt Format) */}
                <div id="print-section" className="hidden">
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <h2 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{transaction.outlet.name}</h2>
                        <div style={{ fontSize: '12px' }}>{transaction.outlet.address}</div>
                        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                            <span>Inv: {transaction.invoice_number}</span>
                            <span>{new Date(transaction.transaction_date).toLocaleDateString('id-ID')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>Kasir: {transaction.user.name}</span>
                            <span>{new Date(transaction.transaction_date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
                    </div>

                    <table style={{ width: '100%', fontSize: '12px' }}>
                        <tbody>
                            {transaction.items.map(item => (
                                <tr key={item.id}>
                                    <td colSpan={3} style={{ paddingBottom: '3px' }}>{item.product_name}</td>
                                    <tr>
                                        <td style={{ width: '20%' }}>{item.quantity}x</td>
                                        <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('id-ID').format(item.unit_price)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{new Intl.NumberFormat('id-ID').format(item.total)}</td>
                                    </tr>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

                    <div style={{ fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('id-ID').format(transaction.subtotal)}</span>
                        </div>
                        {transaction.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                <span>Diskon</span>
                                <span>-{new Intl.NumberFormat('id-ID').format(transaction.discount)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', margin: '5px 0' }}>
                            <span>TOTAL</span>
                            <span>{new Intl.NumberFormat('id-ID').format(transaction.total)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span>Tunai/Bayar</span>
                            <span>{new Intl.NumberFormat('id-ID').format(transaction.payment_amount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span>Kembali</span>
                            <span>{new Intl.NumberFormat('id-ID').format(transaction.change_amount)}</span>
                        </div>
                    </div>

                    <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>
                    
                    <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '10px' }}>
                        Terima kasih atas kunjungan Anda!
                    </div>
                </div>

            </div>
        </>
    );
}

TransactionShow.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Transaksi', href: '/transactions' },
        ]}
    >
        {page}
    </AppLayout>
);

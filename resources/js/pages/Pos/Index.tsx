import { Head, Link, useForm, router } from '@inertiajs/react';
import KasirLayout from '@/layouts/kasir-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, LogOut, FileText, ArrowLeft } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

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
    image: string | null;
    current_stock: number;
    category?: Category;
}

interface CartItem {
    product: Product;
    quantity: number;
    unit_price: number;
    discount: number;
}

interface PosIndexProps {
    outlet: { id: string; name: string };
    outlets?: { id: string; name: string }[] | null;
    mode?: 'cashier' | 'admin';
    shift_id: string | null;
    products: Product[];
    invoicePreview: string;
    flash?: { success?: string; error?: string; transaction_id?: string };
}

export default function PosIndex({ outlet, outlets, mode = 'cashier', shift_id, products, invoicePreview, flash }: PosIndexProps) {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    // Checkout state
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash'|'transfer'|'other'>('cash');
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    
    // Success Dialog state
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [lastTransactionId, setLastTransactionId] = useState<string | null>(null);

    // Extract unique categories from products
    const categories = useMemo(() => {
        const cats = new Map<string, Category>();
        products.forEach(p => {
            if (p.category) {
                cats.set(p.category.id, p.category);
            }
        });
        return Array.from(cats.values());
    }, [products]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                                (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
            const matchCategory = categoryFilter === 'all' || p.category?.id === categoryFilter;
            return matchSearch && matchCategory;
        });
    }, [products, search, categoryFilter]);

    // Cart calculations
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0), [cart]);
    const totalDiscount = useMemo(() => cart.reduce((sum, item) => sum + item.discount, 0), [cart]);
    const tax = 0; // Configurable later
    const total = subtotal - totalDiscount + tax;

    const { data, setData, post, processing, reset } = useForm({
        outlet_id: outlet.id,
        shift_id: shift_id,
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        payment_method: 'cash',
        payment_amount: 0,
        items: [] as any[],
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            setCart([]);
            setIsCheckoutOpen(false);
            setPaymentAmount('');
            if (flash.transaction_id) {
                setLastTransactionId(flash.transaction_id);
                setIsSuccessOpen(true);
            }
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const addToCart = (product: Product) => {
        if (product.current_stock <= 0) {
            toast.error('Stok produk habis!');
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.current_stock) {
                    toast.error(`Stok maksimal ${product.name} adalah ${product.current_stock}`);
                    return prev;
                }
                return prev.map(item => 
                    item.product.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1, unit_price: product.selling_price, discount: 0 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQ = item.quantity + delta;
                if (newQ > item.product.current_stock) {
                    toast.error(`Stok maksimal ${item.product.name} adalah ${item.product.current_stock}`);
                    return item;
                }
                if (newQ < 1) return item;
                return { ...item, quantity: newQ };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setIsCheckoutOpen(true);
        // Pre-fill payment amount if transfer
        if (paymentMethod !== 'cash') {
            setPaymentAmount(total.toString());
        }
    };

    const submitOrder = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payAmountNum = Number(paymentAmount.replace(/\D/g, ''));
        if (paymentMethod === 'cash' && payAmountNum < total) {
            toast.error('Uang bayar kurang dari total belanja.');
            return;
        }

        const items = cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.quantity * item.unit_price,
            discount: item.discount,
            total: (item.quantity * item.unit_price) - item.discount,
        }));

        setData({
            ...data,
            subtotal,
            discount: totalDiscount,
            tax,
            total,
            payment_method: paymentMethod,
            payment_amount: paymentMethod === 'cash' ? payAmountNum : total,
            items,
        });
    };

    useEffect(() => {
        if (data.total > 0 && data.items.length > 0) {
            post('/transactions', {
                preserveScroll: true,
                onSuccess: () => {
                    // flash handled above
                }
            });
        }
    }, [data.total]); // Trigger post when data is fully prepared

    const printReceipt = () => {
        if (lastTransactionId) {
            window.open(`/transactions/${lastTransactionId}?print=true`, '_blank');
        }
    };

    const handleOutletChange = (outletId: string) => {
        router.get('/transactions/create', { outlet_id: outletId }, { preserveState: false });
    };

    const pageTitle = mode === 'admin' ? `POS Admin - ${outlet.name}` : `POS - ${outlet.name}`;

    return (
        <KasirLayout title={pageTitle}>
            <Head title={pageTitle} />

            <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)] w-full -m-6 rounded-none relative overflow-hidden">
                {/* Left: Product Grid */}
                <div className="flex-1 flex flex-col bg-slate-950 p-4 lg:p-6 pb-28 lg:pb-6">
                    {/* Top actions */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex justify-between items-center gap-2">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input 
                                    placeholder="Cari produk..." 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-10 bg-slate-900 border-slate-800 text-white w-full"
                                />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {mode === 'admin' && outlets && outlets.length > 1 && (
                                    <select
                                        value={outlet.id}
                                        onChange={(e) => handleOutletChange(e.target.value)}
                                        className="h-10 rounded-lg border border-slate-800 bg-slate-900 px-3 text-sm text-white"
                                    >
                                        {outlets.map((o) => (
                                            <option key={o.id} value={o.id}>{o.name}</option>
                                        ))}
                                    </select>
                                )}

                                {mode === 'admin' && (
                                    <Button variant="outline" asChild className="border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800">
                                        <Link href="/transactions">
                                            <ArrowLeft className="w-4 h-4 sm:mr-2" />
                                            <span className="hidden sm:inline">Kembali</span>
                                        </Link>
                                    </Button>
                                )}

                                <Button 
                                    variant="outline" 
                                    className="lg:hidden relative border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 px-3" 
                                    onClick={() => setIsCartOpen(true)}
                                    title="Lihat Keranjang"
                                >
                                    <FileText className="w-5 h-5" />
                                    {cart.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-slate-950">
                                            {cart.reduce((s,i) => s + i.quantity, 0)}
                                        </span>
                                    )}
                                </Button>

                                {shift_id && (
                                    <Button variant="outline" asChild className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 whitespace-nowrap px-3 sm:px-4">
                                        <Link href="/shift/close">
                                            <LogOut className="w-4 h-4 sm:mr-2" /> 
                                            <span className="hidden sm:inline">Tutup Shift</span>
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full">
                            <Button 
                                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setCategoryFilter('all')}
                                className={`shrink-0 ${categoryFilter === 'all' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                            >
                                Semua
                            </Button>
                            {categories.map(cat => (
                                <Button 
                                    key={cat.id}
                                    variant={categoryFilter === cat.id ? 'default' : 'outline'}
                                    onClick={() => setCategoryFilter(cat.id)}
                                    className={`shrink-0 ${categoryFilter === cat.id ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Products */}
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-6">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    disabled={product.current_stock <= 0}
                                    className={`bg-slate-900 border rounded-2xl p-4 text-left transition-all relative overflow-hidden flex flex-col h-full ${
                                        product.current_stock <= 0 
                                            ? 'border-slate-800 opacity-50 cursor-not-allowed' 
                                            : 'border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 active:scale-95'
                                    }`}
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white line-clamp-2 mb-1">{product.name}</h3>
                                        {product.category && (
                                            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md mb-2 inline-block">
                                                {product.category.name}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-auto pt-4 flex flex-col sm:flex-row sm:items-end justify-between w-full gap-1">
                                        <span className="font-bold text-emerald-400">
                                            {formatCurrency(product.selling_price)}
                                        </span>
                                        <span className={`text-xs ${product.current_stock > 10 ? 'text-slate-400' : 'text-orange-400'}`}>
                                            Stok: {product.current_stock} {product.unit}
                                        </span>
                                    </div>
                                    {product.current_stock <= 0 && (
                                        <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">HABIS</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-full py-20 text-center text-slate-500">
                                    Tidak ada produk yang cocok dengan pencarian.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right: Cart */}
                {/* Overlay for mobile when cart is open */}
                {isCartOpen && (
                    <div 
                        className="lg:hidden fixed inset-0 bg-black/60 z-30"
                        onClick={() => setIsCartOpen(false)}
                    />
                )}
                
                <div className={`
                    fixed lg:relative inset-y-0 right-0 z-40 w-full sm:w-[400px] bg-slate-900 border-l border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
                `}>
                    <div className="p-4 lg:p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                        <div className="flex items-center gap-3">
                            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsCartOpen(false)}>
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h2 className="font-bold text-xl text-white">Pesanan</h2>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setCart([])} className="text-slate-400 hover:text-red-400" disabled={cart.length === 0}>
                            Kosongkan
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 py-20">
                                <FileText className="w-12 h-12 opacity-20" />
                                <p>Keranjang masih kosong</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.product.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="pr-4">
                                                <h4 className="font-medium text-slate-200 line-clamp-1">{item.product.name}</h4>
                                                <div className="text-sm text-emerald-400 font-semibold">{formatCurrency(item.unit_price)}</div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.product.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 bg-slate-900 rounded-lg border border-slate-800 p-1">
                                                <button onClick={() => updateQuantity(item.product.id, -1)} className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-slate-300">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product.id, 1)} className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-slate-300">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="font-bold text-white">
                                                {formatCurrency((item.unit_price * item.quantity) - item.discount)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Cart Summary */}
                    <div className="p-6 bg-slate-950 border-t border-slate-800">
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-slate-400 text-sm">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 text-sm">
                                <span>Diskon</span>
                                <span>-{formatCurrency(totalDiscount)}</span>
                            </div>
                            <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-slate-800">
                                <span>Total</span>
                                <span className="text-emerald-400">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700" 
                            disabled={cart.length === 0}
                            onClick={handleCheckout}
                        >
                            Bayar
                        </Button>
                    </div>
                </div>

                {/* Mobile Cart Toggle Button */}
                {!isCartOpen && (
                    <div className="lg:hidden fixed bottom-6 left-6 right-6 z-20">
                        <Button 
                            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 shadow-2xl flex justify-between items-center px-6 rounded-2xl border border-indigo-500/50"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <div className="flex items-center gap-2 text-white">
                                <FileText className="w-5 h-5" />
                                <span className="font-medium text-lg">{cart.reduce((s,i) => s + i.quantity, 0)} Item</span>
                            </div>
                            <span className="font-bold text-xl text-white">{formatCurrency(total)}</span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Checkout Dialog */}
            <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Selesaikan Pembayaran</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={submitOrder} className="space-y-6 mt-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                            <div className="text-slate-400 text-sm mb-1">Total Tagihan</div>
                            <div className="text-3xl font-bold text-emerald-400">{formatCurrency(total)}</div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300">Metode Pembayaran</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPaymentMethod('cash');
                                        setPaymentAmount('');
                                    }}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                                        paymentMethod === 'cash' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <Banknote className="w-5 h-5" /> Tunai
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPaymentMethod('transfer');
                                        setPaymentAmount(total.toString());
                                    }}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                                        paymentMethod === 'transfer' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <CreditCard className="w-5 h-5" /> Transfer
                                </button>
                            </div>
                        </div>

                        {paymentMethod === 'cash' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex justify-between">
                                    Jumlah Uang Tunai
                                    {Number(paymentAmount.replace(/\D/g,'')) >= total && (
                                        <span className="text-emerald-400">
                                            Kembali: {formatCurrency(Number(paymentAmount.replace(/\D/g,'')) - total)}
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">Rp</span>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={paymentAmount ? new Intl.NumberFormat('id-ID').format(Number(paymentAmount.replace(/\D/g,''))) : ''}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setPaymentAmount(val);
                                        }}
                                        className="pl-12 h-14 text-lg font-bold bg-slate-950 border-slate-800 text-white focus-visible:ring-indigo-500"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {[total, 50000, 100000].map(amt => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setPaymentAmount(amt.toString())}
                                            className="p-2 text-xs font-medium rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
                                        >
                                            {formatCurrency(amt)}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setPaymentAmount('0')}
                                        className="p-2 text-xs font-medium rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-red-400"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg"
                        >
                            {processing ? 'Memproses...' : 'Proses Pembayaran'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Success Dialog */}
            <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-sm text-center pt-8">
                    <div className="mx-auto w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <DialogTitle className="text-2xl mb-2">Transaksi Sukses!</DialogTitle>
                    <p className="text-slate-400 mb-6">Pembayaran telah berhasil dicatat ke dalam sistem.</p>
                    
                    <div className="flex flex-col gap-3">
                        <Button onClick={printReceipt} className="bg-indigo-600 hover:bg-indigo-700">
                            Cetak Struk
                        </Button>
                        <Button variant="outline" onClick={() => setIsSuccessOpen(false)} className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
                            Transaksi Baru
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </KasirLayout>
    );
}

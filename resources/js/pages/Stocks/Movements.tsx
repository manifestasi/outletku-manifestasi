import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { index, movements as movementsAction } from '@/actions/App/Http/Controllers/Stock/StockController';

export default function Movements({ movements, outlets, products, filters }: { movements: any; outlets: any[]; products: any[]; filters: any }) {
    const [outletId, setOutletId] = useState(filters.outlet_id || 'all');
    const [productId, setProductId] = useState(filters.product_id || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(movementsAction.url(), { 
            outlet_id: outletId === 'all' ? '' : outletId,
            product_id: productId === 'all' ? '' : productId,
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true });
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <Head title="Stock Movements" />

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={index.url()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Stock Movements</h1>
                    <p className="text-sm text-muted-foreground">History of stock changes across all outlets.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Movement History</CardTitle>
                    <CardDescription>Review restocks, adjustments, and deductions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 items-end">
                        <div className="space-y-2">
                            <Label>Outlet</Label>
                            <Select value={outletId} onValueChange={setOutletId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Outlets" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Outlets</SelectItem>
                                    {outlets.map(o => (
                                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Product</Label>
                            <Select value={productId} onValueChange={setProductId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Products" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Products</SelectItem>
                                    {products.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>From Date</Label>
                            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>To Date</Label>
                            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </div>
                        <Button type="submit" variant="secondary" className="w-full">Apply Filters</Button>
                    </form>

                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr className="text-left font-medium text-muted-foreground">
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Product</th>
                                    <th className="p-3">Outlet</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3 text-right">Change</th>
                                    <th className="p-3 text-right">After</th>
                                    <th className="p-3">By</th>
                                    <th className="p-3">Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-4 text-center text-muted-foreground">No movements found.</td>
                                    </tr>
                                ) : (
                                    movements.data.map((movement: any) => {
                                        return (
                                            <tr key={movement.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                <td className="p-3">{new Date(movement.created_at).toLocaleString()}</td>
                                                <td className="p-3 font-medium">{movement.stock?.product?.name}</td>
                                                <td className="p-3">{movement.stock?.outlet?.name}</td>
                                                <td className="p-3">
                                                    <Badge variant={movement.type === 'increase' ? 'default' : (movement.type === 'decrease' ? 'destructive' : 'secondary')}>
                                                        {movement.type}
                                                    </Badge>
                                                </td>
                                                <td className={`p-3 text-right font-medium ${movement.quantity_change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                                                </td>
                                                <td className="p-3 text-right text-muted-foreground">{movement.quantity_after}</td>
                                                <td className="p-3">{movement.user?.name || 'System'}</td>
                                                <td className="p-3 text-muted-foreground max-w-[200px] truncate" title={movement.note}>
                                                    {movement.note || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

Movements.layout = {
    breadcrumbs: [
        { title: 'Stocks', href: index.url() },
        { title: 'Movements History', href: movementsAction.url() },
    ],
};

import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, SlidersHorizontal, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { useState } from 'react';

import { index, showRestock, showAdjust, movements } from '@/actions/App/Http/Controllers/Stock/StockController';

export default function Index({ stocks, outlets, filters }: { stocks: any; outlets: any[]; filters: any }) {
    const [search, setSearch] = useState(filters.search || '');
    const [outletId, setOutletId] = useState(filters.outlet_id || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(index.url(), { search, outlet_id: outletId === 'all' ? '' : outletId }, { preserveState: true });
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <Head title="Stock Management" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Stock Management</h1>
                    <p className="text-sm text-muted-foreground">Manage and track stock inventory across all outlets.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href={movements.url()}>
                            <ArrowRightLeft className="w-4 h-4 mr-2" />
                            History
                        </Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href={showAdjust.url()}>
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Adjust
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={showRestock.url()}>
                            <Plus className="w-4 h-4 mr-2" />
                            Restock
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Stocks</CardTitle>
                    <CardDescription>View all stocks across your registered outlets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input 
                                placeholder="Search products..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-[200px]">
                            <Select value={outletId} onValueChange={(v) => setOutletId(v)}>
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
                        <Button type="submit" variant="secondary">Filter</Button>
                    </form>

                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr className="text-left font-medium text-muted-foreground">
                                    <th className="p-3">Product</th>
                                    <th className="p-3">SKU</th>
                                    <th className="p-3">Outlet</th>
                                    <th className="p-3 text-right">Quantity</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">No stocks found.</td>
                                    </tr>
                                ) : (
                                    stocks.data.map((stock: any) => {
                                        const isCritical = stock.quantity <= stock.low_stock_threshold;
                                        return (
                                            <tr key={stock.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                <td className="p-3 font-medium">{stock.product?.name}</td>
                                                <td className="p-3 text-muted-foreground">{stock.product?.sku}</td>
                                                <td className="p-3">{stock.outlet?.name}</td>
                                                <td className={`p-3 text-right font-medium ${isCritical ? 'text-destructive' : ''}`}>
                                                    {stock.quantity}
                                                </td>
                                                <td className="p-3">
                                                    {isCritical ? (
                                                        <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Low Stock
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                            Healthy
                                                        </Badge>
                                                    )}
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

Index.layout = {
    breadcrumbs: [
        {
            title: 'Stocks',
            href: index.url(),
        },
    ],
};

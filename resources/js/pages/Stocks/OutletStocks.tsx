import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { byOutlet } from '@/actions/App/Http/Controllers/Stock/StockController';

export default function OutletStocks({ outlet, stocks, filters }: { outlet: any; stocks: any; filters: any }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(byOutlet.url(outlet.id), { search }, { preserveState: true });
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <Head title={`Stocks - ${outlet.name}`} />

            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Stocks: {outlet.name}</h1>
                <p className="text-sm text-muted-foreground">View inventory for this specific outlet.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Stocks</CardTitle>
                    <CardDescription>Available products and their quantities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="mb-6">
                        <Input 
                            placeholder="Search products..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-md"
                        />
                    </form>

                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr className="text-left font-medium text-muted-foreground">
                                    <th className="p-3">Product</th>
                                    <th className="p-3">SKU</th>
                                    <th className="p-3 text-right">Quantity</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-muted-foreground">No stocks found.</td>
                                    </tr>
                                ) : (
                                    stocks.data.map((stock: any) => {
                                        const isCritical = stock.quantity <= stock.low_stock_threshold;
                                        return (
                                            <tr key={stock.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                                <td className="p-3 font-medium">{stock.product?.name}</td>
                                                <td className="p-3 text-muted-foreground">{stock.product?.sku}</td>
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

OutletStocks.layout = {
    breadcrumbs: [
        { title: 'Outlets', href: '/outlets' },
        { title: 'Stocks', href: '#' },
    ],
};

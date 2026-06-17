import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { index, showRestock, lowAlert } from '@/actions/App/Http/Controllers/Stock/StockController';

export default function LowAlert({ stocks }: { stocks: any }) {
    return (
        <div className="flex flex-col gap-6 p-4">
            <Head title="Low Stock Alerts" />

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={index.url()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-destructive flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        Low Stock Alerts
                    </h1>
                    <p className="text-sm text-muted-foreground">Items that are at or below their low stock threshold.</p>
                </div>
            </div>

            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle>Critical Inventory</CardTitle>
                    <CardDescription>These products need immediate restocking.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr className="text-left font-medium text-muted-foreground">
                                    <th className="p-3">Product</th>
                                    <th className="p-3">SKU</th>
                                    <th className="p-3">Outlet</th>
                                    <th className="p-3 text-right">Quantity</th>
                                    <th className="p-3 text-right">Threshold</th>
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-muted-foreground">No low stock items currently.</td>
                                    </tr>
                                ) : (
                                    stocks.data.map((stock: any) => (
                                        <tr key={stock.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                                            <td className="p-3 font-medium">{stock.product?.name}</td>
                                            <td className="p-3 text-muted-foreground">{stock.product?.sku}</td>
                                            <td className="p-3">{stock.outlet?.name}</td>
                                            <td className="p-3 text-right font-bold text-destructive">
                                                {stock.quantity}
                                            </td>
                                            <td className="p-3 text-right text-muted-foreground">
                                                {stock.low_stock_threshold}
                                            </td>
                                            <td className="p-3">
                                                <Button size="sm" asChild>
                                                    <Link href={showRestock.url()}>Restock</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

LowAlert.layout = {
    breadcrumbs: [
        { title: 'Stocks', href: index.url() },
        { title: 'Low Alerts', href: lowAlert.url() },
    ],
};

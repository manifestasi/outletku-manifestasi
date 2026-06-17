import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';
import { index, restock, restockForm } from '@/actions/App/Http/Controllers/Stock/StockController';

export default function Restock({ outlets, products }: { outlets: any[]; products: any[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        outlet_id: '',
        product_id: '',
        quantity: '',
        note: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(restock.url(), {
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto w-full">
            <Head title="Restock Items" />

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={index.url()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Restock Items</h1>
                    <p className="text-sm text-muted-foreground">Add new stock inventory to an outlet.</p>
                </div>
            </div>

            <Card>
                <form onSubmit={submit}>
                    <CardHeader>
                        <CardTitle>Restock Form</CardTitle>
                        <CardDescription>Fill in the details for the incoming stock.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="outlet_id">Outlet</Label>
                            <Select onValueChange={(v) => setData('outlet_id', v)} value={data.outlet_id}>
                                <SelectTrigger className={errors.outlet_id ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select outlet" />
                                </SelectTrigger>
                                <SelectContent>
                                    {outlets.map(o => (
                                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.outlet_id && <p className="text-sm text-destructive">{errors.outlet_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product_id">Product</Label>
                            <Select onValueChange={(v) => setData('product_id', v)} value={data.product_id}>
                                <SelectTrigger className={errors.product_id ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.product_id && <p className="text-sm text-destructive">{errors.product_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity Added</Label>
                            <Input 
                                id="quantity"
                                type="number" 
                                min="1"
                                value={data.quantity} 
                                onChange={e => setData('quantity', e.target.value)} 
                                placeholder="Enter amount to add"
                                className={errors.quantity ? 'border-destructive' : ''}
                            />
                            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="note">Note (Optional)</Label>
                            <Input 
                                id="note"
                                value={data.note} 
                                onChange={e => setData('note', e.target.value)} 
                                placeholder="e.g. PO-10294 or Supplier delivery"
                                className={errors.note ? 'border-destructive' : ''}
                            />
                            {errors.note && <p className="text-sm text-destructive">{errors.note}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" type="button" asChild>
                            <Link href={index.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>Submit Restock</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

Restock.layout = {
    breadcrumbs: [
        { title: 'Stocks', href: index.url() },
        { title: 'Restock', href: restockForm.url() },
    ],
};

import { Head } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SuperAdminLogin() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-indigo-950">
            <Head title="Super Admin Login" />

            <div className="w-full max-w-sm mx-4">
                <div className="text-center mb-8">
                    <div className="inline-flex w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-white">Super Admin</h1>
                    <p className="text-indigo-400 text-sm mt-1">Outletku Platform Panel</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <Form action="/super-admin/login" method="post">
                        {({ errors, processing }) => (
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        autoFocus
                                        placeholder="admin@example.com"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input id="remember" name="remember" type="checkbox" className="w-4 h-4 rounded" />
                                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">Ingat saya</Label>
                                </div>

                                <Button type="submit" isLoading={processing} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                    {processing ? 'Masuk...' : 'Masuk'}
                                </Button>
                            </div>
                        )}
                    </Form>
                </div>

                <p className="text-center text-indigo-500 text-xs mt-6">
                    Akses terbatas untuk administrator platform
                </p>
            </div>
        </div>
    );
}

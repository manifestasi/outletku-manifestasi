import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, CheckCheck, Package, ShoppingBag, TrendingUp, Trash2, X } from 'lucide-react';
import {
    markRead,
    markAllRead,
    destroy as destroyNotif,
} from '@/actions/App/Http/Controllers/Notifications/NotificationController';

interface NotifData {
    type: string;
    title: string;
    message: string;
    url?: string;
    [key: string]: unknown;
}

interface Notification {
    id: string;
    type: string;
    data: NotifData;
    read_at: string | null;
    created_at: string;
}

interface PaginationData {
    data: Notification[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
}

interface Props {
    notifications: PaginationData;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    low_stock: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    daily_revenue_summary: { icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    shift_cash_discrepancy: { icon: ShoppingBag, color: 'text-red-500', bg: 'bg-red-50' },
};

function getTypeConfig(type: string) {
    const key = Object.keys(TYPE_CONFIG).find(k => type.includes(k));
    return TYPE_CONFIG[key ?? ''] ?? { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' };
}

export default function NotificationsIndex({ notifications }: Props) {
    const unreadCount = notifications.data.filter(n => !n.read_at).length;

    function handleMarkRead(id: string) {
        router.post(markRead.url({ id }), {}, { preserveScroll: true });
    }

    function handleMarkAllRead() {
        router.post(markAllRead.url(), {}, { preserveScroll: true });
    }

    function handleDelete(id: string) {
        router.delete(destroyNotif.url({ id }), { preserveScroll: true });
    }

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'baru saja';
        if (mins < 60) return `${mins} menit lalu`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} jam lalu`;
        const days = Math.floor(hours / 24);
        return `${days} hari lalu`;
    }

    return (
        <>
            <Head title="Notifikasi" />
            <div className="flex flex-col gap-6 p-6 max-w-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Notifikasi</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="shrink-0">
                            <CheckCheck className="w-4 h-4 mr-1.5" />
                            Tandai semua dibaca
                        </Button>
                    )}
                </div>

                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                    {notifications.data.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {notifications.data.map(notif => {
                                const cfg   = getTypeConfig(notif.type);
                                const Icon  = cfg.icon;
                                const isNew = !notif.read_at;
                                const data  = notif.data;

                                return (
                                    <div
                                        key={notif.id}
                                        className={`flex items-start gap-4 px-5 py-4 transition-colors ${isNew ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-gray-50/60'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                                            <Icon className={`w-5 h-5 ${cfg.color}`} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-semibold text-gray-900">{data.title}</p>
                                                        {isNew && (
                                                            <Badge className="bg-indigo-600 text-white border-none shadow-none text-[9px] h-4 px-1.5">Baru</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{data.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {data.url && (
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600 px-2" asChild>
                                                            <Link href={data.url as string}>Lihat</Link>
                                                        </Button>
                                                    )}
                                                    {isNew && (
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="h-7 w-7 text-gray-400 hover:text-indigo-600"
                                                            onClick={() => handleMarkRead(notif.id)}
                                                            title="Tandai sudah dibaca"
                                                        >
                                                            <CheckCheck className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-7 w-7 text-gray-300 hover:text-red-500"
                                                        onClick={() => handleDelete(notif.id)}
                                                        title="Hapus notifikasi"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                                <Bell className="w-6 h-6 text-gray-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Tidak ada notifikasi</h3>
                            <p className="text-xs text-gray-400">Notifikasi stok rendah, ringkasan harian, dan selisih kas akan muncul di sini.</p>
                        </div>
                    )}

                    {notifications.links.length > 3 && (
                        <div className="flex items-center justify-center gap-1 px-4 py-4 border-t border-gray-100">
                            {notifications.links.map((link, i) =>
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
                </div>
            </div>
        </>
    );
}

NotificationsIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Notifikasi', href: '/notifications' }]}>{page}</AppLayout>
);

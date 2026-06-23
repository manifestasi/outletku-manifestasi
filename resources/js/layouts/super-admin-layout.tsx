import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Building2,
    ChevronDown,
    Database,
    LayoutDashboard,
    LogOut,
    Menu,
    Server,
    Shield,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SuperAdmin { id: number; name: string; email: string }
interface Props { children: React.ReactNode; title?: string; breadcrumbs?: { title: string; href?: string }[] }

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Tenant / Bisnis', href: '/super-admin/tenants', icon: Building2 },
    {
        label: 'Analytics',
        icon: BarChart3,
        children: [
            { label: 'Overview', href: '/super-admin/analytics' },
            { label: 'Growth', href: '/super-admin/analytics/growth' },
            { label: 'Activity', href: '/super-admin/analytics/activity' },
            { label: 'Churn', href: '/super-admin/analytics/churn' },
        ],
    },
    {
        label: 'System',
        icon: Server,
        children: [
            { label: 'Info', href: '/super-admin/system' },
            { label: 'Logs', href: '/super-admin/system/logs' },
            { label: 'Queues', href: '/super-admin/system/queues' },
        ],
    },
];

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ElementType; active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-700/60 hover:text-white'
            }`}
        >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
        </Link>
    );
}

export default function SuperAdminLayout({ children, title, breadcrumbs = [] }: Props) {
    const { super_admin } = usePage<{ super_admin: SuperAdmin }>().props;
    const currentPath = window.location.pathname;
    const [expanded, setExpanded] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function handleLogout() {
        router.post('/super-admin/logout');
    }

    function isActive(href: string) {
        return currentPath === href || currentPath.startsWith(href + '/');
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-indigo-700/50">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-none">Super Admin</p>
                        <p className="text-[10px] text-indigo-300 mt-0.5">Outletku Platform</p>
                    </div>
                    <button className="ml-auto lg:hidden text-indigo-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                    {NAV_ITEMS.map(item => {
                        if ('children' in item && item.children) {
                            const open = expanded === item.label || item.children.some(c => isActive(c.href));
                            return (
                                <div key={item.label}>
                                    <button
                                        onClick={() => setExpanded(open ? null : item.label)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            open ? 'text-white bg-indigo-700/40' : 'text-indigo-200 hover:bg-indigo-700/40 hover:text-white'
                                        }`}
                                    >
                                        <item.icon className="w-4 h-4 shrink-0" />
                                        {item.label}
                                        <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
                                    </button>
                                    {open && (
                                        <div className="ml-7 mt-0.5 space-y-0.5">
                                            {item.children.map(child => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                                        isActive(child.href) ? 'bg-indigo-700 text-white' : 'text-indigo-300 hover:bg-indigo-700/40 hover:text-white'
                                                    }`}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        return (
                            <NavLink
                                key={item.label}
                                href={(item as any).href}
                                label={item.label}
                                icon={item.icon}
                                active={isActive((item as any).href)}
                            />
                        );
                    })}
                </nav>

                {/* User */}
                <div className="p-3 border-t border-indigo-700/50">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {super_admin?.name?.[0]?.toUpperCase() ?? 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-white truncate">{super_admin?.name}</p>
                            <p className="text-[10px] text-indigo-400 truncate">{super_admin?.email}</p>
                        </div>
                        <button onClick={handleLogout} className="text-indigo-400 hover:text-red-300 transition-colors" title="Logout">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Backdrop */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-4 px-5 shrink-0">
                    <button className="lg:hidden text-gray-500 hover:text-gray-900" onClick={() => setSidebarOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 min-w-0">
                        {breadcrumbs.map((b, i) => (
                            <span key={i} className="flex items-center gap-1.5 min-w-0">
                                {i > 0 && <span className="text-gray-300">/</span>}
                                {b.href ? (
                                    <Link href={b.href} className="hover:text-gray-900 truncate">{b.title}</Link>
                                ) : (
                                    <span className="text-gray-900 font-medium truncate">{b.title}</span>
                                )}
                            </span>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                            <Shield className="w-3 h-3" />
                            Super Admin
                        </span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}

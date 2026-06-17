import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Building2,
    LayoutGrid,
    Settings,
    Store,
    Users,
    Package,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import type { Auth } from '@/types/auth';

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;
    const roles = (user.roles ?? []).map((r) => r.name);

    const isOwner = roles.includes('owner');
    const isManager = roles.includes('manager');
    const isOwnerOrManager = isOwner || isManager;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        // Outlet management — owner & manager
        ...(isOwnerOrManager
            ? [
                {
                    title: 'Outlet',
                    href: '/outlets',
                    icon: Store,
                },
                {
                    title: 'Produk & Kategori',
                    href: '/products',
                    icon: Package,
                },
            ]
            : []),
        // User management — owner only
        ...(isOwner
            ? [
                {
                    title: 'Tim & Kasir',
                    href: '/users',
                    icon: Users,
                },
            ]
            : []),
        // Reports — owner & manager (Sprint 5)
        ...(isOwnerOrManager
            ? [
                {
                    title: 'Laporan',
                    href: '/reports',
                    icon: BarChart3,
                },
            ]
            : []),
    ];

    const footerNavItems: NavItem[] = [
        // Business settings — owner only
        ...(isOwner
            ? [
                {
                    title: 'Pengaturan Bisnis',
                    href: '/settings/business',
                    icon: Settings,
                },
            ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                                        <Building2 className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-sm truncate">OutletKu</span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {user.name}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

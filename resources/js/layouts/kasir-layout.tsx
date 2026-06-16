import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

interface KasirLayoutProps {
    children: ReactNode;
    title?: string;
}

/**
 * Kasir Layout — minimalis dark layout untuk PIN screen dan POS screen.
 * Digunakan di Sprint 3 untuk KasirAuthController pages.
 */
export default function KasirLayout({ children, title }: KasirLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Minimal dark header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg tracking-tight">OutletKu</span>
                </div>
                {title && (
                    <span className="text-slate-400 text-sm font-medium">{title}</span>
                )}
            </header>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center p-6">
                {children}
            </main>

            <Toaster position="top-center" theme="dark" richColors />
        </div>
    );
}

import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import {
    BarChart3,
    Lock,
    CheckCircle2,
    ArrowRight,
    Menu,
    X,
    Smartphone,
    Package,
    Sparkles,
    MessageCircle,
    Users,
    Zap,
    ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

export default function Welcome() {
    const { auth } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="OutletKu Manifestasi - Sistem Manajemen Bisnis Modern" />

            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
                {/* Navbar */}
                <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="Manifestasi Logo" className="h-8 w-auto" />
                            </div>

                            {/* Desktop Nav */}
                            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                                <a href="#fitur" className="text-muted-foreground hover:text-foreground transition-colors">Fitur</a>
                                <a href="#harga" className="text-muted-foreground hover:text-foreground transition-colors">Harga</a>
                                <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
                            </nav>

                            <div className="hidden md:flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        Buka Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            Daftar Gratis
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden text-foreground p-2"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Nav */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4">
                            <a href="#fitur" className="text-sm font-medium text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>Fitur</a>
                            <a href="#harga" className="text-sm font-medium text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>Harga</a>
                            <a href="#faq" className="text-sm font-medium text-muted-foreground" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
                            <div className="h-px bg-border my-2"></div>
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                                >
                                    Buka Dashboard
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href={login()}
                                        className="inline-flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                                    >
                                        Daftar Gratis
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </header>

                <main>
                    {/* Hero Section */}
                    <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16">
                        <div className="container mx-auto px-4 md:px-6">
                            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                                    <Sparkles className="h-4 w-4 mr-1.5" />
                                    Sistem Manajemen Bisnis Serbaguna
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                                    Satu Platform untuk <br className="hidden md:inline" />
                                    <span className="text-primary">Semua Jenis Bisnis</span>
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
                                    Dari toko retail, restoran, laundry, hingga toko bangunan — kelola stok, transaksi, karyawan, dan laporan keuangan bisnis Anda dari satu tempat yang terintegrasi.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                    <Link
                                        href={register()}
                                        className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105"
                                    >
                                        Mulai Sekarang - Gratis!
                                    </Link>
                                    <a
                                        href="#fitur"
                                        className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-base font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                    >
                                        Pelajari Fitur
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Abstract Background Decoration */}
                        <div className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent opacity-50 blur-3xl"></div>
                    </section>

                    {/* Features Section */}
                    <section id="fitur" className="py-16 md:py-24 bg-muted/30">
                        <div className="container mx-auto px-4 md:px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Fitur Andalan OutletKu</h2>
                                <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
                                    Dirancang untuk membantu berbagai jenis usaha — dari warung makan, toko pakaian, hingga toko bangunan — tumbuh lebih efisien.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    {
                                        icon: <Package className="h-10 w-10 text-primary mb-4" />,
                                        title: "Multi Outlet",
                                        desc: "Punya banyak cabang atau toko? Kelola dan pantau performa semua outlet Anda dalam satu dashboard terpusat."
                                    },
                                    {
                                        icon: <BarChart3 className="h-10 w-10 text-primary mb-4" />,
                                        title: "Laporan Otomatis",
                                        desc: "Ucapkan selamat tinggal pada rekap manual. Laporan omzet, pengeluaran, dan laba rugi dihitung secara otomatis."
                                    },
                                    {
                                        icon: <Smartphone className="h-10 w-10 text-primary mb-4" />,
                                        title: "Manajemen Stok",
                                        desc: "Pantau stok di setiap outlet. Dapatkan notifikasi jika stok mulai menipis agar bisnis tidak pernah kehabisan barang."
                                    },
                                    {
                                        icon: <Lock className="h-10 w-10 text-primary mb-4" />,
                                        title: "Login Kasir via PIN",
                                        desc: "Kasir tidak perlu repot ingat email/password. Cukup login pakai PIN 6 digit yang Anda atur, aman dan cepat."
                                    }
                                ].map((feature, i) => (
                                    <div key={i} className="bg-card p-6 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                                        {feature.icon}
                                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {feature.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Pricing Section */}
                    <section id="harga" className="py-16 md:py-24">
                        <div className="container mx-auto px-4 md:px-6">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Harga Transparan</h2>
                                <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
                                    Satu paket lengkap yang bisa dipakai siapa saja, tanpa batas, tanpa biaya tersembunyi.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {/* Free Tier */}
                                <div className="bg-card rounded-3xl p-8 border-2 border-primary shadow-xl flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">
                                        SEKARANG AKTIF
                                    </div>
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold mb-2">Paket Komunitas</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold">Gratis</span>
                                            <span className="text-muted-foreground text-sm">/ selamanya</span>
                                        </div>
                                        <p className="text-muted-foreground text-sm mt-2">Untuk semua pebisnis yang ingin berkembang bersama komunitas Manifestasi.</p>
                                    </div>
                                    <ul className="space-y-4 flex-1 mb-8">
                                        {[
                                            'Outlet Tidak Terbatas',
                                            'Akun Kasir Tidak Terbatas',
                                            'Manajemen Stok Lengkap',
                                            'Laporan Omzet & Keuangan',
                                            'Multi-Cabang Terpusat',
                                            'Akses Komunitas Manifestasi'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                                <span className="text-sm">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={register()}
                                        className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                                    >
                                        Daftar Sekarang - Gratis!
                                    </Link>
                                </div>

                                {/* Coming Soon Tier */}
                                <div className="bg-muted/30 rounded-3xl p-8 border border-border/50 flex flex-col relative overflow-hidden opacity-80">
                                    <div className="absolute top-0 right-0 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">
                                        COMING SOON
                                    </div>
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold mb-2 text-muted-foreground">Premium AI</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold text-muted-foreground">Segera Hadir</span>
                                        </div>
                                        <p className="text-muted-foreground text-sm mt-2">Fitur canggih berbasis kecerdasan buatan untuk bisnis yang ingin lebih jauh.</p>
                                    </div>
                                    <ul className="space-y-4 flex-1 mb-8">
                                        {[
                                            { text: 'Analitik Prediktif berbasis AI', icon: <Zap className="h-4 w-4 text-muted-foreground" /> },
                                            { text: 'Payment Gateway Terintegrasi', icon: <ShieldCheck className="h-4 w-4 text-muted-foreground" /> },
                                            { text: 'Asisten AI untuk Laporan', icon: <Sparkles className="h-4 w-4 text-muted-foreground" /> },
                                            { text: 'Prioritas Support Dedicated', icon: <Users className="h-4 w-4 text-muted-foreground" /> },
                                            { text: 'Integrasi Marketplace & Tokopedia', icon: <Package className="h-4 w-4 text-muted-foreground" /> },
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                {item.icon}
                                                <span className="text-sm text-muted-foreground">{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        disabled
                                        className="w-full inline-flex h-12 items-center justify-center rounded-xl border border-border bg-muted px-8 text-sm font-semibold text-muted-foreground cursor-not-allowed"
                                    >
                                        Segera Hadir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section id="faq" className="py-16 md:py-24 bg-muted/30">
                        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold tracking-tight mb-4">Pertanyaan Umum</h2>
                            </div>

                            <div className="space-y-6">
                                {[
                                    {
                                        q: "Bisnis apa saja yang bisa menggunakan OutletKu?",
                                        a: "Hampir semua jenis bisnis! Sistem ini dirancang secara general, sehingga cocok untuk restoran, warung makan, toko retail, toko bangunan, laundry, apotek, salon, dan banyak lagi. Selama bisnis Anda butuh manajemen stok dan kasir, OutletKu bisa digunakan."
                                    },
                                    {
                                        q: "Apakah saya harus mengerti akuntansi untuk pakai aplikasi ini?",
                                        a: "Tidak perlu! OutletKu didesain sesederhana mungkin. Anda hanya perlu mencatat pengeluaran harian dan biarkan kasir menginput penjualan. Sistem akan otomatis membuatkan laporan untuk Anda."
                                    },
                                    {
                                        q: "Apakah kasir saya bisa melihat total keuntungan?",
                                        a: "Tidak. Akun kasir (menggunakan PIN) hanya memiliki akses ke layar transaksi (POS) dan stok. Hanya Anda (Owner) dan Manajer yang bisa melihat laporan keuangan."
                                    },
                                    {
                                        q: "Berapa banyak outlet yang bisa saya daftarkan?",
                                        a: "Tidak terbatas! Di Paket Komunitas (Gratis), Anda bisa mendaftarkan outlet sebanyak yang Anda mau, begitu juga dengan jumlah akun kasir. Kami percaya pertumbuhan bisnis Anda tidak seharusnya dibatasi oleh software."
                                    }
                                ].map((faq, i) => (
                                    <div key={i} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                                        <h4 className="text-lg font-bold mb-2 flex items-start gap-3">
                                            <span className="text-primary font-black">Q.</span> {faq.q}
                                        </h4>
                                        <p className="text-muted-foreground ml-7 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-20 md:py-32 relative overflow-hidden bg-primary text-primary-foreground">
                        <div className="container mx-auto px-4 md:px-6 relative z-10">
                            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-primary-foreground">
                                    Siap Mengembangkan Bisnis Anda?
                                </h2>
                                <p className="text-lg text-primary-foreground/80 mb-10">
                                    Bergabunglah dengan komunitas Manifestasi dan mulai kelola bisnis Anda secara lebih cerdas dan efisien, hari ini juga — gratis.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <Link
                                        href={register()}
                                        className="inline-flex h-14 items-center justify-center rounded-full bg-background px-10 text-lg font-bold text-primary shadow-xl transition-transform hover:scale-105"
                                    >
                                        Daftar Sekarang
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                    {/* {import.meta.env.VITE_COMMUNITY_WA_LINK && (
                                        <a
                                            href={import.meta.env.VITE_COMMUNITY_WA_LINK}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-14 items-center justify-center rounded-full border-2 border-primary-foreground/40 px-10 text-lg font-bold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                                        >
                                            <MessageCircle className="mr-2 h-5 w-5" />
                                            Gabung Komunitas WA
                                        </a>
                                    )} */}
                                </div>
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] rounded-full border-[60px] border-primary-foreground/10 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] rounded-full bg-primary-foreground/5 pointer-events-none blur-3xl"></div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-card py-12 border-t border-border">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="Manifestasi" className="h-7 w-auto" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                &copy; {new Date().getFullYear()} OutletKu by Manifestasi. Dibuat dengan ❤️ untuk pebisnis Indonesia.
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

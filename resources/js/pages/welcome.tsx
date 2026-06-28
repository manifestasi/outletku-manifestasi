import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { 
    Store, 
    BarChart3, 
    Lock, 
    CheckCircle2, 
    ArrowRight,
    Menu,
    X,
    Smartphone
} from 'lucide-react';
import { useState } from 'react';

export default function Welcome() {
    const { auth } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="OutletKu - Kelola Outlet & Gerobak Jadi Lebih Mudah" />
            
            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
                {/* Navbar */}
                <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Store className="h-6 w-6 text-primary" />
                                <span className="text-xl font-bold tracking-tight text-primary">OutletKu</span>
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
                                    🚀 Khusus untuk UMKM & Gerobak Kuliner
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
                                    Kelola Outlet & Gerobak <br className="hidden md:inline" />
                                    <span className="text-primary">Jadi Lebih Mudah</span>
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl">
                                    Aplikasi kasir & pencatatan keuangan simpel tanpa perlu ngerti akuntansi. 
                                    Pantau stok, omzet harian, dan kinerja karyawan di semua cabang Anda dari satu tempat.
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
                                    Dirancang khusus untuk memecahkan masalah sehari-hari pemilik usaha kecil menengah.
                                </p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    {
                                        icon: <Store className="h-10 w-10 text-primary mb-4" />,
                                        title: "Multi Outlet",
                                        desc: "Punya banyak cabang atau gerobak? Kelola dan pantau performa semuanya dalam satu dashboard terpusat."
                                    },
                                    {
                                        icon: <BarChart3 className="h-10 w-10 text-primary mb-4" />,
                                        title: "Laporan Otomatis",
                                        desc: "Ucapkan selamat tinggal pada rekap manual. Laporan omzet, pengeluaran, dan laba rugi dihitung secara otomatis."
                                    },
                                    {
                                        icon: <Smartphone className="h-10 w-10 text-primary mb-4" />,
                                        title: "Manajemen Stok",
                                        desc: "Pantau stok bahan baku di setiap outlet. Dapatkan notifikasi jika stok mulai menipis agar tidak kehabisan."
                                    },
                                    {
                                        icon: <Lock className="h-10 w-10 text-primary mb-4" />,
                                        title: "Login Kasir via PIN",
                                        desc: "Kasir tidak perlu repot ingat email/password. Cukup login pakai PIN 6 digit yang Anda atur."
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
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Harga Terjangkau</h2>
                                <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto">
                                    Pilih paket yang sesuai dengan skala bisnis Anda. Mulai dari gratis.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {/* Free Tier */}
                                <div className="bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col relative overflow-hidden">
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold mb-2">Pemula (Fase Awal)</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold">Gratis</span>
                                        </div>
                                        <p className="text-muted-foreground text-sm mt-2">Untuk bisnis yang baru mulai.</p>
                                    </div>
                                    <ul className="space-y-4 flex-1 mb-8">
                                        {['1 Outlet / Gerobak', '1 Akun Kasir', 'Manajemen Stok Dasar', 'Laporan Omzet Harian', 'Support Komunitas'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                                <span className="text-sm">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={register()}
                                        className="w-full inline-flex h-12 items-center justify-center rounded-xl border-2 border-primary bg-background px-8 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                                    >
                                        Daftar Gratis
                                    </Link>
                                </div>

                                {/* Premium Tier */}
                                <div className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-xl flex flex-col relative transform md:-translate-y-4">
                                    <div className="absolute top-0 right-0 bg-white text-primary text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                                        PALING POPULER
                                    </div>
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold mb-2 text-primary-foreground">Premium</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold text-primary-foreground">Hubungi Kami</span>
                                        </div>
                                        <p className="text-primary-foreground/80 text-sm mt-2">Untuk bisnis yang sedang berkembang pesat.</p>
                                    </div>
                                    <ul className="space-y-4 flex-1 mb-8">
                                        {['Outlet Tidak Terbatas*', 'Akun Kasir Tidak Terbatas', 'Laporan Keuangan & Laba Rugi', 'Export Data (PDF/Excel)', 'Prioritas Support CS'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-primary-foreground shrink-0" />
                                                <span className="text-sm text-primary-foreground/90">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={register()}
                                        className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-background px-8 text-sm font-semibold text-primary shadow hover:bg-background/90 transition-colors"
                                    >
                                        Coba Premium
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FAQ Section */}
                    <section id="faq" className="py-16 md:py-24 bg-muted/30">
                        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl font-bold tracking-tight mb-4">Pertanyaan Seputar OutletKu</h2>
                            </div>
                            
                            <div className="space-y-6">
                                {[
                                    {
                                        q: "Apakah saya harus mengerti akuntansi untuk pakai aplikasi ini?",
                                        a: "Tidak perlu! OutletKu didesain sesederhana mungkin. Anda hanya perlu mencatat pengeluaran harian dan biarkan kasir menginput penjualan. Sistem akan otomatis membuatkan laporan laba-rugi untuk Anda."
                                    },
                                    {
                                        q: "Apakah kasir saya bisa melihat total keuntungan?",
                                        a: "Tentu tidak. Akun kasir (menggunakan PIN) hanya memiliki akses ke layar transaksi (POS) dan stok. Hanya Anda (Owner) dan Manajer yang bisa melihat laporan keuangan."
                                    },
                                    {
                                        q: "Apakah aplikasi ini bisa diakses lewat HP?",
                                        a: "Sangat bisa. Tampilan OutletKu sudah dioptimalkan (mobile-friendly) sehingga Anda bisa memantau omzet dari HP di mana saja dan kapan saja."
                                    },
                                    {
                                        q: "Bagaimana cara kerja login PIN Kasir?",
                                        a: "Anda (Owner) mendaftarkan nama kasir dan membuatkan PIN 6 digit untuk mereka. Di gerobak/outlet, kasir cukup membuka link khusus toko Anda, memilih namanya, dan memasukkan PIN tersebut untuk mulai berjualan."
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
                                    Siap Mengembangkan Bisnis Kuliner Anda?
                                </h2>
                                <p className="text-lg text-primary-foreground/80 mb-10">
                                    Tinggalkan catatan kertas yang berantakan. Beralih ke pencatatan digital yang rapi, aman, dan mudah dipantau.
                                </p>
                                <Link
                                    href={register()}
                                    className="inline-flex h-14 items-center justify-center rounded-full bg-background px-10 text-lg font-bold text-primary shadow-xl transition-transform hover:scale-105"
                                >
                                    Daftar Sekarang
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
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
                                <Store className="h-6 w-6 text-primary" />
                                <span className="text-xl font-bold tracking-tight">OutletKu</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                &copy; {new Date().getFullYear()} OutletKu. Dibuat dengan ❤️ untuk UMKM Indonesia.
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

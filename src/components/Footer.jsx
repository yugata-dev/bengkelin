import { Link } from 'react-router-dom'

const footerLinks = [
    { label: 'Home', to: '/' },
    { label: 'Dashboard Admin', to: '/login' },
    { label: 'Antrian', to: '/history' },
    { label: 'Track Status', to: '/track' },
    { label: 'Booking Services', to: '/booking' },
]

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border py-12 text-sm text-muted">
            <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <span className="font-neue text-2xl font-bold text-text tracking-wider">CAKARABANGKIT</span>
                    <span className="text-primary block text-xs font-bold tracking-[0.2em] -mt-1 mb-3">CAR SERVICE</span>
                    <p className="text-xs leading-relaxed">Bengkel terpercaya di Malang sejak 2018.</p>
                </div>

                <div>
                    <h4 className="text-text font-bold text-xs uppercase tracking-wider mb-4">Menu</h4>
                    <div className="flex flex-col space-y-2 text-xs">
                        {footerLinks.map((link) => (
                            <Link key={link.to} to={link.to} className="hover:text-primary transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-text font-bold text-xs uppercase tracking-wider mb-4">Kontak</h4>
                    <div className="space-y-2 text-xs">
                        <p>✉ cakarabangkit@gmail.com</p>
                        <p>📍 Malang, Jawa Timur</p>
                        <p>📱 +62 812-3456-7890</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-text font-bold text-xs uppercase tracking-wider mb-4">Jam Operasional</h4>
                    <div className="space-y-2 text-xs">
                        <p>⏰ Senin–Sabtu</p>
                        <p className="text-text font-semibold">08.00–17.00 WIB</p>
                        <p className="text-red-500">Minggu / Hari Besar: Tutup</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 border-t border-border/50 pt-6 text-center text-xs">
                <p>© {new Date().getFullYear()} Car Service Cakarabangkit. All rights reserved.</p>
            </div>
        </footer>
    )
}

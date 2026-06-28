import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";
import bengkelBg from "../assets/mehmet-talha-onuk-5M-72czGFl4-unsplash.jpg";
import useTrack from "../useTrack.jsx";
import useMekanik from "../useMekanik";
import { formatDurasi } from "../utils/formatDurasi"

const FadeInUp = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay, ease: [0.21, 1.11, 0.81, 0.99] }}
        className={className}
    >
        {children}
    </motion.div>
)

export default function Home() {
    const { track } = useTrack()
    const { mekanik, isLoading: isMekanikLoading } = useMekanik()
    const [layanan, setLayanan] = useState([])
    const [isLayananLoading, setIsLayananLoading] = useState(true)

    // STATE KOMENTAR + ANTI-SPAM - BARU
    const [comments, setComments] = useState([])
    const [isCommentsLoading, setIsCommentsLoading] = useState(true)
    const [cooldown, setCooldown] = useState(0)
    const [commentLoading, setCommentLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const [localForm, setLocalForm] = useState({
        name: '',
        message: '',
        rating: '⭐⭐⭐⭐⭐',
        website: '' // honeypot
    })

    // Countdown cooldown
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    // FETCH LAYANAN
    useEffect(() => {
        const fetchLayanan = async () => {
            setIsLayananLoading(true)
            const { data, error } = await supabase
                .from('layanan')
                .select('*')
                .eq('is_active', true)
                .order('harga', { ascending: true })

            if (error) {
                console.log('Error fetch layanan:', error)
            } else {
                setLayanan(data || [])
            }
            setIsLayananLoading(false)
        }
        fetchLayanan()
    }, [])

    // FETCH KOMENTAR
    useEffect(() => {
        fetchComments()
    }, [])

    const fetchComments = async () => {
        setIsCommentsLoading(true)
        const { data, error } = await supabase
            .from('form-comment')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) console.log('Error fetch comments:', error)
        else setComments(data || [])
        setIsCommentsLoading(false)
    }

    const antrianAktif = track.filter(item =>
        item.status === 'Booking' ||
        item.status === 'Proses' ||
        item.status === 'Menunggu Part'
    )

    // SUBMIT KOMENTAR ANTI-SPAM
    const handleCommentSubmit = async (e) => {
        e.preventDefault()
        setCommentLoading(true)
        setFormError('')

        // 1. HONEYPOT
        if (localForm.website !== '') {
            console.log('Bot terdeteksi')
            setCommentLoading(false)
            return
        }

        // 2. COOLDOWN
        const lastSubmit = localStorage.getItem('lastCommentTime')
        const now = Date.now()
        const delayMs = 30000

        if (lastSubmit && now - parseInt(lastSubmit) < delayMs) {
            const sisa = Math.ceil((delayMs - (now - parseInt(lastSubmit))) / 1000)
            setCooldown(sisa)
            setCommentLoading(false)
            setFormError(`Tunggu ${sisa} detik sebelum komentar lagi`)
            return
        }

        // 3. VALIDASI NAMA
        if (!localForm.name.trim()) {
            setCommentLoading(false)
            setFormError('Nama wajib diisi')
            return
        }

        if (localForm.name.trim().length < 3) {
            setCommentLoading(false)
            setFormError('Nama minimal 3 huruf')
            return
        }

        // 4. VALIDASI PESAN
        if (!localForm.message.trim()) {
            setCommentLoading(false)
            setFormError('Pesan wajib diisi')
            return
        }

        if (localForm.message.trim().length < 15) {
            setCommentLoading(false)
            setFormError('Pesan minimal 15 huruf')
            return
        }

        // 5. INSERT KE SUPABASE
        const { data, error } = await supabase
            .from('form-comment')
            .insert([{
                name: localForm.name.trim(),
                message: localForm.message.trim(),
                rating: localForm.rating
            }])
            .select()

        if (error) {
            console.log('Error:', error.message)
            setFormError('Gagal kirim ulasan. Coba lagi.')
        } else {
            localStorage.setItem('lastCommentTime', now.toString())
            setCooldown(30)
            setLocalForm({ name: '', message: '', rating: '⭐⭐⭐⭐⭐', website: '' })
            setFormError('')
            fetchComments()
            alert(`Terima kasih ${localForm.name}, ulasan Anda berhasil disimpan!`)
        }

        setCommentLoading(false)
    }

    return (
        <div className="bg-background text-text min-h-screen font-poppins">

            {/* =========================================================
                1. HERO SECTION
               ========================================================= */}
            <section
                id="hero"
                className="min-h-[calc(100vh-64px)] bg-cover bg-center relative flex items-center"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(15, 17, 21, 0.95) 0%, rgba(15, 17, 21, 0.85) 50%, rgba(15, 17, 21, 0.4) 100%),
                        url(${bengkelBg})
                    `,
                }}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 py-12">
                    <div className="lg:col-span-7 flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex items-center gap-2 mb-4"
                        >
                            <span className="w-8 h-0.5 bg-primary"></span>
                            <p className="text-primary font-bold text-xs tracking-[0.3em] uppercase">
                                TEMPLATE LANDING PAGE DEMO
                            </p>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                            className="font-neue text-6xl md:text-7xl font-bold leading-[0.9] tracking-wide uppercase mb-6"
                        >
                            <span className="text-text">TEMPLATE MODERN,</span><br />
                            <span className="text-primary">SIAP DIKUSTOMISASI.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                            className="text-gray-300 text-base max-w-md mb-8 leading-relaxed"
                        >
                            Konten ini sengaja dibuat sebagai contoh untuk menunjukkan tampilan landing page template. Anda bisa mengganti teks, warna, dan struktur sesuai kebutuhan brand atau bisnis Anda.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.6 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Link
                                to="../booking"
                                className="group bg-primary hover:bg-primary-hover rounded-md py-3.5 px-8 text-text font-semibold text-sm inline-flex items-center gap-3 transition-all duration-300 shadow-lg shadow-primary/20"
                            >
                                LIHAT DEMO FITUR
                                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                            </Link>
                            <Link
                                to="../track"
                                className="border border-border hover:bg-surface/50 rounded-md py-3.5 px-8 text-text font-semibold text-sm transition-all duration-300"
                            >
                                JELAJAHI TEMPLATE
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="lg:col-span-5 flex items-center lg:justify-end"
                    >
                        <div className="bg-surface/40 backdrop-blur-md border border-border p-6 rounded-xl w-full max-w-sm shadow-2xl">
                            <h3 className="text-text font-bold text-lg mb-4 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isMekanikLoading ? 'bg-gray-500' :
                                    mekanik?.status_bengkel === 'Buka' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                    }`}></span>
                                Status Demo Hari Ini
                            </h3>

                            {isMekanikLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-background rounded w-3/4"></div>
                                    <div className="h-4 bg-background rounded w-1/2"></div>
                                </div>
                            ) : mekanik ? (
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between border-b border-border/50 pb-2">
                                        <span className="text-muted">Status</span>
                                        <span className={`font-semibold ${mekanik.status_bengkel === 'Buka' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {mekanik.status_bengkel.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/50 pb-2">
                                        <span className="text-muted">Antrian Aktif</span>
                                        <span className="text-text font-semibold">{antrianAktif.length} Mobil</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/50 pb-2">
                                        <span className="text-muted">Mekanik Standby</span>
                                        <span className="text-text font-semibold">
                                            {mekanik.mekanik_standby}
                                            <span className="text-muted">/{mekanik.total_mekanik}</span>
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted text-sm">Data bengkel tidak tersedia</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* =========================================================
                2. SERVICES SECTION
               ========================================================= */}
            <section id="layanan" className="py-20 max-w-7xl mx-auto px-6 md:px-10">
                <FadeInUp className="text-center mb-12">
                    <h2 className="font-neue text-4xl font-bold tracking-wide text-primary">SAMPLE SERVICES</h2>
                    <p className="text-muted text-sm mt-2">Contoh blok layanan yang dapat Anda ubah sesuai kebutuhan bisnis Anda</p>
                </FadeInUp>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: "🛠", title: "Fitur Utama", desc: "Blok ini dapat dipakai untuk menampilkan layanan, fitur, atau value proposition utama Anda." },
                        { icon: "⚙", title: "Proses yang Rapi", desc: "Tampilan ini dirancang agar mudah dikustomisasi untuk berbagai jenis bisnis atau produk." },
                        { icon: "🛢", title: "Solusi Praktis", desc: "Gunakan bagian ini untuk menjelaskan manfaat, paket, atau alur kerja Anda secara singkat." }
                    ].map((service, i) => (
                        <FadeInUp key={i} delay={i * 0.15}>
                            <div className="bg-surface border border-border p-8 rounded-xl hover:border-primary transition-all duration-300 group h-full">
                                <div className="text-primary text-3xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
                                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                                <p className="text-muted text-sm leading-relaxed">{service.desc}</p>
                            </div>
                        </FadeInUp>
                    ))}
                </div>
            </section>

            {/* =========================================================
                3. ABOUT SECTION
               ========================================================= */}
            <section id="about" className="py-20 bg-dark border-y border-border">
                <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="font-neue text-4xl font-bold tracking-wide text-primary mb-4">ABOUT THIS TEMPLATE</h2>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Halaman ini sengaja dibuat sebagai contoh template landing page yang bisa dipakai untuk berbagai kebutuhan. Semua teks di sini hanya ilustrasi agar Anda lebih mudah melihat struktur dan nuansa desainnya.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-surface/50 border border-border p-4 rounded-lg text-center">
                                <h3 className="text-primary font-bold text-3xl font-neue">100+</h3>
                                <p className="text-muted text-xs uppercase tracking-wider mt-1">Contoh Statistik</p>
                            </div>
                            <div className="bg-surface/50 border border-border p-4 rounded-lg text-center">
                                <h3 className="text-primary font-bold text-3xl font-neue">500+</h3>
                                <p className="text-muted text-xs uppercase tracking-wider mt-1">Demo Item</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7 }}
                        className="relative h-64 md:h-full min-h-75 bg-surface rounded-xl overflow-hidden border border-border"
                    >
                        <img src={bengkelBg} alt="About Us" className="w-full h-full object-cover opacity-60" />
                    </motion.div>
                </div>
            </section>

            {/* =========================================================
                4. GALLERY SECTION
               ========================================================= */}
            <section id="gallery" className="py-20 max-w-7xl mx-auto px-6 md:px-10">
                <FadeInUp className="text-center mb-12">
                    <h2 className="font-neue text-4xl font-bold tracking-wide text-primary">DEMO GALLERY</h2>
                    <p className="text-muted text-sm mt-2">Area ini bisa dipakai untuk menampilkan contoh visual atau proyek Anda</p>
                </FadeInUp>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((num, i) => (
                        <motion.div
                            key={num}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-surface border border-border rounded-xl overflow-hidden aspect-video group relative"
                        >
                            <div className="w-full h-full bg-linear-to-t from-dark to-transparent absolute inset-0 z-10 opacity-60"></div>
                            <img src={bengkelBg} alt={`Gallery ${num}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <span className="absolute bottom-4 left-4 z-20 text-xs font-semibold bg-primary px-2 py-1 rounded">Demo Asset #{num}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* =========================================================
                5. PRICELIST SECTION
               ========================================================= */}
            <section id="pricelist" className="py-20 bg-dark border-y border-border">
                <div className="max-w-7xl mx-auto px-6 md:px-10">
                    <FadeInUp className="text-center mb-12">
                        <h2 className="font-neue text-4xl font-bold tracking-wide text-primary">DEMO PRICELIST</h2>
                        <p className="text-muted text-sm mt-2">Bagian ini bisa digunakan untuk menampilkan paket, harga, atau fitur utama</p>
                    </FadeInUp>

                    {isLayananLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-surface border border-border p-6 rounded-xl h-64 animate-pulse" />
                            ))}
                        </div>
                    ) : layanan.length === 0 ? (
                        <FadeInUp className="text-center py-12 text-muted bg-surface/10 border border-dashed border-border rounded-xl">
                            Belum ada data demo yang ditampilkan. Anda bisa mengisi data layanan sesuai kebutuhan.
                        </FadeInUp>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {layanan.map((item, i) => (
                                <FadeInUp key={item.id} delay={i * 0.1}>
                                    <div className="bg-surface border border-border p-6 rounded-xl hover:border-primary transition-all h-full flex-col">
                                        <span className="text-xs text-primary font-semibold uppercase">{item.kategori}</span>
                                        <h3 className="text-xl font-bold mt-2 mb-2">{item.nama_layanan}</h3>
                                        <p className="text-muted text-sm mb-4 flex-1">{item.deskripsi}</p>
                                        <div className="flex justify-between items-end border-t border-border pt-4">
                                            <div>
                                                <p className="text-xs text-muted">Estimasi</p>
                                                <p className="font-semibold">{formatDurasi(item.estimasi_menit)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted">Mulai dari</p>
                                                <p className="text-2xl font-bold text-primary">
                                                    Rp {item.harga.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </FadeInUp>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* =========================================================
                6. COMMENT SECTION
               ========================================================= */}
            <section id="comments" className="py-20 max-w-7xl mx-auto px-6 md:px-10 border-t border-border/50">
                <FadeInUp className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="font-neue text-4xl font-bold tracking-wide text-primary">SAMPLE TESTIMONIALS</h2>
                        <p className="text-muted text-sm mt-2">Contoh ulasan yang bisa Anda ganti dengan testimoni nyata atau mockup</p>
                    </div>
                    <div className="text-sm text-muted">
                        Total Ulasan: <span className="text-text font-semibold">{isCommentsLoading ? "..." : comments.length} Komentar</span>
                    </div>
                </FadeInUp>

                {isCommentsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                        <div className="bg-surface/50 border border-border/30 p-6 rounded-xl h-40"></div>
                        <div className="bg-surface/50 border border-border/30 p-6 rounded-xl h-40"></div>
                    </div>
                ) : comments.length === 0 ? (
                    <FadeInUp className="text-center py-12 text-muted bg-surface/10 border border-dashed border-border rounded-xl">
                        Belum ada testimoni demo. Anda bisa menambahkan ulasan atau menghapus bagian ini sesuai kebutuhan.
                    </FadeInUp>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {comments.map((comment, i) => (
                            <motion.div
                                key={comment.id || comment.created_at}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-surface border border-border p-6 rounded-xl flex flex-col justify-between hover:border-primary/50 transition-all duration-300"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-text font-bold text-base">{comment.name}</h4>
                                        </div>
                                        <div className="text-primary text-sm">
                                            {comment.rating}
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed italic">
                                        "{comment.message}"
                                    </p>
                                </div>
                                <div className="border-t border-border/50 mt-4 pt-3 text-center">
                                    <span className="text-xs text-muted font-mono">
                                        {comment.created_at ? new Date(comment.created_at).toLocaleDateString("id-ID") : "Baru saja"}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* =========================================================
                7. CONTACT & FEEDBACK SECTION - ANTI SPAM + RATING ASLI
               ========================================================= */}
            <section id="contact" className="py-20 bg-dark border-t border-border">
                <div className="max-w-4xl mx-auto px-6 md:px-10">
                    <FadeInUp className="text-center mb-12">
                        <h2 className="font-neue text-4xl font-bold tracking-wide text-primary">FEEDBACK & CONTACT DEMO</h2>
                        <p className="text-muted text-sm mt-2">Kolom ini bisa digunakan untuk formulir kontak, pertanyaan, atau feedback pengguna</p>
                    </FadeInUp>

                    <FadeInUp delay={0.2}>
                        <form onSubmit={handleCommentSubmit} className="bg-surface border border-border p-8 rounded-xl space-y-6">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    required
                                    value={localForm.name}
                                    onChange={(e) => setLocalForm({ ...localForm, name: e.target.value })}
                                    className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-text"
                                    placeholder="Masukkan nama Anda untuk demo..."
                                    maxLength={50}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">Rating</label>
                                <select
                                    className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-text"
                                    value={localForm.rating}
                                    onChange={(e) => setLocalForm({ ...localForm, rating: e.target.value })}
                                >
                                    <option value="⭐">⭐</option>
                                    <option value="⭐⭐">⭐⭐</option>
                                    <option value="⭐⭐⭐">⭐⭐⭐</option>
                                    <option value="⭐⭐⭐⭐">⭐⭐⭐⭐</option>
                                    <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">Pesan Anda *</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={localForm.message}
                                    onChange={(e) => setLocalForm({ ...localForm, message: e.target.value })}
                                    className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-text resize-none"
                                    placeholder="Tulis pesan demo Anda (minimal 15 karakter)..."
                                    minLength={15}
                                    maxLength={500}
                                ></textarea>
                                <p className="text-xs text-muted mt-1">
                                    {localForm.message.length}/500 karakter
                                </p>
                            </div>

                            {/* HONEYPOT */}
                            <input
                                type="text"
                                value={localForm.website}
                                onChange={(e) => setLocalForm({ ...localForm, website: e.target.value })}
                                className="absolute left-[-9999px] opacity-0 h-0 w-0"
                                tabIndex="-1"
                                autoComplete="off"
                                aria-hidden="true"
                            />

                            {formError && (
                                <div className="bg-red-500/10 border-red-500/20 text-red-400 px-4 py-3 rounded-md text-sm">
                                    {formError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={commentLoading || cooldown > 0}
                                className="w-full bg-primary hover:bg-primary-hover text-text font-bold text-sm py-3 rounded-md transition-colors duration-300 tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {commentLoading ? 'MENGIRIM...' : cooldown > 0 ? `TUNGGU ${cooldown} DETIK` : 'KIRIM PESAN DEMO'}
                            </button>
                        </form>
                    </FadeInUp>
                </div>
            </section>

        </div>
    );
}

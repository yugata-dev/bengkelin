import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import useTrack from '../useTrack.jsx'
import useMekanik from '../useMekanik'
import { supabase } from '../supabaseClient'
import AdminRow from '../components/AdminRow'
import { hitungJamSelesai } from '../utils/hitungJamSelesai'

const ADMIN_EMAILS = [import.meta.env.VITE_ADMIN_EMAIL]

function Admin() {
    const { track, setTrack, isLoading } = useTrack()
    const { mekanik, updateMekanik } = useMekanik()
    const [filterStatus, setFilterStatus] = useState('Semua')
    const [mekanikForm, setMekanikForm] = useState({
        total_mekanik: 5,
        mekanik_standby: 3,
        status_bengkel: 'Buka'
    })

    const [user, setUser] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)

    // STATE LAYANAN
    const [layanan, setLayanan] = useState([])
    const [layananLoading, setLayananLoading] = useState(false)
    const [isEditingLayanan, setIsEditingLayanan] = useState(false)
    const [currentLayananId, setCurrentLayananId] = useState(null)
    const [layananForm, setLayananForm] = useState({
        nama_layanan: '',
        deskripsi: '',
        harga: '',
        estimasi_menit: '',
        kategori: 'Servis Ringan',
        is_active: true
    })

    // STATE COMMENT
    const [comments, setComments] = useState([])
    const [commentsLoading, setCommentsLoading] = useState(false)

    // AUTH CHECK
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setAuthLoading(false)
        }
        checkUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    // SYNC MEKANIK FORM
    useEffect(() => {
        if (mekanik) {
            setMekanikForm({
                total_mekanik: mekanik.total_mekanik,
                mekanik_standby: mekanik.mekanik_standby,
                status_bengkel: mekanik.status_bengkel
            })
        }
    }, [mekanik])

    // FETCH DATA AWAL
    useEffect(() => {
        fetchLayanan()
        fetchComments()
    }, [])

    const fetchLayanan = async () => {
        setLayananLoading(true)
        const { data, error } = await supabase
            .from('layanan')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) console.log(error)
        else setLayanan(data || [])
        setLayananLoading(false)
    }

    const fetchComments = async () => {
        setCommentsLoading(true)
        const { data, error } = await supabase
            .from('form-comment')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.log('Error fetch comments:', error)
        } else {
            setComments(data || [])
        }
        setCommentsLoading(false)
    }

    const handleUpdateMekanik = async (e) => {
        e.preventDefault()
        const success = await updateMekanik(mekanikForm)
        if (success) {
            alert('Status mekanik berhasil diupdate!')
        } else {
            alert('Gagal update status mekanik')
        }
    }

    // CRUD LAYANAN
    const resetLayananForm = () => {
        setLayananForm({
            nama_layanan: '',
            deskripsi: '',
            harga: '',
            estimasi_menit: '',
            kategori: 'Servis Ringan',
            is_active: true
        })
        setIsEditingLayanan(false)
        setCurrentLayananId(null)
    }

    const handleSubmitLayanan = async (e) => {
        e.preventDefault()

        const payload = {
            ...layananForm,
            harga: parseInt(layananForm.harga),
            estimasi_menit: parseInt(layananForm.estimasi_menit)
        }

        if (isEditingLayanan) {
            const { error } = await supabase
                .from('layanan')
                .update(payload)
                .eq('id', currentLayananId)

            if (error) alert('Gagal update: ' + error.message)
            else alert('Berhasil update layanan')
        } else {
            const { error } = await supabase
                .from('layanan')
                .insert([payload])

            if (error) alert('Gagal tambah: ' + error.message)
            else alert('Berhasil tambah layanan')
        }

        resetLayananForm()
        fetchLayanan()
    }

    const handleEditLayanan = (item) => {
        setIsEditingLayanan(true)
        setCurrentLayananId(item.id)
        setLayananForm({
            nama_layanan: item.nama_layanan,
            deskripsi: item.deskripsi,
            harga: item.harga.toString(),
            estimasi_menit: item.estimasi_menit.toString(),
            kategori: item.kategori,
            is_active: item.is_active
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDeleteLayanan = async (id) => {
        if (!confirm('Yakin hapus layanan ini? Booking yang udah pake layanan ini gak bakal kehapus.')) return

        const { error } = await supabase
            .from('layanan')
            .delete()
            .eq('id', id)

        if (error) alert('Gagal hapus: ' + error.message)
        else {
            alert('Berhasil hapus')
            fetchLayanan()
        }
    }

    const toggleLayananActive = async (id, currentStatus) => {
        const { error } = await supabase
            .from('layanan')
            .update({ is_active: !currentStatus })
            .eq('id', id)

        if (!error) fetchLayanan()
    }

    // HAPUS KOMENTAR
    const handleDeleteComment = async (id) => {
        if (!confirm('Yakin hapus ulasan ini? Ini bakal ilang juga dari Home.')) return

        const { error } = await supabase
            .from('form-comment')
            .delete()
            .eq('id', id)

        if (error) {
            alert('Gagal hapus: ' + error.message)
        } else {
            alert('Ulasan berhasil dihapus')
            setComments(comments.filter(c => c.id !== id))
        }
    }

    const sendWhatsApp = (booking, newStatus) => {
        const messages = {
            'Proses': `Halo ${booking.nama}! 🔧 Kendaraan Anda (${booking.platno}) sedang dalam proses pengerjaan. Estimasi selesai: ${hitungJamSelesai(booking.jam_mulai || booking.jam, booking.estimasi)}. Terima kasih telah menunggu!`,
            'Quality Check': `Halo ${booking.nama}! 🔍 Kendaraan Anda (${booking.platno}) sedang dalam tahap Quality Check. Sebentar lagi selesai!`,
            'Selesai': `Halo ${booking.nama}! ✅ Kendaraan Anda (${booking.platno}) sudah selesai diservis. Silakan diambil. Terima kasih!`,
            'Menunggu Part': `Halo ${booking.nama}! 📦 Kendaraan Anda (${booking.platno}) sedang menunggu spare part. Kami akan segera menghubungi Anda kembali.`,
            'Batal': `Halo ${booking.nama}! ❌ Mohon maaf, booking Anda (${booking.platno}) dibatalkan. Silakan hubungi kami untuk info lebih lanjut.`
        }

        const message = messages[newStatus]
        if (!message) return

        const phone = booking.notelepon?.replace(/\D/g, '').replace(/^0/, '62')
        if (!phone) return

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    const updateStatus = async (id, newStatus) => {
        const booking = track.find(item => item.id === id)

        const { error } = await supabase
            .from('booking-table')
            .update({ status: newStatus })
            .eq('id', id)

        if (error) {
            alert(`Gagal update: ${error.message}`)
        } else {
            setTrack(track.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            ))
            if (booking) {
                sendWhatsApp(booking, newStatus)
            }
        }
    }

    const updateBookingData = (updatedData) => {
        setTrack(track.map(item =>
            item.id === updatedData.id ? updatedData : item
        ))
    }

    const deleteBooking = async (id) => {
        if (!confirm('Yakin mau hapus antrian ini?')) return

        const { error } = await supabase
            .from('booking-table')
            .delete()
            .eq('id', id)

        if (error) {
            alert(`Gagal hapus: ${error.message}`)
        } else {
            setTrack(track.filter(item => item.id !== id))
        }
    }

    const filteredTrack = filterStatus === 'Semua'
        ? track
        : track.filter(item => item.status === filterStatus)

    const sortedTrack = [...filteredTrack].sort((a, b) => {
        const statusWeight = { "Booking": 0, "Proses": 1, "Menunggu Part": 2, "Quality Check": 3, "Selesai": 4, "Batal": 5 }
        const weightA = statusWeight[a.status] ?? 99
        const weightB = statusWeight[b.status] ?? 99

        if (weightA !== weightB) return weightA - weightB

        const jamA = a.jam_mulai || a.jam
        const jamB = b.jam_mulai || b.jam
        return new Date(`${a.date}T${jamA}`) - new Date(`${b.date}T${jamB}`)
    })

    const isOverdueBooking = (booking) => {
        // Jika tidak ada data, return false
        if (!booking) return false

        // Jika sudah selesai atau dibatalkan, tidak perlu overdue
        if (booking.status === 'Selesai' || booking.status === 'Batal') return false

        // Hanya tandai overdue jika status "Proses" atau "Quality Check"
        if (booking.status !== 'Proses' && booking.status !== 'Quality Check') return false

        // Jika tidak ada jam_selesai, tidak bisa diperiksa
        if (!booking.jam_selesai) return false

        // Buat object waktu untuk jam_selesai hari ini
        const finishTime = new Date(`${booking.date}T${booking.jam_selesai}`)

        // Jika waktu tidak valid, skip
        if (Number.isNaN(finishTime.getTime())) return false

        // isOverdue = true jika jam sekarang SUDAH MELEWATI jam_selesai
        return new Date() > finishTime
    }

    const overdueCount = (track || []).filter(isOverdueBooking).length

    // AUTH GUARD
    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-muted">Checking authentication...</div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    const isAdmin = ADMIN_EMAILS.includes(user.email) || user.user_metadata?.role === 'admin'

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-text mb-2">Akses Ditolak</h2>
                    <p className="text-muted mb-4">Email {user.email} bukan admin</p>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-background text-text min-h-screen font-poppins py-12 px-6 md:px-10">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h2 className="font-neue text-4xl font-bold tracking-wide text-primary uppercase">
                            PANEL ADMIN
                        </h2>
                        <p className="text-muted text-sm mt-2">
                            Login sebagai: <span className="text-green-400">{user.email}</span>
                        </p>
                    </div>

                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded border border-red-500/20"
                    >
                        Logout
                    </button>
                </div>

                {/* ATUR MEKANIK */}
                <div className="bg-surface/40 backdrop-blur-md border border-border rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                        🔧 Atur Status Tim & Usaha
                    </h3>
                    <form onSubmit={handleUpdateMekanik} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-muted">Total Staff</label>
                            <input
                                type="number"
                                value={mekanikForm.total_mekanik}
                                onChange={(e) => setMekanikForm({ ...mekanikForm, total_mekanik: parseInt(e.target.value) || 0 })}
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted">Staff Standby</label>
                            <input
                                type="number"
                                value={mekanikForm.mekanik_standby}
                                onChange={(e) => setMekanikForm({ ...mekanikForm, mekanik_standby: parseInt(e.target.value) || 0 })}
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                                min="0"
                                max={mekanikForm.total_mekanik}
                            />
                            <p className="text-xs text-muted mt-1">
                                Yang tersedia: {mekanikForm.total_mekanik - mekanikForm.mekanik_standby}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs text-muted">Status Usaha</label>
                            <select
                                value={mekanikForm.status_bengkel}
                                onChange={(e) => setMekanikForm({ ...mekanikForm, status_bengkel: e.target.value })}
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                            >
                                <option value="Buka">Buka</option>
                                <option value="Tutup">Tutup</option>
                                <option value="Istirahat">Istirahat</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded"
                            >
                                Update Status
                            </button>
                        </div>
                    </form>
                </div>

                {/* CRUD LAYANAN */}
                <div className="bg-surface/40 backdrop-blur-md border border-border rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                        💰 Kelola Layanan & Harga
                    </h3>

                    <form onSubmit={handleSubmitLayanan} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="text-xs text-muted">Nama Layanan *</label>
                            <input
                                type="text"
                                value={layananForm.nama_layanan}
                                onChange={(e) => setLayananForm({ ...layananForm, nama_layanan: e.target.value })}
                                placeholder="Ganti Oli + Filter"
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted">Kategori</label>
                            <select
                                value={layananForm.kategori}
                                onChange={(e) => setLayananForm({ ...layananForm, kategori: e.target.value })}
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                            >
                                <option value="Servis Ringan">Servis Ringan</option>
                                <option value="Servis Sedang">Servis Sedang</option>
                                <option value="Servis Besar">Servis Besar</option>
                                <option value="Tune Up">Tune Up</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted">Harga *</label>
                            <input
                                type="number"
                                value={layananForm.harga}
                                onChange={(e) => setLayananForm({ ...layananForm, harga: e.target.value })}
                                placeholder="150000"
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                                required
                                min="0"
                            />
                            <p className="text-xs text-muted mt-1">
                                Rp {parseInt(layananForm.harga || 0).toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs text-muted">Estimasi Menit *</label>
                            <input
                                type="number"
                                value={layananForm.estimasi_menit}
                                onChange={(e) => setLayananForm({ ...layananForm, estimasi_menit: e.target.value })}
                                placeholder="30"
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                                required
                                min="1"
                            />
                            <p className="text-xs text-muted mt-1">
                                {Math.floor((layananForm.estimasi_menit || 0) / 60)} jam {(layananForm.estimasi_menit || 0) % 60} menit
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-muted">Deskripsi</label>
                            <input
                                type="text"
                                value={layananForm.deskripsi}
                                onChange={(e) => setLayananForm({ ...layananForm, deskripsi: e.target.value })}
                                placeholder="Oli Shell HX6 4L + Filter Ori"
                                className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                            />
                        </div>
                        <div className="flex items-end gap-3 md:col-span-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active_layanan"
                                    checked={layananForm.is_active}
                                    onChange={(e) => setLayananForm({ ...layananForm, is_active: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="is_active_layanan" className="text-sm">Aktif</label>
                            </div>
                            <button
                                type="submit"
                                className="bg-primary hover:bg-primary-hover px-6 py-2 rounded-md font-bold text-sm uppercase flex-1 md:flex-none"
                            >
                                {isEditingLayanan ? 'UPDATE' : 'TAMBAH'} LAYANAN
                            </button>
                            {isEditingLayanan && (
                                <button
                                    type="button"
                                    onClick={resetLayananForm}
                                    className="border border-border px-6 py-2 rounded-md font-bold text-sm uppercase"
                                >
                                    BATAL
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-bold text-muted mb-3 uppercase">Daftar Layanan</h4>
                        {layananLoading ? (
                            <div className="text-center text-muted py-4">Loading...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-background">
                                        <tr className="text-xs text-muted uppercase">
                                            <th className="text-left p-3">Layanan</th>
                                            <th className="text-left p-3">Harga</th>
                                            <th className="text-left p-3">Estimasi</th>
                                            <th className="text-left p-3">Status</th>
                                            <th className="text-right p-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {layanan.map((item) => (
                                            <tr key={item.id} className="border-t border-border/50">
                                                <td className="p-3">
                                                    <p className="font-bold">{item.nama_layanan}</p>
                                                    <p className="text-xs text-muted">{item.kategori}</p>
                                                </td>
                                                <td className="p-3 font-bold text-primary">
                                                    Rp {item.harga.toLocaleString('id-ID')}
                                                </td>
                                                <td className="p-3">{item.estimasi_menit} menit</td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => toggleLayananActive(item.id, item.is_active)}
                                                        className={`px-2 py-1 rounded text-xs font-semibold ${item.is_active
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-red-500/20 text-red-400'
                                                            }`}
                                                    >
                                                        {item.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                    </button>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => handleEditLayanan(item)}
                                                            className="text-primary hover:text-primary-hover text-xs font-semibold"
                                                        >
                                                            EDIT
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLayanan(item.id)}
                                                            className="text-red-500 hover:text-red-400 text-xs font-semibold"
                                                        >
                                                            HAPUS
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {layanan.length === 0 && (
                                    <div className="text-center text-muted py-8">Belum ada layanan</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* KELOLA KOMENTAR */}
                {/* KELOLA KOMENTAR */}
                <div className="bg-surface/40 backdrop-blur-md border border-border rounded-xl p-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-text flex items-center gap-2">
                            💬 Kelola Ulasan Pelanggan
                        </h3>
                        <button
                            onClick={fetchComments}
                            className="text-xs bg-background hover:bg-surface px-3 py-2 rounded border border-border"
                        >
                            🔄 Reload
                        </button>
                    </div>

                    <div className="max-h-125 overflow-y-auto space-y-3">
                        {commentsLoading ? (
                            <div className="text-center text-muted py-4">Loading komentar...</div>
                        ) : comments.length === 0 ? (
                            <div className="text-center text-muted py-8">Belum ada ulasan</div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="bg-background border border-border p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold">{comment.name}</p>
                                            <div className="flex gap-1 text-primary text-sm">
                                                {[...Array(comment.rating || 5)].map((_, i) => (
                                                    <span key={i}>{comment.rating}</span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-xs text-muted">
                                                    {new Date(comment.created_at).toLocaleDateString('id-ID')}
                                                </p>
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-red-500 hover:text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/10"
                                                >
                                                    HAPUS
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted leading-relaxed">{comment.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div> {/* Penutup Section Kelola Komentar */}

                {/* FILTER BOOKING */}
                <div className="flex items-center my-6 gap-2">
                    <label className="text-xs uppercase font-semibold text-muted tracking-wider">Filter:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-surface border border-border rounded-md px-3 py-2 text-xs text-text focus:outline-none focus:border-primary cursor-pointer"
                    >
                        <option value="Semua">🔍 Semua Status</option>
                        <option value="Booking">🕒 Booking</option>
                        <option value="Proses">🔧 Sedang Proses</option>
                        <option value="Menunggu Part">📦 Menunggu Part</option>
                        <option value="Quality Check">🔍 Quality Check</option>
                        <option value="Selesai">✅ Selesai</option>
                        <option value="Batal">❌ Batal</option>
                    </select>
                </div>

                {/* TABLE BOOKING */}
                {overdueCount > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-4 mb-4">
                        <p className="font-semibold">⚠️ Ada {overdueCount} booking overdue</p>
                        <p className="text-sm text-muted">Booking yang melewati estimasi selesai tetapi belum ditandai selesai perlu ditindaklanjuti.</p>
                    </div>
                )}
                <div className="bg-surface/40 backdrop-blur-md border border-border rounded-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-surface border-b border-border/80 text-muted text-xs uppercase tracking-wider font-semibold">
                                    <th className="py-4 px-6 text-center">No</th>
                                    <th className="py-4 px-6">Pelanggan</th>
                                    <th className="py-4 px-6">Plat No</th>
                                    <th className="py-4 px-6">Kendaraan</th>
                                    <th className="py-4 px-6">Keluhan</th>
                                    <th className="py-4 px-6 text-center">Jam Masuk</th>
                                    <th className="py-4 px-6 text-center">Estimasi Kelar</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                    <th className="py-4 px-6 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-muted">
                                            Loading data...
                                        </td>
                                    </tr>
                                ) : sortedTrack.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-muted">
                                            📭 Tidak ada data antrian
                                        </td>
                                    </tr>
                                ) : (
                                    sortedTrack.map((data, index) => (
                                        <AdminRow
                                            key={data.id}
                                            data={data}
                                            index={index}
                                            isOverdue={isOverdueBooking(data)}
                                            onUpdateStatus={updateStatus}
                                            onDelete={deleteBooking}
                                            onUpdateData={updateBookingData}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Admin

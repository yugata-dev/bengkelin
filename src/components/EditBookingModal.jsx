import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

function EditBookingModal({ data, onClose, onSave }) {
    const [form, setForm] = useState({
        nama: data.nama || '',
        notelepon: data.notelepon || '',
        namamobil: data.namamobil || '',
        platno: data.platno || '',
        kategoriservis: data.kategoriservis || '',
        jam: data.jam || '',
        jam_mulai: data.jam_mulai || '',
        date: data.date || '',
        estimasi: data.estimasi || '60',
        status: data.status || 'Booking'
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Fix 1: Kalo jam_mulai kosong, kirim null bukan ""
        const payload = {
            ...form,
            estimasi: parseInt(form.estimasi),
            jam_mulai: form.jam_mulai || null // <- ini penting
        }

        // Fix 3: Auto ganti status ke 'Proses' kalo isi jam_mulai tapi status masih 'Booking'
        if (form.jam_mulai && form.status === 'Booking') {
            payload.status = 'Proses'
        }

        const { error } = await supabase
            .from('booking-table')
            .update(payload)
            .eq('id', data.id)

        setLoading(false)

        if (error) {
            alert(`Gagal update: ${error.message}`)
        } else {
            onSave({ ...data, ...payload })
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-primary mb-4">Edit Booking #{data.id}</h3>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fix 2: Lengkapin semua field */}
                    <div>
                        <label className="text-xs text-muted">Nama Pelanggan</label>
                        <input
                            type="text"
                            value={form.nama}
                            onChange={(e) => setForm({ ...form, nama: e.target.value })}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted">No. HP</label>
                        <input
                            type="text"
                            value={form.notelepon}
                            onChange={(e) => setForm({ ...form, notelepon: e.target.value })}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted">Plat No</label>
                        <input
                            type="text"
                            value={form.platno}
                            onChange={(e) => setForm({ ...form, platno: e.target.value })}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted">Mobil</label>
                        <input
                            type="text"
                            value={form.namamobil}
                            onChange={(e) => setForm({ ...form, namamobil: e.target.value })}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs text-muted">Kategori Servis</label>
                        <input
                            type="text"
                            value={form.kategoriservis}
                            onChange={(e) => setForm({ ...form, kategoriservis: e.target.value })}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted">Jam Booking / Janji</label>
                        <input
                            type="time"
                            value={form.jam}
                            onChange={(e) => setForm({ ...form, jam: e.target.value })}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                            style={{ colorScheme: 'dark' }}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted">
                            Jam Mulai Servis
                            <span className="text-green-400 ml-1">*Isi saat mobil datang</span>
                        </label>
                        <input
                            type="time"
                            value={form.jam_mulai}
                            onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                            style={{ colorScheme: 'dark' }}
                        />
                        <p className="text-xs text-muted mt-1">
                            Kosongkan jika mobil belum datang
                        </p>
                    </div>

                    <div>
                        <label className="text-xs text-muted">Tanggal</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                            style={{ colorScheme: 'dark' }}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-muted">Estimasi (menit)</label>
                        <input
                            type="number"
                            value={form.estimasi}
                            onChange={(e) => setForm({ ...form, estimasi: e.target.value })}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                            min="1"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs text-muted">Status</label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full bg-background border border-border rounded px-3 py-2 text-sm mt-1"
                        >
                            <option value="Booking">Booking</option>
                            <option value="Proses">Proses</option>
                            <option value="Menunggu Part">Menunggu Part</option>
                            <option value="Selesai">Selesai</option>
                            <option value="Batal">Batal</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 flex gap-3 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-2 rounded disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 bg-surface border border-border rounded hover:bg-background"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditBookingModal

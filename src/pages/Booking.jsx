import React, { useState, useEffect } from 'react'
import { supabase } from "../supabaseClient"
import useInputBooking from '../useInputBooking'
import useTrack from '../useTrack'

function Booking() {
    const { track, setTrack, isLoading } = useTrack()
    const { state, dispatch } = useInputBooking()
    const [cooldown, setCooldown] = useState(0)
    const [phoneError, setPhoneError] = useState('')
    const [platError, setPlatError] = useState('')
    const [layananList, setLayananList] = useState([])

    // Fetch layanan dari supabase
    useEffect(() => {
        const fetchLayanan = async () => {
            const { data } = await supabase
                .from('layanan')
                .select('*')
                .eq('is_active', true)
                .order('harga', { ascending: true })

            if (data) setLayananList(data)
        }
        fetchLayanan()
    }, [])

    // Countdown timer buat cooldown
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    // Auto isi estimasi + harga pas pilih layanan
    const handleLayananSelect = (e) => {
        const selectedId = e.target.value
        const layanan = layananList.find(l => l.id == selectedId)

        if (layanan) {
            dispatch({ type: "SERVIS", payload: layanan.nama_layanan })
            dispatch({ type: "ESTIMASI", payload: layanan.estimasi_menit.toString() })
        } else {
            dispatch({ type: "SERVIS", payload: '' })
            dispatch({ type: "ESTIMASI", payload: '' })
        }
    }

    // VALIDASI NO HP - auto format ke +62
    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '')

        if (value.startsWith('08')) {
            value = '+62' + value.slice(1)
            setPhoneError('')
        } else if (value.startsWith('62')) {
            value = '+' + value
            setPhoneError('')
        } else if (value === '') {
            setPhoneError('')
        } else if (!value.startsWith('+62')) {
            setPhoneError('No HP harus dimulai 08 atau +62')
        }

        dispatch({ type: "NO", payload: value })
    }

    // VALIDASI PLAT NOMOR
    const handlePlatChange = (e) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '')
        value = value.replace(/\s+/g, ' ').trimStart()

        // Auto format: B1234ABC -> B 1234 ABC
        if (value && !value.includes(' ')) {
            const match = value.match(/^([A-Z]{1,2})(\d{0,4})([A-Z]{0,3})$/)
            if (match) {
                const [, hurufAwal, angka, hurufAkhir] = match
                value = hurufAwal
                if (angka) value += ' ' + angka
                if (hurufAkhir) value += ' ' + hurufAkhir
            }
        }

        if (value.length <= 12) {
            dispatch({ type: "PLATNO", payload: value })

            const platRegex = /^[A-Z]{1,2}\s\d{1,4}(\s[A-Z]{1,3})?$/
            if (value && !platRegex.test(value)) {
                setPlatError('Format: B 1234 ABC')
            } else {
                setPlatError('')
            }
        }
    }

    const addList = async (e) => {
        e.preventDefault()

        // 1. CEK HONEYPOT
        if (state.inputWebsite !== '') {
            console.log('Bot terdeteksi')
            return
        }

        // 2. CEK COOLDOWN
        const lastSubmit = localStorage.getItem('lastBookingTime')
        const now = Date.now()
        const delayMs = 30000

        if (lastSubmit && now - parseInt(lastSubmit) < delayMs) {
            const sisa = Math.ceil((delayMs - (now - parseInt(lastSubmit))) / 1000)
            setCooldown(sisa)
            alert(`Tunggu ${sisa} detik sebelum booking lagi ya`)
            return
        }

        // 3. VALIDASI NO HP
        if (!state.inputNo || !state.inputNo.startsWith('+62') || phoneError) {
            setPhoneError('No HP harus dimulai 08 atau +62')
            return
        }

        // 4. VALIDASI PLAT NOMOR
        if (state.inputPlatNo && platError) {
            alert('Format plat nomor salah. Contoh: B 1234 ABC')
            return
        }

        // 5. VALIDASI TANGGAL
        const today = new Date().toISOString().split('T')[0]
        if (state.inputDate < today) {
            return alert("Tanggal booking tidak boleh kemarin!")
        }

        // 6. VALIDASI INPUT WAJIB
        if (!state.inputDate || !state.inputNama || !state.inputJam || !state.inputEstimasi || !state.inputNo || !state.inputServis) {
            return alert("Lengkapi semua input wajib!")
        }

        const selectedLayanan = layananList.find(l => l.nama_layanan === state.inputServis)

        const inputValue = {
            nama: state.inputNama,
            notelepon: state.inputNo,
            namamobil: state.inputMobil,
            platno: state.inputPlatNo,
            kategoriservis: state.inputServis,
            status: "Booking",
            jam: state.inputJam,
            date: state.inputDate,
            estimasi: parseInt(state.inputEstimasi),
            harga: selectedLayanan?.harga || 0
        }

        const { data, error } = await supabase.from("booking-table").insert([inputValue]).select()

        if (error) {
            console.log("Error", error.message)
            alert(`Gagal nambah booking: ${error.message}`)
        } else {
            localStorage.setItem('lastBookingTime', now.toString())
            setCooldown(30)
            dispatch({ type: "RESET" })
            setPhoneError('')
            setPlatError('')
            setTrack([...track, data[0]])
            alert('Booking berhasil ditambah!')
        }
    }

    const today = new Date().toISOString().split('T')[0]
    const selectedLayanan = layananList.find(l => l.nama_layanan === state.inputServis)

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background text-text font-poppins flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-surface border border-border p-6 md:p-8 rounded-xl shadow-2xl my-8">
                <h2 className="font-neue text-3xl font-bold text-center text-primary mb-2 tracking-wide uppercase">
                    BOOKING SERVICES
                </h2>
                <p className="text-center text-muted text-xs uppercase tracking-wider mb-8">
                    Daftarkan kendaraan Anda untuk antrean servis berkala
                </p>

                <form onSubmit={addList} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Input Nama */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted">Nama Pelanggan *</label>
                        <input
                            type="text"
                            value={state.inputNama}
                            onChange={(e) => dispatch({ type: "NAMA", payload: e.target.value })}
                            placeholder="Masukkan nama..."
                            className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-text placeholder:text-muted/50"
                            required
                        />
                    </div>

                    {/* Input No HP */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted">No. HP / WhatsApp *</label>
                        <input
                            type="tel"
                            value={state.inputNo}
                            onChange={handlePhoneChange}
                            placeholder="08xxx atau +62xxx"
                            className={`w-full bg-background border rounded-md px-4 py-3 text-sm focus:outline-none transition-colors text-text placeholder:text-muted/50 ${phoneError ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'
                                }`}
                            required
                        />
                        {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}
                    </div>

                    {/* Input Mobil */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted">Jenis/Merk Mobil</label>
                        <input
                            type="text"
                            value={state.inputMobil}
                            onChange={(e) => dispatch({ type: "MOBIL", payload: e.target.value })}
                            placeholder="Contoh: Avanza, Civic..."
                            className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-text placeholder:text-muted/50"
                        />
                    </div>

                    {/* Input Plat No */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted">Plat Nomor</label>
                        <input
                            type="text"
                            value={state.inputPlatNo}
                            onChange={handlePlatChange}
                            placeholder="Contoh: B 1234 ABC"
                            className={`w-full bg-background border rounded-md px-4 py-3 text-sm focus:outline-none transition-colors text-text placeholder:text-muted/50 ${platError ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'
                                }`}
                            maxLength="12"
                        />
                        {platError ? (
                            <p className="text-red-500 text-xs">{platError}</p>
                        ) : (
                            <p className="text-xs text-muted">Format: B 1234 ABC atau BE 1234 DF</p>
                        )}
                    </div>

                    {/* SELECT LAYANAN - GANTI DARI INPUT */}
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted">Pilih Layanan *</label>
                        <select
                            value={layananList.find(l => l.nama_layanan === state.inputServis)?.id || ''}
                            onChange={handleLayananSelect}
                            className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-text"
                            required
                        >
                            <option value="" disabled>Pilih jenis servis...</option>
                            {layananList.map(l => (
                                <option key={l.id} value={l.id}>
                                    {l.nama_layanan} - Rp {l.harga.toLocaleString('id-ID')} ({l.estimasi_menit} menit)
                                </option>
                            ))}
                        </select>

                        {/* Info detail layanan yang dipilih */}
                        {selectedLayanan && (
                            <div className="bg-background/50 border border-border rounded p-3 mt-2">
                                <p className="text-xs text-muted">{selectedLayanan.deskripsi}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <div>
                                        <p className="text-xs text-muted">Estimasi Pengerjaan</p>
                                        <p className="text-sm font-bold text-text">{selectedLayanan.estimasi_menit} menit</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted">Biaya</p>
                                        <p className="text-lg font-bold text-primary">
                                            Rp {selectedLayanan.harga.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Jam */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted">Jam Masuk *</label>
                        <input
                            type="time"
                            value={state.inputJam}
                            onChange={(e) => dispatch({ type: "JAM", payload: e.target.value })}
                            className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-text"
                            style={{ colorScheme: 'dark' }}
                            required
                        />
                    </div>

                    {/* Input Tanggal */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted">Tanggal *</label>
                        <input
                            type="date"
                            value={state.inputDate}
                            onChange={(e) => dispatch({ type: "DATE", payload: e.target.value })}
                            min={today}
                            className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-text"
                            style={{ colorScheme: 'dark' }}
                            required
                        />
                    </div>

                    {/* HONEYPOT */}
                    <input
                        type="text"
                        value={state.inputWebsite}
                        onChange={(e) => dispatch({ type: "WEBSITE", payload: e.target.value })}
                        className="absolute left-[-9999px] opacity-0 h-0 w-0"
                        tabIndex="-1"
                        autoComplete="off"
                        aria-hidden="true"
                    />

                    {/* Tombol Submit */}
                    <button
                        type="submit"
                        className="md:col-span-2 mt-4 bg-primary hover:bg-primary-hover text-text font-bold text-sm py-3.5 rounded-md transition-colors duration-300 tracking-wider uppercase cursor-pointer shadow-lg shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading || cooldown > 0}
                    >
                        {isLoading ? 'MENYIMPAN...' : cooldown > 0 ? `TUNGGU ${cooldown} DETIK` : 'TAMBAH ANTREAN BENGKEL'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Booking

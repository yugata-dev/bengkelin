import React, { useState } from 'react'
import useTrack from '../useTrack'
import { hitungJamSelesai } from '../utils/hitungJamSelesai'
import { formatDurasi } from '../utils/formatDurasi'

function Antrian() {
    const { track, isLoading } = useTrack()
    const [filterStatus, setFilterStatus] = useState('Semua')

    // TAMPILIN YANG MASIH ANTRI: Booking, Proses, Menunggu Part
    const antrianAktif = track.filter(item =>
        item.status === 'Booking' ||
        item.status === 'Proses' ||
        item.status === 'Menunggu Part'
    )

    const filteredTrack = filterStatus === 'Semua'
        ? antrianAktif
        : antrianAktif.filter(item => item.status === filterStatus)

    // Sort: Proses paling atas, terus Booking, terus Menunggu Part
    const sortedTrack = [...filteredTrack].sort((a, b) => {
        const statusWeight = { "Proses": 0, "Booking": 1, "Menunggu Part": 2 }
        const weightA = statusWeight[a.status] ?? 99
        const weightB = statusWeight[b.status] ?? 99

        if (weightA !== weightB) return weightA - weightB

        // Kalo status sama, sort by jam dateng
        const jamA = a.jam_mulai || a.jam
        const jamB = b.jam_mulai || b.jam
        return new Date(`${a.date}T${jamA}`) - new Date(`${b.date}T${jamB}`)
    })

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Proses': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
            case 'Menunggu Part': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            case 'Booking': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Proses': return '🔧'
            case 'Menunggu Part': return '📦'
            case 'Booking': return '🕒'
            default: return '❓'
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background text-text font-poppins flex flex-col items-center p-4 py-12">
            <div className="w-full max-w-7xl">
                <h2 className="font-neue text-3xl font-bold text-center text-primary mb-2 tracking-wide uppercase">
                    ANTRIAN SERVIS
                </h2>
                <p className="text-center text-muted text-xs uppercase tracking-wider mb-8">
                    Live antrian bengkel hari ini • {antrianAktif.length} mobil
                </p>

                {/* Filter Status */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
                        <button
                            onClick={() => setFilterStatus('Semua')}
                            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${filterStatus === 'Semua'
                                ? 'bg-primary text-white'
                                : 'text-muted hover:text-text'
                                }`}
                        >
                            Semua ({antrianAktif.length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('Proses')}
                            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${filterStatus === 'Proses'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'text-muted hover:text-text'
                                }`}
                        >
                            🔧 Proses ({antrianAktif.filter(i => i.status === 'Proses').length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('Booking')}
                            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${filterStatus === 'Booking'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'text-muted hover:text-text'
                                }`}
                        >
                            🕒 Booking ({antrianAktif.filter(i => i.status === 'Booking').length})
                        </button>
                        <button
                            onClick={() => setFilterStatus('Menunggu Part')}
                            className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors ${filterStatus === 'Menunggu Part'
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'text-muted hover:text-text'
                                }`}
                        >
                            📦 Nunggu Part ({antrianAktif.filter(i => i.status === 'Menunggu Part').length})
                        </button>
                    </div>
                </div>

                {/* Tabel Antrian */}
                <div className="bg-surface/40 backdrop-blur-md border border-border rounded-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-surface border-b border-border/80 text-muted text-xs uppercase tracking-wider font-semibold">
                                    <th className="py-4 px-6 text-center">No</th>
                                    <th className="py-4 px-6">Pelanggan</th>
                                    <th className="py-4 px-6">Plat No</th>
                                    <th className="py-4 px-6">Mobil</th>
                                    <th className="py-4 px-6">Keluhan</th>
                                    <th className="py-4 px-6 text-center">Jam Booking</th>
                                    <th className="py-4 px-6 text-center">Mulai Servis</th>
                                    <th className="py-4 px-6 text-center">Est. Kelar</th>
                                    <th className="py-4 px-6 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-muted">
                                            Loading antrian...
                                        </td>
                                    </tr>
                                ) : sortedTrack.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="py-12 text-center text-muted">
                                            🎉 Bengkel kosong, nggak ada antrian
                                        </td>
                                    </tr>
                                ) : (
                                    sortedTrack.map((data, index) => {
                                        const jamAcuan = data.jam_mulai || data.jam
                                        const jamKelar = hitungJamSelesai(jamAcuan, data.estimasi)

                                        return (
                                            <tr
                                                key={data.id}
                                                className={`hover:bg-surface/50 transition-colors ${data.status === 'Proses' ? 'bg-yellow-500/5' : ''
                                                    }`}
                                            >
                                                <td className="py-4 px-6 text-center font-mono text-muted">
                                                    {index + 1}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-semibold">{data.nama}</div>
                                                    <div className="text-xs text-muted">{data.notelepon}</div>
                                                </td>
                                                <td className="py-4 px-6 font-semibold font-mono text-primary">
                                                    {data.platno}
                                                </td>
                                                <td className="py-4 px-6 text-gray-300">
                                                    {data.namamobil}
                                                </td>
                                                <td className="py-4 px-6 text-gray-400 max-w-xs truncate">
                                                    {data.kategoriservis}
                                                </td>
                                                <td className="py-4 px-6 text-center font-mono text-xs text-muted">
                                                    {data.jam}
                                                </td>
                                                <td className="py-4 px-6 text-center font-mono text-xs">
                                                    {data.jam_mulai ? (
                                                        <span className="text-green-400 font-bold">
                                                            {data.jam_mulai}
                                                        </span>
                                                    ) : (
                                                        <span className="text-yellow-400 text-">
                                                            Belum datang
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center font-mono text-sm text-primary font-bold">
                                                    {jamKelar}
                                                    {!data.jam_mulai && (
                                                        <div className="text- text-yellow-400 font-normal">
                                                            *estimasi
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(data.status)}`}>
                                                        <span>{getStatusIcon(data.status)}</span>
                                                        {data.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Footer */}
                <div className="mt-6 text-center text-xs text-muted">
                    <p>*Estimasi kelar dihitung dari jam mulai servis + durasi pengerjaan</p>
                </div>
            </div>
        </div>
    )
}

export default Antrian
import { useState } from 'react'
import useTrack from '../useTrack.jsx'
import { hitungJamSelesai } from '../utils/hitungJamSelesai'

function Track() {
    const { track, isLoading } = useTrack()
    const [searchPlat, setSearchPlat] = useState('')
    const [filteredTrack, setFilteredTrack] = useState([])
    const [hasSearched, setHasSearched] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)

    const handleSearch = (e) => {
        e.preventDefault()
        setSearchLoading(true)
        setHasSearched(true)

        const keyword = searchPlat.trim().toLowerCase().replace(/\s/g, '')

        if (!keyword) {
            setFilteredTrack([])
            setSearchLoading(false)
            return
        }

        setTimeout(() => {
            const result = track.filter(
                item => item.platno.toLowerCase().replace(/\s/g, '') === keyword
            )
            setFilteredTrack(result)
            setSearchLoading(false)
        }, 300)
    }

    const handleInputChange = (e) => {
        setSearchPlat(e.target.value)
        if (e.target.value.trim() === '') {
            setFilteredTrack([])
            setHasSearched(false)
        }
    }

    const dataToShow = hasSearched ? filteredTrack : []

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Selesai': return 'bg-green-500/10 text-green-400 border-green-500/20'
            case 'Proses': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            case 'Menunggu Part': return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            case 'Booking': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'Batal': return 'bg-red-500/10 text-red-400 border-red-500/20'
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }
    }

    // FIX: Tambah step 3 Quality Check
    const getStepStatus = (status) => {
        switch (status) {
            case 'Booking': return 1
            case 'Proses': return 2
            case 'Menunggu Part': return 2
            case 'Quality Check': return 3 // <- TAMBAH INI
            case 'Selesai': return 4
            case 'Batal': return 0
            default: return 1
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-background text-text font-poppins flex flex-col items-center p-4 py-12">
            <div className="w-full max-w-4xl">
                <h2 className="font-neue text-3xl font-bold text-center text-primary mb-2 tracking-wide uppercase">
                    LACAK SERVIS
                </h2>
                <p className="text-center text-muted text-xs uppercase tracking-wider mb-8">
                    Masukkan plat nomor untuk cek progress real-time
                </p>

                <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-md mx-auto">
                    <input
                        type="text"
                        value={searchPlat}
                        onChange={handleInputChange}
                        placeholder="B 1234 ABC"
                        className="flex-1 bg-surface border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-text placeholder:text-muted/50 uppercase"
                        autoFocus
                        maxLength={12}
                    />
                    <button
                        type="submit"
                        disabled={searchLoading || !searchPlat.trim()}
                        className="bg-primary hover:bg-primary-hover text-white font-bold px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {searchLoading ? '...' : 'Lacak'}
                    </button>
                </form>

                <div className="space-y-6">
                    {isLoading || searchLoading ? (
                        <div className="text-center py-12 text-muted">
                            <div className="animate-pulse">Loading data...</div>
                        </div>
                    ) : !hasSearched ? (
                        <div className="text-center py-16 text-muted">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-lg font-semibold text-text mb-2">Lacak Servis Mobil Kamu</p>
                            <p className="text-sm">Masukkan plat nomor di atas untuk melihat status servis</p>
                        </div>
                    ) : dataToShow.length === 0 ? (
                        <div className="text-center py-12 text-muted">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-lg font-semibold text-text mb-2">Plat tidak ditemukan</p>
                            <p className="text-sm">Pastikan plat nomor benar: <span className="text-primary font-mono">{searchPlat.toUpperCase()}</span></p>
                            <p className="text-xs mt-3 text-muted/70">Atau mobil belum masuk antrian bengkel</p>
                        </div>
                    ) : (
                        dataToShow.map((data) => {
                            const step = getStepStatus(data.status)
                            const jamAcuan = data.jam_mulai || data.jam
                            const jamKelar = hitungJamSelesai(jamAcuan, data.estimasi)

                            return (
                                <div key={data.id} className="bg-surface/40 backdrop-blur-md border border-border rounded-xl p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-border/50">
                                        <div>
                                            <h3 className="font-bold text-xl text-text">{data.namamobil}</h3>
                                            <p className="text-primary font-mono text-lg">{data.platno}</p>
                                            <p className="text-muted text-xs mt-1">{data.nama} • {data.notelepon}</p>
                                        </div>
                                        <div className="mt-4 md:mt-0">
                                            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border ${getStatusStyle(data.status)}`}>
                                                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                                                {data.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-xs">
                                        <div>
                                            <span className="text-muted uppercase">Jam Booking</span>
                                            <p className="text-text font-mono text-sm mt-1">{data.jam}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted uppercase">Mobil Masuk</span>
                                            {data.jam_mulai ? (
                                                <p className="text-green-400 font-mono text-sm mt-1 font-bold">{data.jam_mulai}</p>
                                            ) : (
                                                <p className="text-yellow-400 text-sm mt-1">Belum datang</p>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-muted uppercase">Estimasi Kelar</span>
                                            <p className="text-primary font-mono text-sm mt-1 font-bold">{jamKelar}</p>
                                            {!data.jam_mulai && (
                                                <p className="text-yellow-400 text-[10px]">*Bisa berubah</p>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-muted uppercase">Durasi Servis</span>
                                            <p className="text-text font-mono text-sm mt-1">{data.estimasi} menit</p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <span className="text-muted uppercase text-xs">Keluhan / Servis</span>
                                        <p className="text-gray-300 text-sm mt-1">{data.kategoriservis}</p>
                                    </div>

                                    {data.status !== 'Batal' ? (
                                        <div className="flex items-center justify-between relative">
                                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-border">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${(step - 1) * 33.33}%` }}
                                                ></div>
                                            </div>

                                            <div className="flex flex-col items-center z-10">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= 1 ? 'bg-primary border-primary text-white' : 'bg-surface border-border text-muted'
                                                    }`}>
                                                    1
                                                </div>
                                                <span className="text-xs mt-2 text-muted">Booking</span>
                                            </div>

                                            <div className="flex flex-col items-center z-10">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= 2 ? 'bg-primary border-primary text-white' : 'bg-surface border-border text-muted'
                                                    }`}>
                                                    2
                                                </div>
                                                <span className="text-xs mt-2 text-muted">Proses</span>
                                                {data.jam_mulai && step >= 2 && (
                                                    <span className="text-[10px] text-green-400 mt-1">{data.jam_mulai}</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-center z-10">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= 3 ? 'bg-primary border-primary text-white' : 'bg-surface border-border text-muted'
                                                    }`}>
                                                    3
                                                </div>
                                                <span className="text-xs mt-2 text-muted">Quality Check</span>
                                                {step >= 3 && (
                                                    <span className="text-[10px] text-primary mt-1">Sedang dicek</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-center z-10">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= 4 ? 'bg-green-500 border-green-500 text-white' : 'bg-surface border-border text-muted'
                                                    }`}>
                                                    ✓
                                                </div>
                                                <span className="text-xs mt-2 text-muted">Selesai</span>
                                                {step >= 4 && (
                                                    <span className="text-[10px] text-green-400 mt-1">{jamKelar}</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <p className="text-red-400 font-semibold">❌ Booking Dibatalkan</p>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

export default Track

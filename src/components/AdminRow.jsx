import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { hitungJamSelesai } from '../utils/hitungJamSelesai'

function AdminRow({ data, index, isOverdue, onUpdateStatus, onDelete, onUpdateData }) {
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState({
        jam_mulai: data.jam_mulai || '',
        estimasi: data.estimasi || 60,
        kategoriservis: data.kategoriservis || ''
    })
    const [saving, setSaving] = useState(false)

    const handleSaveEdit = async () => {
        setSaving(true)

        const { error } = await supabase
            .from('booking-table')
            .update({
                jam_mulai: editData.jam_mulai,
                estimasi: parseInt(editData.estimasi),
                kategoriservis: editData.kategoriservis
            })
            .eq('id', data.id)

        if (error) {
            alert('Gagal update: ' + error.message)
        } else {
            const updatedData = {
                ...data,
                jam_mulai: editData.jam_mulai,
                estimasi: parseInt(editData.estimasi),
                kategoriservis: editData.kategoriservis
            }
            onUpdateData(updatedData)
            setIsEditing(false)
            alert('Data berhasil diupdate!')
        }
        setSaving(false)
    }

    const handleCancelEdit = () => {
        setEditData({
            jam_mulai: data.jam_mulai || '',
            estimasi: data.estimasi || 60,
            kategoriservis: data.kategoriservis || ''
        })
        setIsEditing(false)
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Selesai':
                return 'bg-green-500/10 text-green-400 border-green-500/20'
            case 'Proses':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            case 'Menunggu Part':
                return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
            case 'Quality Check':
                return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            case 'Booking':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'Batal':
                return 'bg-red-500/10 text-red-400 border-red-500/20'
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Selesai': return '✅'
            case 'Proses': return '🔧'
            case 'Menunggu Part': return '📦'
            case 'Quality Check': return '🔍'
            case 'Booking': return '🕒'
            case 'Batal': return '❌'
            default: return '📋'
        }
    }

    const jamAcuan = data.jam_mulai || data.jam
    const jamKelar = hitungJamSelesai(jamAcuan, data.estimasi)

    return (
        <tr className="hover:bg-surface/50 transition-colors border-b border-border/30">
            {/* No */}
            <td className="py-4 px-6 text-center text-muted font-mono text-xs">
                {index + 1}
            </td>

            {/* Pelanggan */}
            <td className="py-4 px-6">
                <div>
                    <p className="font-semibold text-text">{data.nama}</p>
                    <p className="text-xs text-muted">{data.notelepon}</p>
                </div>
            </td>

            {/* Plat No */}
            <td className="py-4 px-6">
                <span className="font-mono text-primary font-bold">{data.platno}</span>
            </td>

            {/* Kendaraan */}
            <td className="py-4 px-6">
                <p className="text-text text-sm">{data.namamobil}</p>
                <p className="text-xs text-muted">{data.tahun}</p>
            </td>

            {/* Keluhan */}
            <td className="py-4 px-6 max-w-xs">
                {isEditing ? (
                    <input
                        type="text"
                        value={editData.kategoriservis}
                        onChange={(e) => setEditData({ ...editData, kategoriservis: e.target.value })}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-xs"
                        placeholder="Servis apa..."
                    />
                ) : (
                    <p className="text-gray-300 text-xs line-clamp-2">{data.kategoriservis}</p>
                )}
            </td>

            {/* Jam Masuk */}
            <td className="py-4 px-6 text-center">
                {isEditing ? (
                    <input
                        type="time"
                        value={editData.jam_mulai}
                        onChange={(e) => setEditData({ ...editData, jam_mulai: e.target.value })}
                        className="bg-background border border-border rounded px-2 py-1 text-xs font-mono"
                    />
                ) : (
                    <div>
                        <p className="text-xs text-muted">Booking: {data.jam}</p>
                        {data.jam_mulai ? (
                            <p className="text-xs text-green-400 font-mono font-bold">Masuk: {data.jam_mulai}</p>
                        ) : (
                            <p className="text-xs text-yellow-400">Belum datang</p>
                        )}
                    </div>
                )}
            </td>

            {/* Estimasi Kelar */}
            <td className="py-4 px-6 text-center">
                {isEditing ? (
                    <div className="flex flex-col items-center gap-1">
                        <input
                            type="number"
                            value={editData.estimasi}
                            onChange={(e) => setEditData({ ...editData, estimasi: e.target.value })}
                            className="w-16 bg-background border border-border rounded px-2 py-1 text-xs text-center"
                            min="1"
                        />
                        <span className="text- text-muted">menit</span>
                    </div>
                ) : (
                    <div>
                        <p className="text-primary font-mono text-sm font-bold">{jamKelar}</p>
                        <p className="text-xs text-muted">{data.estimasi} menit</p>
                        {!data.jam_mulai && (
                            <p className="text- text-yellow-400">*estimasi</p>
                        )}
                    </div>
                )}
            </td>

            {/* Status */}
            <td className="py-4 px-6 text-center">
                <div className="flex flex-col items-center gap-2">
                    {isOverdue && (
                        <span className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                            OVERDUE
                        </span>
                    )}
                    <select
                        value={data.status}
                        onChange={(e) => onUpdateStatus(data.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer focus:outline-none ${getStatusStyle(data.status)}`}
                    >
                        <option value="Booking">🕒 Booking</option>
                        <option value="Proses">🔧 Proses</option>
                        <option value="Menunggu Part">📦 Menunggu Part</option>
                        <option value="Quality Check">🔍 Quality Check</option>
                        <option value="Selesai">✅ Selesai</option>
                        <option value="Batal">❌ Batal</option>
                    </select>
                </div>
            </td>

            {/* Aksi */}
            <td className="py-4 px-6 text-center">
                <div className="flex items-center justify-center gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSaveEdit}
                                disabled={saving}
                                className="text-green-400 hover:text-green-300 text-xs font-bold px-2 py-1 rounded border border-green-500/20 hover:bg-green-500/10 disabled:opacity-50"
                            >
                                {saving ? '...' : 'SAVE'}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="text-gray-400 hover:text-gray-300 text-xs font-bold px-2 py-1 rounded border border-gray-500/20 hover:bg-gray-500/10"
                            >
                                BATAL
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-primary hover:text-primary-hover text-xs font-bold px-2 py-1 rounded border border-primary/20 hover:bg-primary/10"
                            >
                                EDIT
                            </button>
                            <button
                                onClick={() => onDelete(data.id)}
                                className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/10"
                            >
                                HAPUS
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    )
}

export default AdminRow
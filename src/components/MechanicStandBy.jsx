import React from 'react'
import useMekanik from '../useMekanik'

function MechanicStandBy() {
    const { mekanik, isLoading } = useMekanik()

    if (isLoading || !mekanik) {
        return (
            <div className="bg-surface border border-border rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-background rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-background rounded w-1/3"></div>
            </div>
        )
    }

    const isBuka = mekanik.status_bengkel === 'Buka'

    return (
        <div className="bg-surface/40 backdrop-blur-md border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text">Status Bengkel</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isBuka
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                    {mekanik.status_bengkel.toUpperCase()}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-muted text-xs uppercase mb-1">Mekanik Standby</p>
                    <p className="text-3xl font-bold text-primary">
                        {mekanik.mekanik_standby}
                        <span className="text-lg text-muted">/{mekanik.total_mekanik}</span>
                    </p>
                </div>
                <div>
                    <p className="text-muted text-xs uppercase mb-1">Antrian Aktif</p>
                    <p className="text-3xl font-bold text-text">
                        {mekanik.total_mekanik - mekanik.mekanik_standby}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default MechanicStandBy

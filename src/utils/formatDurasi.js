export function formatDurasi(menit) {
    if (!menit) return '-'
    const jam = Math.floor(menit / 60)
    const sisaMenit = menit % 60
    if (jam === 0) return `${sisaMenit} menit`
    if (sisaMenit === 0) return `${jam} jam`
    return `${jam} jam ${sisaMenit} menit`
}

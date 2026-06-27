export function hitungJamSelesai(jamMulai, estimasiMenit) {
    if (!jamMulai || !estimasiMenit) return '-'

    const [jam, menit] = jamMulai.split(':').map(Number)
    const totalMenit = jam * 60 + menit + parseInt(estimasiMenit)

    const jamKelar = Math.floor(totalMenit / 60) % 24
    const menitKelar = totalMenit % 60

    return `${String(jamKelar).padStart(2, '0')}:${String(menitKelar).padStart(2, '0')}`
}

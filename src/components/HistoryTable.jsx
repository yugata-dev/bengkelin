import { hitungJamSelesai } from '../utils/hitungJamSelesai';

function HistoryTable({ render }) {
    const rows = Array.isArray(render) ? render : []
    const getStatusStyle = (status) => {
        switch (status) { // hapus .toLowerCase() biar case sensitive sesuai DB
            case 'Selesai':
                // Hijau - Aman dan Selesai
                return 'bg-green-500/10 text-green-400 border-green-500/20';

            case 'Proses':
                // Kuning - Sedang Dikerjakan
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

            case 'Menunggu Part':
                // Oranye - Nunggu sparepart dateng
                return 'bg-orange-500/10 text-orange-400 border-orange-500/20';

            case 'Booking':
                // Biru - Booking baru / Antrian
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';

            case 'Batal':
                // Merah - Dibatalin
                return 'bg-red-500/10 text-red-400 border-red-500/20';

            default:
                // Abu-abu - Status nggak dikenal
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        rows.map((data, index) => (
            <tr
                key={data.id}
                className="hover:bg-surface/50 transition-colors duration-200 border-b border-border/20 last:border-0"
            >
                {/* No Antrian */}
                <td className="py-4 px-6 text-center font-mono font-medium text-muted">
                    {index + 1}
                </td>

                {/* Nama Pemilik */}
                <td className="py-4 px-6 font-semibold text-text">
                    {data.nama}
                </td>

                {/*Plat no*/}
                <td className="py-4 px-6 font-semibold text-text">
                    {data.platno}
                </td>

                {/* Nama Mobil */}
                <td className="py-4 px-6 text-gray-300">
                    {data.namamobil}
                </td>

                {/* Keluhan Servis */}
                <td className="py-4 px-6 text-gray-400 max-w-xs truncate">
                    "{data.kategoriservis}"
                </td>

                {/* Status Badge Dinamis */}
                <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(data.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {data.status}
                    </span>
                </td>

                {/* Jam */}
                <td className="py-4 px-6 text-center text-muted font-mono text-xs">
                    {hitungJamSelesai(data.jam, data.estimasi)}
                </td>

                {/* Tanggal */}
                <td className="py-4 px-6 text-center text-muted font-mono text-xs">
                    {data.date}
                </td>
            </tr>
        ))
    )
}

export default HistoryTable
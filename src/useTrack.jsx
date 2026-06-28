import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

const TrackContext = createContext({
    track: [],
    setTrack: () => { },
    getTrack: async () => { },
    isLoading: true,
})

export function TrackProvider({ children }) {
    const [track, setTrack] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const getTrack = async () => {
        setIsLoading(true)

        const { data, error } = await supabase
            .from('booking-table')
            .select('*')
            .not('status', 'eq', 'Selesai')
            .order('date', { ascending: false })

        if (error) {
            console.error('getTrack error', error.message)
            setTrack([])
        } else {
            setTrack(data || [])
        }
        setIsLoading(false)
    }

    useEffect(() => {
        getTrack()

        const channel = supabase
            .channel('booking-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'booking-table' },
                () => getTrack()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return (
        <TrackContext.Provider value={{ track, setTrack, getTrack, isLoading }}>
            {children}
        </TrackContext.Provider>
    )
}

function useTrack() {
    const context = useContext(TrackContext)
    if (!context) {
        throw new Error('useTrack must be used inside TrackProvider')
    }
    return context
}

export default useTrack
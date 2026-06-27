import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function useMekanik() {
    const [mekanik, setMekanik] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchMekanik = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('mekanik-status')
            .select('*')
            .single()

        if (!error) setMekanik(data)
        setIsLoading(false)
    }

    const updateMekanik = async (newData) => {
        const { error } = await supabase
            .from('mekanik-status')
            .update({ ...newData, updated_at: new Date().toISOString() })
            .eq('id', mekanik.id)

        if (!error) {
            setMekanik({ ...mekanik, ...newData })
            return true
        }
        return false
    }

    useEffect(() => {
        fetchMekanik()

        // Realtime listener biar auto update kalo admin ubah
        const channel = supabase
            .channel('mekanik-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'mekanik-status' },
                () => fetchMekanik()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return { mekanik, isLoading, updateMekanik, fetchMekanik }
}

export default useMekanik

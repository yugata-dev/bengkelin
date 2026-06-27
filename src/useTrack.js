import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'


function useTrack() {
    const [track, setTrack] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const getTrack = async () => {
        const { data, error } = await supabase.from("booking-table").select("*")

        if (error) {
            console.log("getTrack error", error.message)
            setIsLoading(false)
        } else {
            setTrack(data)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getTrack()
    }, [])

    return { track, setTrack, getTrack, isLoading }
}

export default useTrack
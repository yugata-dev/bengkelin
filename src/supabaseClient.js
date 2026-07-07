import { createClient } from "@supabase/supabase-js";

const apiUrl = import.meta.env.VITE_SUPABASE_URL
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const isConfigured = Boolean(apiUrl && apiKey && apiUrl.startsWith("http"))

const createFallbackClient = () => {
    const fallbackMessage = "Supabase belum dikonfigurasi. Tambahkan variabel VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Vercel atau local .env."

    const createQueryBuilder = () => ({
        select: () => createQueryBuilder(),
        insert: () => createQueryBuilder(),
        update: () => createQueryBuilder(),
        delete: () => createQueryBuilder(),
        eq: () => createQueryBuilder(),
        order: () => createQueryBuilder(),
        limit: () => createQueryBuilder(),
        single: async () => ({ data: null, error: { message: fallbackMessage } }),
        then: (resolve) => Promise.resolve({ data: [], error: { message: fallbackMessage } }).then(resolve),
        catch: (reject) => Promise.resolve({ data: [], error: { message: fallbackMessage } }).catch(reject),
    })

    return {
        from: () => createQueryBuilder(),
        auth: {
            getUser: async () => ({ data: { user: null }, error: { message: fallbackMessage } }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe() { } } } }),
            signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: fallbackMessage } }),
            signOut: async () => ({ error: null }),
        },
        channel: () => ({
            on: () => ({ subscribe: () => ({ unsubscribe() { } }) }),
            subscribe: () => ({ unsubscribe() { } }),
        }),
        removeChannel: () => { },
    }
}

if (!isConfigured) {
    console.warn(
        "%c⚠️ Supabase belum dikonfigurasi!",
        "font-size:16px; font-weight:bold; color:#f59e0b;"
    )
    console.info(
        "%c📋 Cara setup:\n1. Salin file .env.example menjadi .env\n2. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dari project Supabase Anda\n3. Tambahkan variabel yang sama di Vercel Project Settings → Environment Variables",
        "font-size:13px;"
    )
}

export const isSupabaseConfigured = isConfigured
export const supabase = isConfigured ? createClient(apiUrl, apiKey) : createFallbackClient()

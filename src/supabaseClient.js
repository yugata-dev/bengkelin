import { createClient } from "@supabase/supabase-js";

const apiUrl = import.meta.env.VITE_SUPABASE_URL
const apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!apiUrl || !apiKey) {
    console.warn(
        "%c⚠️ Supabase belum dikonfigurasi!",
        "font-size:16px; font-weight:bold; color:#f59e0b;"
    )
    console.info(
        "%c📋 Cara setup:\n1. Salin file .env.example menjadi .env\n2. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dari project Supabase Anda\n3. Restart development server",
        "font-size:13px;"
    )
    throw new Error("Missing Supabase environment variables. Copy .env.example to .env and fill in your Supabase credentials.")
}

export const supabase = createClient(apiUrl, apiKey)

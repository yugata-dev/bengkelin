import { createClient } from "@supabase/supabase-js";

const apiUrl = "https://tyktifpgyczhtwphxehe.supabase.co"
const apiKey = "sb_publishable_0mdz-eT477-MslXDv0iKLg_txWs5M8Z"

export const supabase = createClient(apiUrl, apiKey)
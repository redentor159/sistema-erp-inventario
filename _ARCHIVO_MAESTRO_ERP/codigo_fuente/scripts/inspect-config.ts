
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf-8')
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value && !key.startsWith('#')) {
        process.env[key.trim()] = value.trim().replace(/^['"]|['"]$/g, '')
    }
})

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function inspect() {
    console.log('--- Inspecting Config ---')
    const { data, error } = await supabase.from('mst_configuracion_general').select('*').limit(1)
    if (error) {
        console.error('Error config:', error)
    } else {
        console.log('Config Example:', data[0])
    }
}

inspect()

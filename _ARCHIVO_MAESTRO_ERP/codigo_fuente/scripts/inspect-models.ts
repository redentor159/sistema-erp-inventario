
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value && !key.startsWith('#')) {
        env[key.trim()] = value.trim().replace(/^['"]|['"]$/g, '')
    }
})

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL']!, env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!)

async function inspectModels() {
    console.log('--- Inspecting mst_recetas_ingenieria ---')
    const { data, error } = await supabase
        .from('mst_recetas_ingenieria')
        .select('id_modelo')

    if (error) {
        console.error(error)
        return
    }

    const unique = Array.from(new Set(data.map(d => d.id_modelo))).sort()
    console.log(`Found ${unique.length} unique models:`)
    console.log(unique.slice(0, 20)) // Show first 20
}

inspectModels()

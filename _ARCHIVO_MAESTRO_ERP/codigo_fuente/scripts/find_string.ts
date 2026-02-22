
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

async function search() {
    console.log('--- Searching for "Accesorios M2" ---')

    // Check cat_plantillas
    const { data: p } = await supabase.from('cat_plantillas').select('nombre_generico').ilike('nombre_generico', '%Accesorios M2%')
    if (p && p.length) console.log('Found in cat_plantillas:', p)

    // Check cat_productos_variantes
    const { data: v } = await supabase.from('cat_productos_variantes').select('nombre').ilike('nombre', '%Accesorios M2%')
    if (v && v.length) console.log('Found in cat_productos_variantes:', v)

    // Check mst_recetas_ingenieria again just in case (maybe I missed it)
    const { data: r } = await supabase.from('mst_recetas_ingenieria').select('id_modelo').ilike('id_modelo', '%Accesorios M2%')
    if (r && r.length) console.log('Found in mst_recetas_ingenieria:', r)
}

search()

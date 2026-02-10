
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

async function checkCounts() {
    console.log('--- Verifying Master Data ---')

    const tables = [
        { name: 'MST_CLIENTES', table: 'mst_clientes' },
        { name: 'MST_MARCAS', table: 'mst_marcas' },
        { name: 'MST_SERIES_EQUIVALENCIAS', table: 'mst_series_equivalencias' },
        { name: 'MST_RECETAS_INGENIERIA', table: 'mst_recetas_ingenieria' },
        { name: 'CAT_PRODUCTOS_VARIANTES (Vidrios)', table: 'vw_stock_realtime', filter: { column: 'nombre_familia', value: 'Cristales / Vidrios' } },
        { name: 'MST_ACABADOS_COLORES', table: 'mst_acabados_colores' }
    ]

    for (const t of tables) {
        let query = supabase.from(t.table).select('*', { count: 'exact', head: true })
        if (t.filter) {
            query = query.eq(t.filter.column, t.filter.value)
        }
        const { count, error } = await query
        if (error) {
            console.error(`Error checking ${t.name}:`, error.message)
            fs.appendFileSync('verification_results.txt', `${t.name}: ERROR - ${error.message}\n`)
        } else {
            console.log(`${t.name}: ${count} rows`)
            fs.appendFileSync('verification_results.txt', `${t.name}: ${count} rows\n`)
        }
    }
}

checkCounts()

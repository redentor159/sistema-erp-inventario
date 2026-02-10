
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
    const log = (msg: string) => {
        console.log(msg)
        fs.appendFileSync('inspection_logs.txt', msg + '\n')
    }

    log('--- Inspecting ---')

    // 1. Check Tables
    const { data: tables, error: currentTblError } = await supabase
        .rpc('pg_catalog.pg_tables_list') // Or manually via query if RPC not exists.
    // Actually simplest is a raw query via rpc or just check specific table existence

    // Let's just try select from cat_productos_variantes
    log('Checking cat_productos_variantes...')
    const { data, error } = await supabase.from('cat_productos_variantes').select('*').limit(1)

    if (error) {
        log(`Error reading cat_productos_variantes: ${JSON.stringify(error)}`)
    } else {
        log(`Success reading cat_productos_variantes. Row count: ${data.length}`)
        if (data.length > 0) log(`Example: ${JSON.stringify(data[0])}`)
    }

    // Check View Columns
    log('Checking vw_stock_realtime columns...')
    const { data: viewData, error: viewError } = await supabase.from('vw_stock_realtime').select('*').limit(1)
    if (viewError) {
        log(`Error vw_stock_realtime: ${JSON.stringify(viewError)}`)
    } else {
        log(`View Row count: ${viewData.length}`)
        if (viewData.length > 0) log(`Keys: ${Object.keys(viewData[0]).join(', ')}`)
        if (viewData.length > 0) log(`Example: ${JSON.stringify(viewData[0])}`)
    }
}

inspect()

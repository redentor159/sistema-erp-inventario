
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

async function testApi() {
    console.log('--- Testing Non-Existent ID ---')
    const id = "00000000-0000-0000-0000-000000000000"

    const { data: cabecera, error: cabeceraError } = await supabase
        .from('vw_cotizaciones_totales')
        .select(`*, mst_clientes(*)`)
        .eq('id_cotizacion', id)
        .single()

    if (cabeceraError) {
        console.error('Cabecera Error:', cabeceraError)
        console.log('Error JSON:', JSON.stringify(cabeceraError))
    } else {
        console.log('Cabecera OK (Unexpected)')
    }
}

testApi()

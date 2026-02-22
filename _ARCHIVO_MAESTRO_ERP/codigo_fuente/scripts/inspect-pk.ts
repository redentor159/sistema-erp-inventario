
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

async function inspectTable() {
    console.log('--- Creating Draft ---')
    const { data, error } = await supabase
        .from('trx_cotizaciones_cabecera')
        .insert({
            nombre_proyecto: "Test PK Return",
            moneda: 'PEN',
            estado: 'Borrador'
        })
        .select()
        .single()

    if (error) {
        console.error(error)
        return
    }

    console.log('Data returned:', data)
    console.log('Keys:', Object.keys(data))
    if (!data.id_cotizacion) {
        console.warn('WARNING: id_cotizacion is missing!')
    } else {
        console.log('id_cotizacion found:', data.id_cotizacion)
    }
}

inspectTable()


const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envString = fs.readFileSync(envPath, 'utf8');
    envString.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !key.trim().startsWith('#')) {
            process.env[key.trim()] = value.trim().replace(/^['"]|['"]$/g, '');
        }
    });
} catch (e) {
    console.error('Error loading .env.local', e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
    console.log('--- Verifying Pagination Logic ---');

    const pageSize = 10000;
    const page = 0;

    let query = supabase
        .from('vw_stock_realtime')
        .select('*', { count: 'exact' })
        .order('orden_prioridad', { ascending: true })
        .order('id_sku', { ascending: true });

    let allData = [];
    let totalCount = 0;
    const CHUNK_SIZE = 1000;
    let currentFrom = page * pageSize;
    const endTarget = currentFrom + pageSize - 1;

    console.log(`Starting fetch loop... Target: ${pageSize} items`);

    let safety = 0;
    while (currentFrom <= endTarget && safety < 20) {
        safety++;
        const currentTo = Math.min(currentFrom + CHUNK_SIZE - 1, endTarget);
        process.stdout.write(`Fetching range ${currentFrom} - ${currentTo}... `);

        const { data, error, count } = await query.range(currentFrom, currentTo);

        if (error) {
            console.error('Error:', error);
            break;
        }

        if (data) {
            allData = [...allData, ...data];
            console.log(`Got ${data.length} items.`);
        }

        if (count !== null) totalCount = count;

        if (!data || data.length < (currentTo - currentFrom + 1)) {
            console.log('End of data reached.');
            break;
        }

        currentFrom += CHUNK_SIZE;
    }

    console.log('--- Results ---');
    console.log(`Total Items Fetched: ${allData.length}`);
    console.log(`DB Reported Total: ${totalCount}`);

    if (allData.length > 1000) {
        console.log('SUCCESS: Fetched more than 1000 items!');
    } else {
        console.error('FAILURE: Fetched 1000 or fewer items.');
    }

    const found = allData.find(p => p.nombre_completo && p.nombre_completo.toLowerCase().includes('felpa') && p.nombre_completo.toLowerCase().includes('systral'));

    if (found) {
        console.log(`SUCCESS: Found "${found.nombre_completo}" (SKU: ${found.id_sku}, Stock: ${found.stock_actual}, Priority: ${found.orden_prioridad})`);
    } else {
        console.error('FAILURE: "Felpa Systral" NOT found in the fetched list.');
    }
}

verify();

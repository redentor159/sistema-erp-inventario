
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
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- Checking API Limit ---');

    // Simulate what `catApi.getProductos` does
    const pageSize = 10000;
    const page = 0;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    console.log(`Requesting range: ${from} to ${to}`);

    const { data, error, count } = await supabase
        .from('vw_stock_realtime')
        .select('*', { count: 'exact' })
        .order('orden_prioridad', { ascending: true })
        .order('id_sku', { ascending: true })
        .range(from, to);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Returned Rows: ${data.length}`);
        console.log(`Total Count on DB: ${count}`);

        if (data.length < count && data.length < pageSize) {
            console.log('WARNING: Returned fewer rows than requested and fewer than total. API LIMIT DETECTED.');
        } else if (data.length === 1000) {
            console.log('WARNING: Exactly 1000 rows returned. Likely default Max Rows setting.');
        } else {
            console.log('It seems to have fetched everything?');
        }

        // Check last item
        const last = data[data.length - 1];
        console.log(`Last Item Priority: ${last.orden_prioridad}`);
    }
}

check();


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
    console.log('--- Product Check ---');

    // 1. Total Count
    const { count } = await supabase.from('cat_productos_variantes').select('*', { count: 'exact', head: true });
    console.log(`TOTAL PRODUCTS: ${count}`);

    // 2. Search Felpa Systral
    const { data: products } = await supabase
        .from('vw_stock_realtime')
        .select('*')
        .ilike('nombre_completo', '%Felpa%Systral%');

    if (products && products.length > 0) {
        const p = products[0];
        console.log(`PRODUCT FOUND: [${p.id_sku}] ${p.nombre_completo}`);
        console.log(`STOCK: ${p.stock_actual}`);
        console.log(`PRIORITY: ${p.orden_prioridad}`);

        // 3. Calculate Rank
        const { count: better } = await supabase.from('vw_stock_realtime').select('*', { count: 'exact', head: true }).lt('orden_prioridad', p.orden_prioridad);
        const { count: same } = await supabase.from('vw_stock_realtime').select('*', { count: 'exact', head: true }).eq('orden_prioridad', p.orden_prioridad).lt('id_sku', p.id_sku);
        const rank = (better || 0) + (same || 0) + 1;
        console.log(`RANK: ${rank}`);
    } else {
        console.log('PRODUCT NOT FOUND IN VW_STOCK_REALTIME');
    }
}

check();

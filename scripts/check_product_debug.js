
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
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
    console.log('--- Checking Product Data ---');

    // 1. Total Count
    const { count, error: countError } = await supabase
        .from('cat_productos_variantes')
        .select('*', { count: 'exact', head: true });

    if (countError) console.error('Error counting:', countError);
    else console.log(`Total Products: ${count}`);

    // 2. Find "Felpa Systral"
    console.log('Searching for "Felpa Systral"...');
    const { data: products, error: searchError } = await supabase
        .from('vw_stock_realtime')
        .select('*')
        .ilike('nombre_completo', '%Felpa%Systral%');

    if (searchError) console.error('Error searching:', searchError);
    else {
        console.log(`Found ${products.length} products matching "Felpa Systral" in vw_stock_realtime`);
        products.forEach(p => {
            console.log(`- [${p.id_sku}] ${p.nombre_completo} (Stock: ${p.stock_actual}, Priority: ${p.orden_prioridad})`);
        });
    }

    // 3. Find if it's visible in the top 10000 sorted by priority, sku
    // Only if we found matches
    if (products && products.length > 0) {
        const skuToCheck = products[0].id_sku;
        // We want to know the rank of this product
        // Rank logic: ORDER BY orden_prioridad ASC, id_sku ASC

        // We can approximately guess by counting how many are "better" or checking directly
        const { count: rank, error: rankError } = await supabase
            .from('vw_stock_realtime')
            .select('*', { count: 'exact', head: true })
            .or(`orden_prioridad.lt.${products[0].orden_prioridad},and(orden_prioridad.eq.${products[0].orden_prioridad},id_sku.lt.${skuToCheck})`);

        if (rankError) console.error('Error calculating rank:', rankError);
        else console.log(`The product would be at position approx: ${rank + 1} in the sorted list.`);
    }
}

check();

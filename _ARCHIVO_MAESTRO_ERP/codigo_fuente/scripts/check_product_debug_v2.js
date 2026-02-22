
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
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
    console.log("Error: Credentials missing.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('--- Checking Product Data ---');

    // 1. Total Count
    const { count, error: countError } = await supabase
        .from('cat_productos_variantes')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting:', countError);
    } else {
        console.log(`Total Products: ${count}`);
    }

    // 2. Find "Felpa Systral"
    console.log('Searching for "Felpa"...');
    const { data: products, error: searchError } = await supabase
        .from('vw_stock_realtime')
        .select('*')
        .ilike('nombre_completo', '%Felpa%Systral%');

    if (searchError) {
        console.error('Error searching:', searchError);
    } else {
        console.log(`Found ${products?.length || 0} products matching "Felpa Systral"`);
        if (products && products.length > 0) {
            products.forEach(p => {
                console.log(`SKU: ${p.id_sku}, Name: ${p.nombre_completo}, Stock: ${p.stock_actual}, Priority: ${p.orden_prioridad}`);
            });

            // 3. Find rank
            const targetSku = products[0].id_sku;
            const targetPriority = products[0].orden_prioridad;

            // Count rows strictly before this one
            // Condition: (priority < targetPriority) OR (priority = targetPriority AND id_sku < targetSku)
            // Supabase filter limitations mean we might need to do two counts or fetch more logic
            // But let's simplify:

            // Count with priority < targetPriority
            const { count: countBetterPriority } = await supabase
                .from('vw_stock_realtime')
                .select('*', { count: 'exact', head: true })
                .lt('orden_prioridad', targetPriority);

            // Count with priority == targetPriority AND sku < targetSku
            const { count: countSamePriority } = await supabase
                .from('vw_stock_realtime')
                .select('*', { count: 'exact', head: true })
                .eq('orden_prioridad', targetPriority)
                .lt('id_sku', targetSku);

            const rank = (countBetterPriority || 0) + (countSamePriority || 0) + 1;
            console.log(`Estimated Rank in Sorted List: ${rank}`);
        }
    }
}

check();

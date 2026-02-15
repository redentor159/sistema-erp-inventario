
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("🟠 [DEBUG API] Connecting to Supabase...");

        // 1. Fetch Models
        const { data: models, error: modelsError } = await supabase
            .from('mst_recetas_modelos')
            .select('*');

        if (modelsError) {
            console.error("🔴 [DEBUG API] Models Error:", modelsError);
            return NextResponse.json({ error: "Models Error", details: modelsError }, { status: 500 });
        }

        // 2. Fetch Systems
        const { data: systems, error: systemsError } = await supabase
            .from('mst_series_equivalencias')
            .select('*');

        if (systemsError) {
            console.error("🔴 [DEBUG API] Systems Error:", systemsError);
            return NextResponse.json({ error: "Systems Error", details: systemsError }, { status: 500 });
        }

        console.log(`🟢 [DEBUG API] Models: ${models?.length}, Systems: ${systems?.length}`);

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            counts: {
                models: models?.length,
                systems: systems?.length
            },
            data: {
                models_sample: models, // send all models (small table)
                systems_sample: systems
            }
        });

    } catch (e: any) {
        console.error("🔴 [DEBUG API] Catch Error:", e);
        return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
    }
}

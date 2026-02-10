
import { createClient } from '@supabase/supabase-js'

// Validar que las variables de entorno existan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '❌ Missing Supabase environment variables.\n\n' +
        'Required variables:\n' +
        '  - NEXT_PUBLIC_SUPABASE_URL\n' +
        '  - NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n' +
        'Please check:\n' +
        '  1. Your .env.local file exists in the project root\n' +
        '  2. The variables are properly defined\n' +
        '  3. You have restarted the dev server after adding them\n\n' +
        'If deploying to Vercel/production, ensure environment variables are configured in your hosting platform settings.'
    )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

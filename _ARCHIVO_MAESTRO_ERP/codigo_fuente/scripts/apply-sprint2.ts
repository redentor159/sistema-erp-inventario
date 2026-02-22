import fs from 'fs'
import pg from 'pg'

// 1. Load Env (Hack to avoid dotenv dependency install if possible, or just parse)
const envFile = fs.readFileSync('.env.local', 'utf-8')
const env: Record<string, string> = {}
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value && !key.startsWith('#')) {
        env[key.trim()] = value.trim().replace(/^['"]|['"]$/g, '')
    }
})

const DATABASE_URL = env['DATABASE_URL'] || env['POSTGRES_URL']
if (!DATABASE_URL) {
    console.error('DATABASE_URL not found in .env.local')
    process.exit(1)
}

const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase usually
})

async function applyScript() {
    console.log('--- Applying Sprint 2 Features Schema ---')
    try {
        const sql = fs.readFileSync('database/sprint2_features.sql', 'utf-8')
        console.log(`Executing SQL (${sql.length} chars)...`)

        await pool.query(sql)

        console.log('✅ Sprint 2 Database schema applied successfully.')
    } catch (err: any) {
        console.error('❌ Error executing SQL:', err.message)
        // If error is duplicate column, ignore? "42701" is duplicate_column 
        if (err.code === '42701') console.log('⚠️ Columns likely already exist, ignoring.')
    } finally {
        await pool.end()
    }
}

applyScript()

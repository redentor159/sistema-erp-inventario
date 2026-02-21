import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function run() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/inventario_ia';
    console.log('Connecting to', connectionString);
    const client = new Client({ connectionString });

    try {
        await client.connect();
        const sqlPath = path.join(__dirname, '../database/sprint3_flete_templado.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log('Migration applied successfully.');
    } catch (e) {
        console.error('Error applying migration:', e);
    } finally {
        await client.end();
    }
}

run();

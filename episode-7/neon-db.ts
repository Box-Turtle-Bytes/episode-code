import { neon, Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

export async function main() {
    const id = 1;
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.on('error', (err) => console.log(err));
    const client = await pool.connect();
    try {
        client.query('BEGIN');

        const {
            rows: [{ id: postId }],
        } = await client.query('INSERT INTO box.posts (description) VALUES ($1) RETURNING id', ['Hello, World2!']);

        client.query('COMMIT');
        console.log(`Inserted post with id: ${postId}`);
    } catch (e) {
        await client.query('ROLLBACK');
        console.log('rolled back');
    }
}

main().catch(console.error);

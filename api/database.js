const { Client, Pool } = require('pg');

const databaseName = process.env.PGDATABASE || 'blocodenotas';
const maintenanceDatabase = process.env.PGMAINTENANCE_DATABASE || 'postgres';

function connectionOptions(database) {
    return {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD,
        database,
    };
}

function quoteIdentifier(identifier) {
    return `"${identifier.replace(/"/g, '""')}"`;
}

const pool = new Pool(connectionOptions(databaseName));

pool.on('error', error => {
    console.error('Erro inesperado na conexão com PostgreSQL:', error);
});

async function initializeDatabase() {
    if (databaseName === maintenanceDatabase) {
        throw new Error('PGDATABASE não pode ser igual a PGMAINTENANCE_DATABASE.');
    }

    const adminClient = new Client(connectionOptions(maintenanceDatabase));
    await adminClient.connect();
    try {
        await adminClient.query(
            'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
            [databaseName]
        );
        await adminClient.query(`DROP DATABASE IF EXISTS ${quoteIdentifier(databaseName)}`);
        await adminClient.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
    } finally {
        await adminClient.end();
    }

    await pool.query(`
        CREATE TABLE users (
            id UUID PRIMARY KEY,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            address TEXT NOT NULL DEFAULT '',
            password_hash TEXT NOT NULL
        );

        CREATE UNIQUE INDEX users_username_lower_unique ON users (LOWER(username));
        CREATE UNIQUE INDEX users_email_lower_unique ON users (LOWER(email));

        CREATE TABLE contacts (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL DEFAULT '',
            phone TEXT NOT NULL DEFAULT '',
            relationship TEXT NOT NULL DEFAULT '',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX contacts_user_id_created_at_idx ON contacts (user_id, created_at, id);

        CREATE TABLE sos_requests (
            id UUID PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            caller JSONB NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            status TEXT NOT NULL DEFAULT 'Novo',
            notes TEXT NOT NULL DEFAULT '',
            updated_at TIMESTAMPTZ
        );

        CREATE INDEX sos_requests_created_at_idx ON sos_requests (created_at DESC);
    `);
}

module.exports = { initializeDatabase, pool };

const { Pool } = require('pg');

const postgresPool = new Pool({
    connectionString: process.env.POSTGRES_URL
});

module.exports = postgresPool;
const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',        // default WAMP MySQL user
  password: '',        // default is blank unless you set one
  database: 'web3id'
});

module.exports = pool.promise(); // export for async/await use

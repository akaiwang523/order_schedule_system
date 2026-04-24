import mysql from 'mysql2/promise';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

async function createOrderItemsTable() {
  let connection;
  try {
    // Parse DATABASE_URL
    const url = new URL(connectionString);
    const config = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false }  // Enable SSL for TiDB Cloud
    };

    connection = await mysql.createConnection(config);
    console.log('✓ Connected to database');

    // Check if orderItems table exists
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orderItems'",
      [config.database]
    );

    if (tables.length > 0) {
      console.log('✓ orderItems table already exists');
      await connection.end();
      return;
    }

    // Create orderItems table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`orderItems\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`orderId\` int NOT NULL,
        \`itemNumber\` varchar(50) NOT NULL,
        \`notes\` text,
        \`photoUrl\` text,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        FOREIGN KEY (\`orderId\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE
      )
    `;

    await connection.query(createTableSQL);
    console.log('✓ Created orderItems table');

    // Create index
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS \`orderItems_orderId_idx\` ON \`orderItems\` (\`orderId\`)
    `;

    await connection.query(createIndexSQL);
    console.log('✓ Created index on orderId');

    console.log('✓ orderItems table setup completed successfully');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createOrderItemsTable();

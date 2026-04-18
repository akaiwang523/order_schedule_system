import mysql from 'mysql2/promise';

const connectionUrl = process.env.DATABASE_URL;
const url = new URL(connectionUrl);

const connection = await mysql.createConnection({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: 'Amazon RDS',
});

const sql = `
ALTER TABLE \`orders\` ADD \`status\` enum('pending','completed') DEFAULT 'pending' NOT NULL;
ALTER TABLE \`orders\` ADD \`completedAt\` timestamp;
ALTER TABLE \`schedules\` ADD \`deliveryCategory\` enum('door_to_door_pickup','door_to_door_return','self_delivery') NOT NULL;
ALTER TABLE \`schedules\` ADD \`completedAt\` timestamp;
`;

try {
  const statements = sql.split(';').filter(s => s.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      console.log('Executing:', statement.trim());
      await connection.execute(statement);
      console.log('✓ Success');
    }
  }
  console.log('All migrations applied successfully');
} catch (error) {
  if (error.code === 'ER_DUP_FIELDNAME') {
    console.log('Column already exists, skipping...');
  } else {
    console.error('Error:', error.message);
  }
}

await connection.end();

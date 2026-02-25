const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  
  try {
    const notifications = await prisma.notification.findMany();
    console.log("Notifications:", notifications);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}
main();

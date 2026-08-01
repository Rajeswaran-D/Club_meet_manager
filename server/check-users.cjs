require('dotenv').config();
const prisma = require('./src/prisma.js');

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:");
  users.forEach(u => {
    console.log(`- ID: ${u.id}`);
    console.log(`  Email: ${u.email}`);
    console.log(`  Name: ${u.name}`);
    console.log(`  Role: ${u.role}`);
    console.log(`  PasswordHash (first 15 chars): ${u.passwordHash.substring(0, 15)}...`);
    console.log(`  Hash length: ${u.passwordHash.length}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

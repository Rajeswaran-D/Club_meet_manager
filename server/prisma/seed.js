require('dotenv').config();
const prisma = require('../src/prisma.js');
const bcrypt = require('bcryptjs');

async function main() {
  const email = 'admin@clubmeet.com';
  const password = 'password123';
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Default Admin',
        role: 'PRESIDENT',
      },
    });
    console.log(`Created default user: ${user.email}`);
  } else {
    console.log(`User ${email} already exists.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

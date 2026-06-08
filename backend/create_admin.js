const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('future 123', 12);
  
  // 1. Create/Upsert admin with username "future"
  const admin1 = await prisma.user.upsert({
    where: { email: 'future' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
    },
    create: {
      name: 'LifeLine SuperAdmin',
      email: 'future',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // 2. Create/Upsert admin with username "future@lifeline.ai"
  const admin2 = await prisma.user.upsert({
    where: { email: 'future@lifeline.ai' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
    },
    create: {
      name: 'LifeLine SuperAdmin',
      email: 'future@lifeline.ai',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin "future" and "future@lifeline.ai" created successfully with password "future 123"!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

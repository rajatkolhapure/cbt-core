import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updatedAdmin = await prisma.user.updateMany({
    where: {
      OR: [
        { email: 'admin@cbt.com' },
        { role: 'ADMIN' }
      ]
    },
    data: {
      name: 'Rajat Kolhapure',
    }
  });

  console.log(`✓ Updated ${updatedAdmin.count} admin user(s) to name "Rajat Kolhapure"`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });

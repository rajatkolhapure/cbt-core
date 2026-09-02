/**
 * Assign all active tests to Priya Sharma
 * 
 * Run: npx tsx prisma/assign-priya.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const priya = await prisma.user.findFirst({
    where: { email: 'student@cbt.com' },
  });

  if (!priya) {
    console.error('❌ Priya Sharma user not found');
    return;
  }

  const allExams = await prisma.exam.findMany({
    where: { isPublished: true },
    include: {
      sections: true,
    },
  });

  console.log(`👤 Candidate: ${priya.name} (${priya.email}) • Roll: ${priya.candidateId}`);
  console.log(`📋 Found ${allExams.length} published examinations:\n`);

  for (const exam of allExams) {
    await prisma.examAssignment.upsert({
      where: {
        examId_userId: {
          examId: exam.id,
          userId: priya.id,
        },
      },
      update: {},
      create: {
        examId: exam.id,
        userId: priya.id,
      },
    });

    console.log(`  ✓ Assigned: "${exam.title}" (${exam.duration} mins, ${exam.totalMarks} marks)`);
  }

  console.log(`\n🎉 Successfully assigned all ${allExams.length} tests to Priya Sharma!`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });

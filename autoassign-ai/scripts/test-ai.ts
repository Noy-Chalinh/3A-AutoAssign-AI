import { prisma } from '../lib/prisma';
import { processAssignment } from '../lib/ai-processor';

async function main() {
  // 1. Create a fake assignment directly in DB
  const assignment = await prisma.assignment.create({
    data: {
      userId: 'test-user-id',          // replace with a real user ID later
      title: 'Research Paper on Climate Change',
      description:
        'Write a 2000-word research paper covering causes, effects, and solutions to climate change. Must include at least 5 references.',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      course: 'Environmental Science',
      status: 'PENDING',
    },
  });

  console.log('📝 Created test assignment:', assignment.id);

  // 2. Run AI processor
  const tasks = await processAssignment(assignment);

  // 3. Print results
  console.log('\n📋 Generated Tasks:');
  tasks.forEach((task, i) => {
    console.log(`\n${i + 1}. ${task.title}`);
    console.log(`   Priority: ${task.priority}`);
    console.log(`   Hours: ${task.estimatedHours}`);
    console.log(`   Date: ${task.scheduledDate}`);
    console.log(`   Description: ${task.description}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processAssignment } from '@/lib/ai-processor';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId } = await req.json();

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'assignmentId is required' },
        { status: 400 }
      );
    }

    // 1. Find the assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // 2. Delete old tasks to avoid duplicates
    await prisma.task.deleteMany({
      where: { assignmentId },
    });

    // 3. Re-run AI and save new tasks
    const tasks = await processAssignment(assignment);

    return NextResponse.json({
      success: true,
      message: 'Tasks regenerated successfully',
      tasks,
    });

  } catch (error) {
    console.error('POST /api/ai/process error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/assignments — fetch all assignments for logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const assignments = await prisma.assignment.findMany({
      where: { userId: user.id },
      include: {
        tasks: {
          orderBy: { scheduledDate: 'asc' },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    return NextResponse.json({ assignments });

  } catch (error) {
    console.error('GET /api/assignments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
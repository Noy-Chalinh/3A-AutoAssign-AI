// app/api/webhook/classroom/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processAssignment } from '@/lib/ai-processor';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify webhook secret so only Make.com can call this
    const secret = req.headers.get('x-webhook-secret');
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, title, description, deadline, course } = body;

    // 2. Validate required fields
    if (!userId || !title || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, deadline' },
        { status: 400 }
      );
    }

    // 3. Save assignment to database
    const assignment = await prisma.assignment.create({
      data: {
        userId,
        title,
        description: description || '',
        deadline: new Date(deadline),
        course: course || '',
        status: 'PENDING',
      },
    });

    // 4. Trigger AI processing in background (non-blocking)
    processAssignment(assignment).catch((err) =>
      console.error('AI processing failed:', err)
    );

    return NextResponse.json({
      success: true,
      assignmentId: assignment.id,
      message: 'Assignment received and AI processing started',
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
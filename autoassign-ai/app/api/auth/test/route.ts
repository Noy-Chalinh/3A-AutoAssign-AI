import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('[Test API] Session:', session);
    
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: {
          email: session.user?.email,
          name: session.user?.name,
        },
        expires: session.expires,
      } : null,
    });
  } catch (error) {
    console.error('[Test API] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function LoginContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    console.log('[LoginPage] Session status:', status, 'Session exists:', !!session);

    if (status === 'authenticated' && session?.user) {
      console.log('[LoginPage] Redirecting to:', callbackUrl);
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F1FF' }}>
        <p style={{ color: '#9B8EC4' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4F1FF' }}>
      <div
        className="p-10 w-full max-w-md text-center"
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4DCF7',
          borderRadius: '12px',
          boxShadow: '0 1px 4px rgba(45,27,105,0.06)',
        }}
      >
        {/* Logo / Title */}
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-heading)', color: '#2D1B69' }}
        >
          3A – AutoAssign AI
        </h1>
        <p className="mb-8" style={{ color: '#9B8EC4' }}>
          Sign in to automatically plan your assignments
        </p>

        {/* Features list */}
        <ul className="text-left text-sm mb-8 space-y-2" style={{ color: '#2D1B69' }}>
          <li>✅ Auto-detects assignments from Google Classroom</li>
          <li>✅ AI breaks them into prioritized tasks</li>
          <li>✅ Syncs your study plan to Google Calendar</li>
        </ul>

        {/* Sign in button */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-3 font-medium py-3 px-4 transition-colors"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4DCF7',
            borderRadius: '8px',
            color: '#2D1B69',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F4F1FF')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="text-xs mt-6" style={{ color: '#C4B8E8' }}>
          We only access your Classroom assignments and Calendar to build your study plan.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

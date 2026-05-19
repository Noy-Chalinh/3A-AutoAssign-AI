'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
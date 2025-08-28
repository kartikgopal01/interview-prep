import {ReactNode} from 'react'
import { redirect } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/actions/auth.action';
import AppShell from '@/components/layout/AppShell';

const Rootlayout = async ({children}:{children: React.ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  console.log("Root layout - user authenticated:", isUserAuthenticated);
  
  if(!isUserAuthenticated) redirect('/sign-in');
  
  const user = await getCurrentUser();
  
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}

export default Rootlayout

import {ReactNode} from 'react'
import { redirect } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/actions/auth.action';
import Navigation from '@/components/Navigation';

const Rootlayout = async ({children}:{children: React.ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  console.log("Root layout - user authenticated:", isUserAuthenticated);
  
  if(!isUserAuthenticated) redirect('/sign-in');
  
  const user = await getCurrentUser();
  
  return (
    <div className='root-layout'>
      <Navigation />
      
      <main>
        {children}
      </main>
    </div>
  )
}

export default Rootlayout

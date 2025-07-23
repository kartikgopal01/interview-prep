import {ReactNode} from 'react'
import "../globals.css";
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/actions/auth.action';

const Authlayout = async ({children}: {children: ReactNode}) => {
  // Force revalidation of authentication status
  const isUserAuthenticated = await isAuthenticated();
  console.log("Auth layout - user authenticated:", isUserAuthenticated);
  
  if(isUserAuthenticated) {
    redirect('/');
  }
  
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className="w-full max-w-2xl">
        {children}
      </div>
    </div>
  )
}

export default Authlayout

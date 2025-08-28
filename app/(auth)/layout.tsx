import {ReactNode} from 'react'
import "../globals.css";
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/actions/auth.action';
import { Card, CardContent } from '@/components/ui/card';

const Authlayout = async ({children}: {children: ReactNode}) => {
  // Force revalidation of authentication status
  const isUserAuthenticated = await isAuthenticated();
  console.log("Auth layout - user authenticated:", isUserAuthenticated);
  
  if(isUserAuthenticated) {
    redirect('/');
  }
  
  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className="w-full max-w-xl">
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

export default Authlayout

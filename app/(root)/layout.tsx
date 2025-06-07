import Link from 'next/link'
import Image from 'next/image'
import {ReactNode} from 'react'
import { redirect } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/actions/auth.action';
import Navigation from '@/components/Navigation';
import UserMenu from '@/components/UserMenu';

const Rootlayout = async ({children}:{children: React.ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  console.log("Root layout - user authenticated:", isUserAuthenticated);
  
  if(!isUserAuthenticated) redirect('/sign-in');
  
  const user = await getCurrentUser();
  
  return (
    <div className='root-layout'>
      <header className="flex items-center justify-between p-4 pt-20 md:pt-24">
        <Link href='/' className='flex items-center gap-2'>
          <Image src='/logo2.svg' alt="logo" width={350} height={100} className="max-w-full" />
        </Link>
        
        
      </header>
      
      <Navigation />
      
      <main className="px-4 md:px-8">
        {children}
      </main>
    </div>
  )
}

export default Rootlayout

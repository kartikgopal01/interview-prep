import Link from 'next/link'
import Image from 'next/image'
import {ReactNode} from 'react'
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/actions/auth.action';
import Navigation from '@/components/Navigation';

const Rootlayout = async ({children}:{children: React.ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  console.log("Root layout - user authenticated:", isUserAuthenticated);
  
  if(!isUserAuthenticated) redirect('/sign-in');
  
  return (
    <div className='root-layout'>
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 mb-4">
        <Link href='/' className='flex items-center gap-2'>
          <Image src='/logo2.svg' alt="logo" width={350} height={100 } />
        </Link>
      </header>
      
      <Navigation />
      
      <main className="px-4">
        {children}
      </main>
    </div>
  )
}

export default Rootlayout

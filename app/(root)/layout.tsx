import Link from 'next/link'
import Image from 'next/image'
import {ReactNode} from 'react'
import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/actions/auth.action';

const Rootlayout = async ({children}:{children: React.ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  console.log("Root layout - user authenticated:", isUserAuthenticated);
  
  if(!isUserAuthenticated) redirect('/sign-in');
  
  return (
    <div className='root-layout'>
      <Link href='/' className='flex items-center gap-2'>
        <Image src='/logo.svg' alt="logo" width={38} height={32} />

        <h2 className='text-primary-100'>InterviewPrep</h2>
      </Link>
      {children}
    </div>
  )
}

export default Rootlayout

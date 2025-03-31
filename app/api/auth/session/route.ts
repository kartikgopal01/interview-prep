import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/actions/auth.action';

export async function GET() {
  try {
    console.log('Fetching user session from API');
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('No user found in session');
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    console.log(`User session found: ${user.id}`);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error in session API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
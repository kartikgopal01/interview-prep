import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getPeerInterviews, getUserPeerInterviews } from '@/lib/actions/peer-interview.action';
import PeerInterviewCard from '@/components/PeerInterviewCard';
import { redirect } from 'next/navigation';

const PeerInterviewDashboard = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    return redirect('/sign-in');
  }
  
  // Get both user's interviews and available interviews
  const [userPeerInterviews, availablePeerInterviews] = await Promise.all([
    getUserPeerInterviews(user.id),
    getPeerInterviews(user.id) // Pass user ID to exclude their own interviews
  ]);
  
  // Get statistics
  const pendingInterviews = userPeerInterviews?.filter(interview => interview.status === 'pending')?.length || 0;
  const activeInterviews = userPeerInterviews?.filter(interview => interview.status === 'active')?.length || 0;
  const completedInterviews = userPeerInterviews?.filter(interview => interview.status === 'completed')?.length || 0;
  const totalInterviews = userPeerInterviews?.length || 0;
  
  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 sm:p-6 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Interviews</h3>
          <p className="text-3xl font-bold">{totalInterviews}</p>
        </div>
        
        <div className="p-4 sm:p-6 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Pending</h3>
          <p className="text-3xl font-bold text-yellow-500">{pendingInterviews}</p>
        </div>
        
        <div className="p-4 sm:p-6 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Active</h3>
          <p className="text-3xl font-bold text-green-500">{activeInterviews}</p>
        </div>
        
        <div className="p-4 sm:p-6 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Completed</h3>
          <p className="text-3xl font-bold text-blue-500">{completedInterviews}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Your Interviews</h3>
        <Button asChild className="btn-primary">
          <Link href="/peer-interview/create">Create New Interview</Link>
        </Button>
      </div>
      
      <div className="interviews-section">
        {userPeerInterviews && userPeerInterviews.length > 0 ? (
          userPeerInterviews.map((interview) => (
            <PeerInterviewCard 
              key={interview.id}
              id={interview.id}
              role={interview.role}
              level={interview.level || 'junior'}
              techstack={interview.techstack}
              createdAt={interview.createdAt}
              status={interview.status || 'pending'}
              isCreator={true}
            />
          ))
        ) : (
          <div className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="mb-4">You haven't created any peer interviews yet.</p>
            <Button asChild>
              <Link href="/peer-interview/create">Create Your First Interview</Link>
            </Button>
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-6">Available to Join</h3>
      <div className="interviews-section">
        {availablePeerInterviews && availablePeerInterviews.length > 0 ? (
          availablePeerInterviews.map((interview) => (
            <PeerInterviewCard 
              key={interview.id}
              id={interview.id}
              role={interview.role}
              level={interview.level || 'junior'}
              techstack={interview.techstack}
              createdAt={interview.createdAt}
              status={interview.status || 'pending'}
              isCreator={false}
            />
          ))
        ) : (
          <p className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            There are no peer interviews available to join at the moment.
          </p>
        )}
      </div>
    </div>
  );
};

export default PeerInterviewDashboard; 
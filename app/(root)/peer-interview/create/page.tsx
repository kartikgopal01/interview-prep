import React from 'react';
import { getCurrentUser } from '@/lib/actions/auth.action';
import CreatePeerInterviewForm from '@/components/CreatePeerInterviewForm';
import { redirect } from 'next/navigation';

const CreatePeerInterviewPage = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Create a Peer Interview</h2>
      <p className="text-center mb-8">
        Set up an interview where someone can practice with you as the interviewer. 
        Specify the job role and technologies to help focus the practice session.
      </p>
      
      <CreatePeerInterviewForm userId={user.id} />
    </div>
  );
};

export default CreatePeerInterviewPage; 
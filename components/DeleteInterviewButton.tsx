'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteInterviewButtonProps {
  interviewId: string;
  className?: string;
}

const DeleteInterviewButton = ({ interviewId, className = '' }: DeleteInterviewButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch('/api/peer-interview/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interviewId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Interview deleted successfully');
        router.refresh(); // Refresh the page to update the UI
      } else {
        toast.error(data.error || 'Failed to delete interview');
      }
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast.error('An error occurred while deleting the interview');
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="icon"
        className={`rounded-full hover:bg-red-600 transition-colors ${className}`}
        onClick={() => setIsDialogOpen(true)}
        disabled={isDeleting}
        title="Delete interview"
        aria-label="Delete interview"
      >
        <Trash size={16} />
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this interview
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteInterviewButton; 
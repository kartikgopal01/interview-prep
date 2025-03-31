'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { createPeerInterview } from '@/lib/actions/peer-interview.action';
import { toast } from 'sonner';

interface CreatePeerInterviewFormProps {
  userId: string;
}

const CreatePeerInterviewForm = ({ userId }: CreatePeerInterviewFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    level: 'junior',
    techstack: [] as string[],
    techInput: '', // for handling tech input before adding to array
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTech = () => {
    if (formData.techInput.trim() !== '') {
      setFormData((prev) => ({
        ...prev,
        techstack: [...prev.techstack, prev.techInput.trim()],
        techInput: '',
      }));
    }
  };

  const handleRemoveTech = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      techstack: prev.techstack.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) {
      toast.error('Please enter a role for the interview');
      return;
    }
    if (formData.techstack.length === 0) {
      toast.error('Please add at least one technology');
      return;
    }

    setLoading(true);
    try {
      const result = await createPeerInterview({
        role: formData.role,
        level: formData.level,
        techstack: formData.techstack,
        userId,
      });

      if (result.success && result.interviewId) {
        toast.success('Peer interview created successfully!');
        router.push(`/peer-interview/${result.interviewId}`);
      } else {
        toast.error('Failed to create peer interview');
      }
    } catch (error) {
      console.error('Error creating peer interview:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="role">Job Role</Label>
        <input
          id="role"
          name="role"
          type="text"
          placeholder="e.g. Frontend Developer"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
          value={formData.role}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="level">Experience Level</Label>
        <select
          id="level"
          name="level"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
          value={formData.level}
          onChange={handleInputChange}
        >
          <option value="junior">Junior</option>
          <option value="mid">Mid-level</option>
          <option value="senior">Senior</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="techInput">Technologies</Label>
        <div className="flex items-center gap-2">
          <input
            id="techInput"
            name="techInput"
            type="text"
            placeholder="e.g. React, Node.js, TypeScript"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
            value={formData.techInput}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTech();
              }
            }}
          />
          <Button 
            type="button" 
            onClick={handleAddTech}
            variant="outline"
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.techstack.map((tech, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full"
            >
              <span>{tech}</span>
              <button
                type="button"
                onClick={() => handleRemoveTech(index)}
                className="text-red-500 text-sm font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full btn-primary" disabled={loading}>
        {loading ? 'Creating...' : 'Create Peer Interview'}
      </Button>
    </form>
  );
};

export default CreatePeerInterviewForm; 
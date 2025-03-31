import React from 'react';
import { 
  PixelDecoration, 
  PixelCard, 
  PixelButton, 
  PixelLoading,
  PixelInterviewCard
} from '@/components/animations';

export default function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center">Pixel Art UI Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Card Examples */}
        <div>
          <h2 className="mb-4">Pixel Cards</h2>
          
          <div className="space-y-6">
            <PixelCard variant="primary" className="p-6">
              <h3 className="mb-2">Primary Card</h3>
              <p>This is a primary card with pixel art styling.</p>
            </PixelCard>
            
            <PixelCard variant="secondary" className="p-6">
              <h3 className="mb-2">Secondary Card</h3>
              <p>This is a secondary card with pixel art styling.</p>
            </PixelCard>
            
            <PixelCard variant="accent" className="p-6">
              <h3 className="mb-2">Accent Card</h3>
              <p>This is an accent card with pixel art styling.</p>
            </PixelCard>
          </div>
        </div>
        
        {/* Button Examples */}
        <div>
          <h2 className="mb-4">Pixel Buttons</h2>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <PixelButton variant="primary">Primary</PixelButton>
                <PixelButton variant="secondary">Secondary</PixelButton>
                <PixelButton variant="success">Success</PixelButton>
                <PixelButton variant="danger">Danger</PixelButton>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg">Button Sizes</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <PixelButton variant="primary" size="sm">Small</PixelButton>
                <PixelButton variant="primary" size="md">Medium</PixelButton>
                <PixelButton variant="primary" size="lg">Large</PixelButton>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg mb-4">Button State</h3>
              <PixelButton variant="primary" disabled className="mr-4">Disabled</PixelButton>
            </div>
          </div>
        </div>
      </div>
      
      {/* Interview Card Examples */}
      <div className="mb-12">
        <h2 className="mb-4">Interview Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PixelInterviewCard companyColor="#4875e8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">F</span>
              </div>
            </div>
            <h3 className="text-center mb-4">Back End Developer Interview</h3>
            <div className="flex justify-between mb-4">
              <span>Mar 31, 2025</span>
              <span>---/100</span>
            </div>
            <p className="mb-6">You haven't taken the interview yet. Take it now to improve your skills.</p>
            <div className="flex justify-center">
              <PixelButton variant="primary">View Interview</PixelButton>
            </div>
          </PixelInterviewCard>
          
          <PixelInterviewCard companyColor="#ffc107">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-yellow-400 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">A</span>
              </div>
            </div>
            <h3 className="text-center mb-4">Java Developer Interview</h3>
            <div className="flex justify-between mb-4">
              <span>Mar 31, 2025</span>
              <span>---/100</span>
            </div>
            <p className="mb-6">You haven't taken the interview yet. Take it now to improve your skills.</p>
            <div className="flex justify-center">
              <PixelButton variant="primary">View Interview</PixelButton>
            </div>
          </PixelInterviewCard>
          
          <PixelInterviewCard companyColor="#7e57c2">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">H</span>
              </div>
            </div>
            <h3 className="text-center mb-4">Front End Developer Interview</h3>
            <div className="flex justify-between mb-4">
              <span>Mar 31, 2025</span>
              <span>10/100</span>
            </div>
            <p className="mb-6">The candidate did not demonstrate the necessary skills, knowledge, or confidence...</p>
            <div className="flex justify-center">
              <PixelButton variant="secondary">Check Feedback</PixelButton>
            </div>
          </PixelInterviewCard>
        </div>
      </div>
      
      {/* Pixel Decoration Examples */}
      <div className="mb-12">
        <h2 className="mb-4">Pixel Decorations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="relative bg-white p-8 rounded-sm border border-gray-200">
            <h3 className="text-lg mb-4">Corner Type</h3>
            <PixelDecoration type="corner" color="--pixel-accent" />
          </div>
          
          <div className="relative bg-white p-8 rounded-sm border border-gray-200">
            <h3 className="text-lg mb-4">Dot Type</h3>
            <PixelDecoration type="dot" color="--pixel-green" />
          </div>
          
          <div className="relative bg-white p-8 rounded-sm border border-gray-200">
            <h3 className="text-lg mb-4">Border Type</h3>
            <PixelDecoration type="border" color="--pixel-blue" />
          </div>
          
          <div className="relative bg-white p-8 rounded-sm border border-gray-200">
            <h3 className="text-lg mb-4">Pattern Type</h3>
            <PixelDecoration type="pattern" color="--pixel-red" />
          </div>
        </div>
      </div>
      
      {/* Loading Animation Example */}
      <div className="mb-12">
        <h2 className="mb-4">Loading Animation</h2>
        
        <div className="bg-white p-8 rounded-sm border border-gray-200">
          <PixelLoading isLoading={true} />
        </div>
      </div>
      
      {/* Combined Examples */}
      <div>
        <h2 className="mb-4">Combined Example</h2>
        
        <PixelCard className="p-8">
          <h3 className="mb-4">Game-like Interface</h3>
          <p className="mb-6">This is an example of combining multiple pixel art components to create a game-like interface.</p>
          
          <div className="flex gap-4 mb-6">
            <PixelButton variant="primary">Start Game</PixelButton>
            <PixelButton variant="secondary">Options</PixelButton>
            <PixelButton variant="danger">Quit</PixelButton>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-sm border border-gray-200 mb-6">
            <p className="font-courier">Game log: Player connected to server...</p>
            <p className="font-courier">Game log: Loading resources...</p>
            <p className="font-courier">Game log: Ready to play!</p>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="badge-text">Level 1</span>
            <span className="badge-text">Score: 0</span>
          </div>
        </PixelCard>
      </div>
    </div>
  );
} 
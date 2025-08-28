"use client";

import React from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// @ts-ignore - Tabler icons don't have official TypeScript definitions
import { IconBrandYoutubeFilled } from "@tabler/icons-react";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "AI-Powered Interview Practice",
      description:
        "Practice with our advanced AI interviewer that adapts to your skill level and provides personalized feedback on your responses.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r dark:border-neutral-800",
      icon: "🤖",
      gradient: "from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900"
    },
    {
      title: "Real-time Peer Collaboration",
      description:
        "Connect with fellow developers for live interview sessions with instant feedback and collaborative learning experiences.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 dark:border-neutral-800",
      icon: "👥",
      gradient: "from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900"
    },
    {
      title: "Track Your Progress",
      description:
        "Monitor your interview performance with detailed analytics, progress tracking, and personalized improvement recommendations.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r  dark:border-neutral-800",
      icon: "📊",
      gradient: "from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900"
    },
    {
      title: "Comprehensive Question Bank",
      description:
        "Access thousands of technical, behavioral, and system design questions covering all major programming languages and roles.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
      icon: "📚",
      gradient: "from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900"
    },
  ];
  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
          Master Your Interview Skills
        </h4>

        <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-500 text-center font-normal dark:text-neutral-300">
          From AI-powered practice sessions to peer collaboration, we provide everything you need to ace your technical interviews and land your dream job.
        </p>
      </div>

      <div className="relative ">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className=" h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className=" max-w-5xl mx-auto text-left tracking-tight text-black dark:text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base  max-w-4xl text-left mx-auto",
        "text-neutral-500 text-center font-normal dark:text-neutral-300",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex flex-col h-full">
      <div className="w-full mx-auto bg-white dark:bg-neutral-900 shadow-lg group h-full rounded-lg border border-gray-100 dark:border-neutral-800">
        <div className="flex flex-1 w-full h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <span className="text-slate-600 dark:text-slate-300 text-sm">🤖</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">AI Interviewer</div>
                <div className="text-xs text-green-600">Online</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded">
              React Interview
            </div>
          </div>

          {/* Code Example */}
          <div className="flex-1 p-4 space-y-4">
            <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-400 ml-2">two-sum.js</span>
              </div>
              <div className="space-y-1">
                <div><span className="text-blue-400">function</span> <span className="text-yellow-400">twoSum</span>(nums, target) {'{'}</div>
                <div className="ml-4 text-gray-300">// Write your solution here</div>
                <div className="ml-4 text-gray-500">// Return indices of two numbers that add up to target</div>
                <div className="ml-4"><span className="text-blue-400">return</span> [];</div>
                <div>{'}'}</div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <strong>AI:</strong> Can you solve this Two Sum problem using a hash map approach? What would be the time and space complexity?
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-8 bg-gray-100 dark:bg-neutral-800 rounded animate-pulse"></div>
              <div className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-sm">
                Send
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonThree = () => {
  const metrics = [
    { label: "Avg. Score", value: "92%", change: "+5%", trend: "up" },
    { label: "Sessions", value: "24", change: "+3", trend: "up" },
    { label: "Improvement", value: "+15%", change: "vs last month", trend: "up" },
  ];

  const recentSessions = [
    { type: "Frontend Interview", score: 95, company: "Google", date: "2h ago" },
    { type: "System Design", score: 88, company: "Meta", date: "5h ago" },
    { type: "Data Structures", score: 82, company: "Amazon", date: "1d ago" },
  ];

  return (
    <div className="relative flex flex-col h-full">
      <div className="w-full mx-auto bg-white dark:bg-neutral-900 shadow-lg group h-full rounded-lg border border-gray-100 dark:border-neutral-800">
        <div className="flex flex-1 w-full h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 p-4">
            {metrics.map((metric, idx) => (
              <div key={metric.label} className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</div>
                <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                  <span>↗</span>
                  <span>{metric.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Placeholder */}
          <div className="px-4 pb-4">
            <div className="h-20 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-end justify-between px-4 py-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-400 dark:bg-slate-600 rounded-sm w-4"
                  style={{ height: `${20 + Math.random() * 40}%` }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-neutral-700 pt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Sessions</h4>
            <div className="space-y-2">
              {recentSessions.map((session, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm py-1">
                  <div>
                    <div className="text-gray-900 dark:text-white font-medium">{session.type}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{session.company} • {session.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">{session.score}/100</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonTwo = () => {
  const participants = [
    { name: "Sarah Chen", role: "Frontend Dev", avatar: "SC", color: "bg-slate-600" },
    { name: "Mike Johnson", role: "Backend Dev", avatar: "MJ", color: "bg-slate-700" },
    { name: "Alex Rivera", role: "Full Stack", avatar: "AR", color: "bg-slate-500" },
  ];

  return (
    <div className="relative flex flex-col h-full">
      <div className="w-full mx-auto bg-white dark:bg-neutral-900 shadow-lg group h-full rounded-lg border border-gray-100 dark:border-neutral-800">
        <div className="flex flex-1 w-full h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Session</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">React Interview Practice</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-red-600">Recording</span>
            </div>
          </div>

          {/* Participants */}
          <div className="p-4 space-y-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">Participants</div>
            <div className="space-y-2">
              {participants.map((participant, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <div className={`w-8 h-8 ${participant.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {participant.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{participant.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{participant.role}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Info */}
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-neutral-700 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Duration</div>
                <div className="font-medium text-gray-900 dark:text-white">24:35</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Questions</div>
                <div className="font-medium text-gray-900 dark:text-white">8/12</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 pb-4 flex gap-2">
            <button className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded text-sm font-medium">
              Leave Session
            </button>
            <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium">
              End Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonFour = () => {
  const examples = [
    {
      title: "Two Sum",
      language: "JavaScript",
      code: `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      difficulty: "Easy",
      category: "Algorithms"
    },
    {
      title: "Binary Tree Traversal",
      language: "Python",
      code: `def inorderTraversal(self, root):
    result = []
    def traverse(node):
        if node:
            traverse(node.left)
            result.append(node.val)
            traverse(node.right)
    traverse(root)
    return result`,
      difficulty: "Medium",
      category: "Data Structures"
    }
  ];

  return (
    <div className="relative flex flex-col h-full">
      <div className="w-full mx-auto bg-white dark:bg-neutral-900 shadow-lg group h-full rounded-lg border border-gray-100 dark:border-neutral-800">
        <div className="flex flex-1 w-full h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Question Bank</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Practice coding problems</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1,200+</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Questions</div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="flex-1 p-4 space-y-4">
            {examples.map((example, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{example.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{example.language}</span>
                      <span>•</span>
                      <span>{example.category}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    example.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    example.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {example.difficulty}
                  </span>
                </div>

                <div className="bg-slate-900 text-slate-100 rounded-lg p-3 font-mono text-xs overflow-hidden">
                  <pre className="overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-neutral-700 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-8 bg-gray-100 dark:bg-neutral-800 rounded px-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                Search questions...
              </div>
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                Search
              </button>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm">
                Algorithms
              </button>
              <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm">
                Data Structures
              </button>
              <button className="flex-1 py-2 bg-blue-600 text-white rounded text-sm">
                System Design
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [
        // longitude latitude
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
};

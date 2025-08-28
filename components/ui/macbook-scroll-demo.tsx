"use client";
import React from "react";
import { MacbookScroll } from "@/components/ui/macbook-scroll";

export default function MacbookScrollDemo() {
  return (
    <div className="w-full overflow-hidden bg-white dark:bg-[#0B0B0F]">
      <MacbookScroll
        title={
          <span>
            Master Technical Interviews with AI <br /> Practice Smarter, Not Harder
          </span>
        }
        badge={
          <div className="h-6 w-auto px-2 transform rotate-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg rounded-full flex items-center justify-center text-xs">
            🚀 AI-Powered Platform
          </div>
        }
        src="/interview-dashboard.png"
        showGradient={true}
      />
    </div>
  );
}

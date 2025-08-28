
"use client";

import React, { Suspense } from 'react'
import dynamic from "next/dynamic";

// Dynamically import components to avoid SSR issues
const HeroSectionOne = dynamic(() => import("@/components/ui/hero-section-demo-1"), {
  ssr: false,
  loading: () => (
    <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-8"></div>
      </div>
    </div>
  )
});

const MacbookScrollDemo = dynamic(() => import("@/components/ui/macbook-scroll-demo"), {
  ssr: false,
  loading: () => (
    <div className="w-full overflow-hidden bg-white dark:bg-[#0B0B0F]">
      <div className="flex min-h-[100vh] items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-80 mb-4"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
        </div>
      </div>
    </div>
  )
});

const FeaturesSectionDemo = dynamic(() => import("@/components/ui/features-section-demo-3"), {
  ssr: false,
  loading: () => (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
});

export default function Page() {
    return (
        <>
            <HeroSectionOne />

            <Suspense fallback={
              <div className="w-full overflow-hidden bg-white dark:bg-[#0B0B0F]">
                <div className="flex min-h-[100vh] items-center justify-center">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-80 mb-4"></div>
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
                  </div>
                </div>
              </div>
            }>
              <MacbookScrollDemo />
            </Suspense>

            <FeaturesSectionDemo />
        </>
    )
}
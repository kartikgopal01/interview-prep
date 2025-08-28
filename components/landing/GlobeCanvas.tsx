"use client";
import dynamic from "next/dynamic";
import React from "react";

const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), {
  ssr: false,
});

type GlobeCanvasProps = {
  globeConfig: any;
  data: any[];
  className?: string;
};

export default function GlobeCanvas({ globeConfig, data, className }: GlobeCanvasProps) {
  return (
    <div className={className}>
      <World data={data as any} globeConfig={globeConfig} />
    </div>
  );
}



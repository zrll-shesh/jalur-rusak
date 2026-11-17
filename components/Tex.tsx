"use client";

import katex from "katex";
import { useMemo } from "react";

export default function Tex({ children, block = false, className = "" }: { children: string; block?: boolean; className?: string }) {
  const html = useMemo(
    () => katex.renderToString(children, { displayMode: block, throwOnError: false, strict: false }),
    [children, block]
  );
  if (block)
    return <div className={`scroll-x my-4 py-1 ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

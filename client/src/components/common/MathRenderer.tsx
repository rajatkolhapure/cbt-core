import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    // Split text by $$...$$ (display) and $...$ (inline)
    const regex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
    const parts = content.split(regex);

    containerRef.current.innerHTML = '';

    parts.forEach((part) => {
      if (!part) return;

      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        const span = document.createElement('div');
        span.className = 'my-2 overflow-x-auto';
        try {
          katex.render(math, span, { displayMode: true, throwOnError: false });
        } catch {
          span.textContent = part;
        }
        containerRef.current?.appendChild(span);
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1).trim();
        const span = document.createElement('span');
        try {
          katex.render(math, span, { displayMode: false, throwOnError: false });
        } catch {
          span.textContent = part;
        }
        containerRef.current?.appendChild(span);
      } else {
        const span = document.createElement('span');
        span.textContent = part;
        containerRef.current?.appendChild(span);
      }
    });
  }, [content]);

  return <div ref={containerRef} className={`inline-block ${className}`} />;
};

export default MathRenderer;

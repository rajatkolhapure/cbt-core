import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  inline = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!content) {
      containerRef.current.innerHTML = '';
      return;
    }

    try {
      // Split text by $$...$$ (display) and $...$ (inline)
      const regex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
      const parts = content.split(regex);

      containerRef.current.innerHTML = '';

      parts.forEach((part) => {
        if (!part) return;

        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          const wrapper = document.createElement('div');
          wrapper.className = 'my-2 max-w-full overflow-visible py-1 text-center break-words whitespace-normal';
          try {
            katex.render(math, wrapper, {
              displayMode: true,
              throwOnError: false,
              output: 'htmlAndMathml',
              trust: true,
            });
          } catch {
            wrapper.textContent = part;
          }
          containerRef.current?.appendChild(wrapper);
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          const span = document.createElement('span');
          span.className = 'inline-block max-w-full overflow-visible align-baseline break-words whitespace-normal';
          try {
            katex.render(math, span, {
              displayMode: false,
              throwOnError: false,
              output: 'htmlAndMathml',
              trust: true,
            });
          } catch {
            span.textContent = part;
          }
          containerRef.current?.appendChild(span);
        } else {
          const textSpan = document.createElement('span');
          textSpan.textContent = part;
          containerRef.current?.appendChild(textSpan);
        }
      });
    } catch {
      if (containerRef.current) {
        containerRef.current.textContent = content;
      }
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={`break-words whitespace-normal max-w-full overflow-visible ${inline ? 'inline' : 'inline-block'} ${className}`}
    />
  );
};

export default MathRenderer;

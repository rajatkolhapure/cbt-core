import React from 'react';
import MathRenderer from './common/MathRenderer';

export interface QuestionRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  content,
  className = '',
  inline = false,
}) => {
  return (
    <div className={`overflow-visible break-words whitespace-normal max-w-full ${className}`}>
      <MathRenderer content={content} inline={inline} />
    </div>
  );
};

export default QuestionRenderer;

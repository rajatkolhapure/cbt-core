import React from 'react';

export interface QuestionCardProps {
  children: React.ReactNode;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  children,
  className = '',
}) => {
  return (
    <article
      className={`rounded-2xl border border-[#263044] bg-[#151C2C] p-5 shadow-lg overflow-visible ${className}`}
    >
      {children}
    </article>
  );
};

export default QuestionCard;

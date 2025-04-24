import { cn } from '@/lib/utils';
import React from 'react';

interface DividerProps extends React.HTMLProps<HTMLDivElement> {
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ className }) => {
  return <div className={cn('mx-auto my-4 h-px w-[80%] bg-zinc-400', className)} />;
};

export default Divider;

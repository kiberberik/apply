'use client';
import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-zinc-800/50">
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
};

export default Loading;

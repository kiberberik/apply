import { useEffect, useCallback, useState } from 'react';
import { useInstructionStore } from '@/store/useInstructionStore';

interface InstructionViewerProps {
  className?: string;
}

export default function InstructionViewer({ className }: InstructionViewerProps) {
  const { content, isLoading, error, fetchInstruction } = useInstructionStore();
  const [isInitialized, setIsInitialized] = useState(false);

  const loadInstruction = useCallback(() => {
    if (!isInitialized) {
      console.log('Loading instruction...');
      fetchInstruction();
      setIsInitialized(true);
    }
  }, [fetchInstruction, isInitialized]);

  useEffect(() => {
    loadInstruction();
  }, [loadInstruction]);

  console.log('InstructionViewer render:', { content, isLoading, error, isInitialized });

  if (isLoading) {
    return <div className={className}>Загрузка инструкции...</div>;
  }

  if (error) {
    return <div className={className}>Ошибка при загрузке инструкции: {error}</div>;
  }

  if (!content) {
    return <div className={className}>Инструкция не найдена</div>;
  }

  return (
    <div className={className}>
      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

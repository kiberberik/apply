'use client';

import { useEffect, useState, useCallback } from 'react';
import { useInstructionStore } from '@/store/useInstructionStore';
import TiptapEditor from '@/components/TiptapEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function InstructionPage() {
  const { content, isLoading, error, fetchInstruction, updateInstruction, isInitialized } =
    useInstructionStore();
  const [activeTab, setActiveTab] = useState('edit');
  const [localContent, setLocalContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      console.log('InstructionPage: Fetching instruction');
      fetchInstruction();
    }
  }, [fetchInstruction, isInitialized]);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleContentChange = useCallback(async (newContent: string) => {
    setLocalContent(newContent);
  }, []);

  const handleSave = useCallback(async () => {
    if (localContent === content) {
      return;
    }
    try {
      setIsSaving(true);
      console.log('InstructionPage: Saving instruction');
      await updateInstruction(localContent);
      toast.success('Инструкция успешно сохранена');
    } catch (error) {
      console.error('Ошибка при сохранении инструкции:', error);
      toast.error('Ошибка при сохранении инструкции');
    } finally {
      setIsSaving(false);
    }
  }, [localContent, content, updateInstruction]);

  console.log('InstructionPage render:', {
    content,
    localContent,
    isLoading,
    error,
    activeTab,
    isInitialized,
  });

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  const hasChanges = localContent !== content;

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Управление инструкцией</CardTitle>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Редактирование</TabsTrigger>
              <TabsTrigger value="preview">Предпросмотр</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <TiptapEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Введите текст инструкции..."
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="prose prose-sm max-w-none rounded-md border p-4">
                <div
                  dangerouslySetInnerHTML={{ __html: localContent || 'Инструкция не найдена' }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

import { create } from 'zustand';

interface InstructionState {
  content: string;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  fetchInstruction: () => Promise<void>;
  updateInstruction: (content: string) => Promise<void>;
}

type Store = {
  setState: (fn: (state: InstructionState) => Partial<InstructionState>) => void;
  getState: () => InstructionState;
};

// Создаем функции вне store для мемоизации
const fetchInstructionFn = async ({ setState, getState }: Store) => {
  const state = getState();
  if (state.isLoading || state.isInitialized) {
    console.log('Already loading or initialized, skipping fetch');
    return;
  }

  try {
    console.log('Setting loading state to true');
    setState(() => ({ isLoading: true, error: null }));

    console.log('Fetching instruction from API');
    const response = await fetch('/api/instruction');

    if (!response.ok) {
      throw new Error(`Ошибка при загрузке инструкции: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received data from API:', data);

    if (data.error) {
      throw new Error(data.error);
    }

    console.log('Setting content in store:', data?.content || '');
    setState(() => ({
      content: data?.content || '',
      isLoading: false,
      isInitialized: true,
    }));
  } catch (error) {
    console.error('Error fetching instruction:', error);
    setState(() => ({
      error: error instanceof Error ? error.message : 'Ошибка при загрузке инструкции',
      isLoading: false,
      isInitialized: true,
    }));
  }
};

const updateInstructionFn = async (content: string, { setState, getState }: Store) => {
  const state = getState();
  if (state.isLoading) {
    console.log('Already loading, skipping update');
    return;
  }

  try {
    console.log('Setting loading state to true for update');
    setState(() => ({ isLoading: true, error: null }));

    console.log('Sending content to API:', content);
    const response = await fetch('/api/instruction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(
        `Ошибка при обновлении инструкции: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log('Received response from API:', data);

    if (data.error) {
      throw new Error(data.error);
    }

    console.log('Setting content in store:', data.content);
    setState(() => ({ content: data.content, isLoading: false }));
  } catch (error) {
    console.error('Error updating instruction:', error);
    setState(() => ({
      error: error instanceof Error ? error.message : 'Ошибка при обновлении инструкции',
      isLoading: false,
    }));
  }
};

export const useInstructionStore = create<InstructionState>((set, get) => ({
  content: '',
  isLoading: false,
  error: null,
  isInitialized: false,

  fetchInstruction: () => fetchInstructionFn({ setState: set, getState: get }),
  updateInstruction: (content: string) =>
    updateInstructionFn(content, { setState: set, getState: get }),
}));

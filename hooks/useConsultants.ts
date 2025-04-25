import { useState, useEffect } from 'react';
import { User } from '@prisma/client';

export function useConsultants() {
  const [consultants, setConsultants] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const response = await fetch('/api/users?role=CONSULTANT');
        if (!response.ok) throw new Error('Failed to fetch consultants');
        const data = await response.json();
        setConsultants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch consultants');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  return { consultants, isLoading, error };
}

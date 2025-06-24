'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function ExportAll() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA'); // формат YYYY-MM-DD
    setEndDate(todayStr);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toLocaleDateString('en-CA'); // формат YYYY-MM-DD
    setStartDate(weekAgoStr);
  }, []);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Пожалуйста, выберите даты начала и конца периода');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Дата начала не может быть позже даты окончания');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/applications/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Ошибка при экспорте');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Ошибка при экспорте данных');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Экспорт заявок в Google Sheets
        </CardTitle>
        <CardDescription>
          Выберите период для экспорта данных заявок в{' '}
          <Link
            className="cursor-pointer font-bold text-blue-500 hover:text-blue-700"
            href="https://docs.google.com/spreadsheets/d/1U7t2ruCpCUgFx2qg-64QERVEt8QbEwC4T8lw_UWToSY/edit?gid=0#gid=0"
            target="_blank"
          >
            Google Sheets
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="startDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Дата начала
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Дата окончания
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={loading || !startDate || !endDate}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Экспорт...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Экспортировать в Google Sheets
            </>
          )}
        </Button>

        {startDate && endDate && (
          <div className="text-center text-sm text-gray-600">
            Период: {new Date(startDate).toLocaleDateString('ru-RU')} -{' '}
            {new Date(endDate).toLocaleDateString('ru-RU')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

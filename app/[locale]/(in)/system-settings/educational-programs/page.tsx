'use client';
import React, { useEffect, useState } from 'react';
import { useEducationalStore } from '@/store/useEducationalStore';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';
import { EducationalProgramGroup } from '@prisma/client';
import GroupForm from '@/components/educationalPrograms/GroupForm';
import { useLocale, useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';

export default function Page() {
  const { groups, fetchGroups, deleteGroup } = useEducationalStore();
  const [groupToEdit, setGroupToEdit] = useState<EducationalProgramGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const local = useLocale();
  const t = useTranslations('EducationalPrograms');
  const c = useTranslations('Common');
  const a = useTranslations('AcademicLevel');
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleAddGroup = () => {
    setGroupToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditGroup = (group: EducationalProgramGroup) => {
    setGroupToEdit(group);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGroupToEdit(null);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('groups')}</h1>
        <Button size="sm" onClick={handleAddGroup}>
          {c('add')}
        </Button>
      </div>

      {isModalOpen && <GroupForm groupToEdit={groupToEdit} onClose={handleCloseModal} />}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('code')}</TableHead>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('academicLevel')}</TableHead>
            <TableHead>{c('visibility')}</TableHead>
            <TableHead>{c('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((g) => (
            <TableRow key={g.id}>
              <TableCell>{g.code}</TableCell>
              <TableCell>
                {local === 'ru' ? g.name_rus : local === 'kz' ? g.name_kaz : g.name_eng || '-'}
              </TableCell>
              <TableCell>{a(g.academic_level ?? '')}</TableCell>
              <TableCell>
                <Switch checked={g.visibility ?? false} />
              </TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEditGroup(g)}>
                  {c('edit')}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteGroup(g.id)}>
                  {c('delete')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRequiredDocuments } from '@/store/useRequiredDocuments';
import {
  RequiredDocument,
  DocumentType,
  Country,
  AcademicLevel,
  StudyType,
  AgeCategory,
} from '@prisma/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTranslations, useLocale } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ExtendedRequiredDocument
  extends Omit<RequiredDocument, 'countries' | 'academicLevels' | 'studyTypes' | 'ageCategories'> {
  countries: Country[];
  academicLevels: AcademicLevel[];
  studyTypes: StudyType[];
  ageCategories: AgeCategory[];
}

export default function RequiredDocumentsPage() {
  const t = useTranslations('RequiredDocuments');
  const c = useTranslations('Common');
  const tDocumentType = useTranslations('DocumentType');
  const tCitizenship = useTranslations('Citizenship');
  const tAgeCategory = useTranslations('AgeCategory');
  const tStudyType = useTranslations('StudyType');
  const tAcademicLevel = useTranslations('AcademicLevel');
  const locale = useLocale();
  const { documents, loading, error, fetchDocuments, addDocument, updateDocument, deleteDocument } =
    useRequiredDocuments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [editingDocument, setEditingDocument] = useState<ExtendedRequiredDocument | null>(null);
  const [formData, setFormData] = useState<Partial<ExtendedRequiredDocument>>({
    name_rus: '',
    name_kaz: '',
    name_eng: '',
    code: '',
    type: undefined,
    isNeedOriginal: true,
    isScanRequired: true,
    description: '',
    countries: [],
    academicLevels: [],
    studyTypes: [],
    ageCategories: [],
  });

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDocument) {
      await updateDocument(editingDocument.id, formData);
    } else {
      await addDocument(formData as ExtendedRequiredDocument);
    }
    setIsDialogOpen(false);
    setFormData({
      name_rus: '',
      name_kaz: '',
      name_eng: '',
      code: '',
      type: undefined,
      isNeedOriginal: true,
      isScanRequired: true,
      description: '',
      countries: [],
      academicLevels: [],
      studyTypes: [],
      ageCategories: [],
    });
    setEditingDocument(null);
  };

  const handleEdit = (document: ExtendedRequiredDocument) => {
    setEditingDocument(document);
    setFormData(document);
    setIsDialogOpen(true);
  };

  const handleSelectChange = (value: string, field: keyof ExtendedRequiredDocument) => {
    const currentValues = (formData[field] as string[]) || [];
    if (currentValues.includes(value)) {
      setFormData({
        ...formData,
        [field]: currentValues.filter((v) => v !== value),
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...currentValues, value],
      });
    }
  };

  const handleRemoveSelected = (value: string, field: keyof ExtendedRequiredDocument) => {
    const currentValues = (formData[field] as string[]) || [];
    setFormData({
      ...formData,
      [field]: currentValues.filter((v) => v !== value),
    });
  };

  const getDocumentName = (document: ExtendedRequiredDocument) => {
    switch (locale) {
      case 'ru':
        return document.name_rus;
      case 'kz':
        return document.name_kaz;
      case 'en':
        return document.name_eng;
      default:
        return document.name_rus;
    }
  };

  const handleDeleteClick = (documentId: string) => {
    setDocumentToDelete(documentId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (documentToDelete) {
      await deleteDocument(documentToDelete);
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  if (loading) return <div>{c('loading')}</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto py-10">
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('confirmDeleteTitle')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('confirmDeleteDescription')}</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {c('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {c('delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsDialogOpen(true);
                setEditingDocument(null);
                setFormData({
                  name_rus: '',
                  name_kaz: '',
                  name_eng: '',
                  code: '',
                  type: undefined,
                  isNeedOriginal: true,
                  isScanRequired: true,
                  description: '',
                  countries: [],
                  academicLevels: [],
                  studyTypes: [],
                  ageCategories: [],
                });
              }}
            >
              {t('addDocument')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDocument ? t('editDocument') : t('addDocument')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>{t('code')}</Label>
                  <Input
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="flex w-full flex-col gap-2">
                  <Label>{t('type')}</Label>
                  <Select
                    value={formData.type || ''}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as DocumentType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(DocumentType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {tDocumentType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label>{t('nameRus')}</Label>
                  <Input
                    value={formData.name_rus || ''}
                    onChange={(e) => setFormData({ ...formData, name_rus: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t('nameKaz')}</Label>
                  <Input
                    value={formData.name_kaz || ''}
                    onChange={(e) => setFormData({ ...formData, name_kaz: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>{t('nameEng')}</Label>
                  <Input
                    value={formData.name_eng || ''}
                    onChange={(e) => setFormData({ ...formData, name_eng: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>{t('description')}</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('countries')}</Label>
                <Select value="" onValueChange={(value) => handleSelectChange(value, 'countries')}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCountries')} />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { value: 'KAZAKHSTAN', label: tCitizenship('KAZAKHSTAN') },
                      { value: 'OTHER', label: tCitizenship('OTHER') },
                    ].map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.countries?.map((country) => (
                    <Badge key={country} variant="secondary">
                      {t(`${country.toLowerCase()}`)}
                      <button
                        type="button"
                        className="ml-1"
                        onClick={() => handleRemoveSelected(country, 'countries')}
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('academicLevels')}</Label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {(formData.academicLevels || []).map((level) => (
                    <Badge key={level} variant="secondary">
                      {tAcademicLevel(level)}
                      <button
                        type="button"
                        className="ml-1 hover:text-red-500"
                        onClick={() => handleRemoveSelected(level, 'academicLevels')}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => handleSelectChange(value, 'academicLevels')}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectAcademicLevels')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(AcademicLevel).map((level) => (
                      <SelectItem key={level} value={level}>
                        {tAcademicLevel(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('studyTypes')}</Label>
                <div className="mb-2 flex flex-wrap gap-2">
                  {(formData.studyTypes || []).map((type) => (
                    <Badge key={type} variant="secondary">
                      {tStudyType(type)}
                      <button
                        type="button"
                        className="ml-1 hover:text-red-500"
                        onClick={() => handleRemoveSelected(type, 'studyTypes')}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => handleSelectChange(value, 'studyTypes')}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectStudyTypes')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(StudyType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {tStudyType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('ageCategories')}</Label>
                <Select
                  value=""
                  onValueChange={(value) => handleSelectChange(value, 'ageCategories')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectAgeCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { value: 'ADULT', label: tAgeCategory('ADULT') },
                      { value: 'MINOR', label: tAgeCategory('MINOR') },
                    ].map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.ageCategories?.map((category) => (
                    <Badge key={category} variant="secondary">
                      {tAgeCategory(category)}
                      <button
                        type="button"
                        className="ml-1"
                        onClick={() => handleRemoveSelected(category, 'ageCategories')}
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNeedOriginal"
                    checked={formData.isNeedOriginal ?? false}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isNeedOriginal: checked as boolean })
                    }
                  />
                  <Label htmlFor="isNeedOriginal">{t('isNeedOriginal')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isScanRequired"
                    checked={formData.isScanRequired ?? false}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isScanRequired: checked as boolean })
                    }
                  />
                  <Label htmlFor="isScanRequired">{t('isScanRequired')}</Label>
                </div>
              </div>
              <Button className="my-8 w-full" type="submit">
                {editingDocument ? c('save') : c('add')}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('code')}</TableHead>
            <TableHead>{t('type')}</TableHead>
            {/* <TableHead>{t('countries')}</TableHead>
            <TableHead>{t('academicLevels')}</TableHead>
            <TableHead>{t('studyTypes')}</TableHead>
            <TableHead>{t('ageCategories')}</TableHead> */}
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell>{getDocumentName(document)}</TableCell>
              <TableCell>{document.code}</TableCell>
              <TableCell>{tDocumentType(document.type ?? '')}</TableCell>
              {/* <TableCell>
                <div className="flex flex-wrap gap-1">
                  {document.countries.map((country) => (
                    <Badge key={country} variant="secondary">
                      {tCitizenship(country)}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {document.academicLevels.map((level) => (
                    <Badge key={level} variant="secondary">
                      {tAcademicLevel(level)}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {document.studyTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {tStudyType(type)}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {document.ageCategories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {tAgeCategory(category)}
                    </Badge>
                  ))}
                </div>
              </TableCell> */}
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => handleEdit(document)}>
                    {t('edit')}
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteClick(document.id)}>
                    {t('delete')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

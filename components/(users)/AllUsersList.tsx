'use client';

import { hasAccess } from '@/lib/hasAccess';
import { useAuthStore } from '@/store/useAuthStore';
import { useUsersStore } from '@/store/useUsersStore';
import { Role, User } from '@prisma/client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { EyeIcon, PencilIcon, BackwardIcon, ForwardIcon } from '@heroicons/react/24/outline';
import EditUserModal from '@/components/(users)/EditUserModal';
import Loading from '@/app/[locale]/(in)/loading';
import NoAccess from '../layout/NoAccess';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const USERS_PER_PAGE = 10;

export default function AllUsersList() {
  const { user } = useAuthStore();
  const { users, setUsers } = useUsersStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<'consultantsFilter' | 'applicantsFilter' | null>(null);
  const t = useTranslations('Users');
  const c = useTranslations('Common');
  const tRole = useTranslations('Roles');
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await setUsers();
      } finally {
        setIsLoading(false);
      }
    };
    void fetchUsers();
  }, [setUsers]);

  useEffect(() => {
    let filtered = users || [];

    if (filter === 'consultantsFilter' && user?.consultants) {
      const consultantIds = user.consultants.map((c) => c.id);
      filtered = filtered.filter((user) => consultantIds.includes(user.id));
    }

    if (filter === 'applicantsFilter' && user?.consultedApplications) {
      const applicantIds = user.consultedApplications.map((app) => app.createdById);
      filtered = filtered.filter((user) => applicantIds.includes(user.id));
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredUsers(filtered);
  }, [users, filter, searchQuery, user]);

  const totalPages = Math.ceil((filteredUsers?.length || 0) / USERS_PER_PAGE);
  const currentUsers = useMemo(() => {
    if (!filteredUsers?.length) return [];
    const indexOfLastUser = currentPage * USERS_PER_PAGE;
    const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  }, [filteredUsers, currentPage]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  if (!hasAccess(user?.role ?? Role.USER, Role.CONSULTANT)) {
    return <NoAccess />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
        </div>
        <div className="w-full space-y-4">
          <div className="mb-4 flex gap-2">
            {(user?.consultants?.length || 0) > 0 && (
              <Button
                onClick={() =>
                  setFilter(filter === 'consultantsFilter' ? null : 'consultantsFilter')
                }
                className={`rounded-full px-4 py-2 text-sm ${
                  filter === 'consultantsFilter'
                    ? 'bg-[#D62E20] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('consultants')}
              </Button>
            )}

            {(user?.consultedApplications?.length || 0) > 0 && (
              <Button
                onClick={() => setFilter(filter === 'applicantsFilter' ? null : 'applicantsFilter')}
                className={`rounded-full px-4 py-2 text-sm ${
                  filter === 'applicantsFilter'
                    ? 'bg-[#D62E20] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('applicants')}
              </Button>
            )}
          </div>

          <Input
            type="text"
            placeholder={c('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
          />
        </div>
      </header>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {c('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentUsers.map((userItem) => (
              <tr key={userItem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {userItem.name || t('noName')}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {userItem.email}
                </td>

                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {tRole(userItem.role as Role)}
                </td>

                <td className="flex w-full items-center justify-start gap-1 text-sm">
                  {user && hasAccess(user.role, userItem.role) && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setSelectedUser({
                            ...userItem,
                            password: null,
                            emailVerified: null,
                            image: null,
                            managerId: userItem.managerId || null,
                          })
                        }
                        className="p-0 hover:text-[#D62E20] hover:underline"
                      >
                        <PencilIcon className="m-0 h-10 w-10 flex-shrink-0 p-0" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => router.push(`/users/${userItem.id}`)}
                        className="p-0 hover:text-[#D62E20] hover:underline"
                      >
                        <EyeIcon className="m-0 h-10 w-10 flex-shrink-0 p-0" />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length > USERS_PER_PAGE && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BackwardIcon className="h-6 w-6 flex-shrink-0" />
          </Button>
          <span className="text-sm text-gray-700">
            {currentPage} / {totalPages}
          </span>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ForwardIcon className="h-6 w-6 flex-shrink-0" />
          </Button>
        </div>
      )}

      {selectedUser && <EditUserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}

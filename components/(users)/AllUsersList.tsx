'use client';

import { hasAccess } from '@/lib/hasAccess';
import { useAuthStore } from '@/store/useAuthStore';
import { useUsersStore } from '@/store/useUsersStore';
import { Role, User } from '@prisma/client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { EyeIcon, PencilIcon, BackwardIcon, ForwardIcon } from '@heroicons/react/24/outline';
import EditUserModal from '@/components/(users)/EditUserModal';
import Loading from '@/app/[locale]/(in)/loading';

const USERS_PER_PAGE = 4;

export default function AllUsersList() {
  const { user } = useAuthStore();
  const { users, setUsers } = useUsersStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'consultantsFilter' | 'applicantsFilter' | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const t = useTranslations('Users');
  const c = useTranslations('Common');
  const rT = useTranslations('Roles');

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
    return <div className="p-6 text-center text-red-600">{c('noAccess')}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
          {/* <p className="mt-1 text-gray-600">{t('description')}</p> */}
        </div>
        <div className="w-full space-y-4">
          <div className="mb-4 flex gap-2">
            {(user?.consultants?.length || 0) > 0 && (
              <button
                onClick={() =>
                  setFilter(filter === 'consultantsFilter' ? null : 'consultantsFilter')
                }
                className={`rounded-full px-4 py-2 text-sm ${
                  filter === 'consultantsFilter'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Мои консультанты
              </button>
            )}

            {(user?.consultedApplications?.length || 0) > 0 && (
              <button
                onClick={() => setFilter(filter === 'applicantsFilter' ? null : 'applicantsFilter')}
                className={`rounded-full px-4 py-2 text-sm ${
                  filter === 'applicantsFilter'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Мои аппликанты
              </button>
            )}
          </div>

          <input
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
              {/* {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && ( */}
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('role')}
              </th>
              {/*  )} */}
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
                  {/* <pre className="mt-4 rounded bg-gray-100 p-4">
                    {JSON.stringify(userItem.manager, null, 2)}
                  </pre> */}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {userItem.email}
                </td>
                {/* {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && ( */}
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                  {rT(userItem.role)}
                </td>
                {/* )} */}
                <td className="flex gap-4 px-6 py-4 text-sm whitespace-nowrap">
                  {user && hasAccess(user.role, userItem.role) && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedUser({
                            ...userItem,
                            password: null,
                            emailVerified: null,
                            image: null,
                            managerId: userItem.managerId || null,
                          })
                        }
                        className="hover:text-rose-600 hover:underline"
                      >
                        <PencilIcon className="h-6 w-6 flex-shrink-0" />
                        {/* {c('edit')} */}
                      </button>
                      <Link
                        href={`/users/${userItem.id}`}
                        className="hover:text-rose-600 hover:underline"
                      >
                        <EyeIcon className="h-6 w-6 flex-shrink-0" />
                        {/* {c('view')} */}
                      </Link>
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
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* {c('prev')} */}
            <BackwardIcon className="h-6 w-6 flex-shrink-0" />
          </button>
          <span className="text-sm text-gray-700">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* {c('next')} */}
            <ForwardIcon className="h-6 w-6 flex-shrink-0" />
          </button>
        </div>
      )}

      {selectedUser && <EditUserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}

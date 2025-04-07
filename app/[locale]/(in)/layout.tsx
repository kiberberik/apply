import SidebarWithHeader from '@/components/layout/SidebarWithHeader';

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  return <SidebarWithHeader>{children}</SidebarWithHeader>;
}

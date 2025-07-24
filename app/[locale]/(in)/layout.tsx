import Footer from '@/components/layout/Footer';
import SidebarWithHeader from '@/components/layout/SidebarWithHeader';

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex-grow">
          <SidebarWithHeader>{children}</SidebarWithHeader>
        </div>
        <Footer />
      </div>
    </>
  );
}

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import React from 'react';

export default async function Page() {
  return (
    <div>
      SystemSettings
      <div className="my-4 flex flex-wrap gap-2">
        <Button className="w-full p-8 md:w-min">
          <Link href="/system-settings/educational-programs">Educational Programs</Link>
        </Button>
        <Button className="w-full p-8 md:w-min">
          <Link href="/system-settings/required-documents">Required Documents</Link>
        </Button>
      </div>
    </div>
  );
}

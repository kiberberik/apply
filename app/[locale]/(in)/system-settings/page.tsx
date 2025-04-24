import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import React from 'react';

export default async function Page() {
  return (
    <div>
      SystemSettings
      <div className="my-4 flex gap-2">
        <Button className="p-8">
          <Link href="/system-settings/educational-programs">Ed Programs</Link>
        </Button>
        <Button className="p-8">
          <Link href="/system-settings/required-documents">Required Documents</Link>
        </Button>
      </div>
    </div>
  );
}

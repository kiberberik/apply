import { Link } from '@/i18n/navigation';
import React from 'react';

export default async function Page() {
  return (
    <div>
      SystemSettings
      <div>
        <Link href="/system-settings/educational-programs">Ed Programs</Link>
      </div>
    </div>
  );
}

import Image from 'next/image';
import LogoMnu from '@/public/images/logo_mnu.svg';
import { Link } from '@/i18n/navigation';

function Logo() {
  return (
    <Link href="/">
      <Image priority src={LogoMnu} alt="MNU Logo" width={0} height={0} className="h-8 w-full" />
    </Link>
  );
}

export default Logo;

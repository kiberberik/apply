import Image from 'next/image';
import LogoMnu from '@/public/images/logo_mnu.svg';

function Logo() {
  return (
    <Image priority src={LogoMnu} alt="MNU Logo" width={0} height={0} className="h-8 w-full" />
  );
}

export default Logo;

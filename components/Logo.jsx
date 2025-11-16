import Image from 'next/image';
import Link from 'next/link';
import logo from '../public/assets/images/logo.png';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 font-kanit text-2xl font-semibold text-black">
      <Image src={logo} alt="Logo" width={40} height={40} placeholder="blur" priority={true} />
      <h3 className="hidden md:block">ShareSkippy</h3>
    </Link>
  );
};

export default Logo;

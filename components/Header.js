'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import OptimizedImage from './ui/OptimizedImage';
import ButtonSignin from './ButtonSignin';
import logo from '@/app/icon.png';
import config from '@/config';
import Logo from './Logo';
import LoginModal from './LoginModal';

const links = [];

const cta = <ButtonSignin extraStyle="btn-primary" />;

const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <>
      {' '}
      <header
        style={{ backgroundColor: 'rgba(255, 254, 254, 0.5)' }}
        className="fixed z-[999] w-full backdrop-blur-md"
      >
        <nav
          className="w-11/12 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 mx-auto lg:w-9/12"
          aria-label="Global"
        >
          {/* Logo */}
          {/* <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0"
            href="/"
            title={`${config.appName} homepage`}
          >
            <OptimizedImage
              src={logo}
              alt={`${config.appName} logo`}
              className="w-6 sm:w-8"
              priority={true}
              width={32}
              height={32}
            />
            <span className="font-extrabold text-base sm:text-lg text-white">{config.appName}</span>
          </Link>
        </div> */}

          <Logo />
          <ul className="hidden items-center justify-between gap-4 font-roboto text-sm font-semibold text-black lg:flex">
            <li className="duration-500 hover:text-black/60">
              <Link href="#howItWorks">How It Works</Link>
            </li>
            <li className="duration-500 hover:text-black/60">
              <Link href="#whySkippy">Why Skippy</Link>
            </li>
            <li className="duration-500 hover:text-black/60">
              <Link href="#testimonials">Testimonials</Link>
            </li>
          </ul>

          {/* Burger button */}
          {/* <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
              onClick={() => setIsOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div> */}

          <button
            onClick={() => setIsModalOpen(true)}
            className="relative inline-block overflow-hidden rounded-xl bg-purple-600 shadow-md text-white font-roboto px-6 py-2 group"
          >
            <div className="absolute top-0 left-[-100%] w-full h-full bg-purple-700 transition-all duration-300 ease-out group-hover:left-0 z-0"></div>

            <span className="relative z-10 font-semibold text-md">Join Now</span>
          </button>
        </nav>

        {/* Mobile menu */}
        <div className={`relative z-50 ${isOpen ? '' : 'hidden'}`}>
          <div
            className={`fixed inset-y-0 right-0 z-10 w-full px-4 sm:px-6 lg:px-8 py-4 overflow-y-auto 
          bg-indigo-600 sm:max-w-sm sm:ring-1 sm:ring-white/10 
          transform origin-right transition ease-in-out duration-300`}
          >
            {/* Logo (mobile) */}
            <div className="flex items-center justify-between">
              <Link
                className="flex items-center gap-2 shrink-0"
                title={`${config.appName} homepage`}
                href="/"
              >
                <OptimizedImage
                  src={logo}
                  alt={`${config.appName} logo`}
                  className="w-6 sm:w-8"
                  priority={true}
                  width={32}
                  height={32}
                />
                <span className="font-extrabold text-base sm:text-lg text-white">
                  {config.appName}
                </span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-white"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links (mobile) */}
            <div className="flow-root mt-6">
              <div className="py-4">
                <div className="flex flex-col gap-y-2 items-start">
                  {links.map((link) => (
                    <Link
                      href={link.href}
                      key={link.href}
                      className="hover:text-indigo-100 hover:bg-indigo-700/50 rounded px-2 py-1 transition w-full"
                      title={link.label}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="divider"></div>
              <div className="flex flex-col">{cta}</div>
            </div>
          </div>
        </div>
      </header>
      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;

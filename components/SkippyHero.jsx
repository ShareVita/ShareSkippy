'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import Image from 'next/image';
import ladyWithDog from '../public/assets/images/ladyWithDog.png';
import backdrop from '../public/assets/images/blurBackdrop.png';
import dog1 from '../public/assets/images/dog1.jpg';
import dog2 from '../public/assets/images/dog2.jpg';
import dog3 from '../public/assets/images/dog3.jpg';

const SkippyHero = () => {
  useGSAP(() => {
    gsap.fromTo(
      '#heading',
      { opacity: 0, xPercent: -50 },
      { opacity: 1, xPercent: 0, duration: 1.5, ease: 'power1.inOut' }
    );
    gsap.fromTo(
      '#main-heading',
      { opacity: 0, xPercent: 50 },
      { opacity: 1, xPercent: 0, duration: 1.5, ease: 'power1.inOut' }
    );
    gsap.fromTo(
      '#sub-heading',
      { opacity: 0, yPercent: 50 },
      { opacity: 1, yPercent: 0, duration: 1.5, ease: 'power1.inOut' }
    );
    gsap.fromTo(
      '#para',
      { opacity: 0, xPercent: -50 },
      { opacity: 1, xPercent: 0, delay: 1, duration: 1.5, ease: 'power1.inOut' }
    );
    gsap.fromTo(
      '#btn',
      { opacity: 0 },
      { opacity: 1, delay: 2, duration: 1.5, ease: 'power1.inOut' }
    );
  }, []);

  return (
    <main className="relative flex items-center py-8 w-11/12 h-[750px] mx-auto font-signika md:pt-32 md:pb-16 md:w-10/12">
      {/* Left Text Section */}
      <div className="w-full lg:w-1/2 text-center lg:text-left space-y-4 lg:space-y-6">
        <h6 id="heading" className="text-purple-800 font-normal text-lg">
          Where dog lovers connect.
        </h6>
        <h1 id="main-heading" className="text-5xl md:text-6xl font-semibold text-purple-900">
          Connect with Local Dog Lovers.
        </h1>
        <h2 id="sub-heading" className="text-3xl md:text-4xl font-semibold text-purple-600">
          Build a Happier Neighborhood Together
        </h2>
        <p id="para" className="text-sm md:text-lg font-roboto mx-auto lg:mx-0 w-full lg:w-11/12">
          ShareSkippy connects dog owners with verified dog lovers in your neighborhood for free
          walks, playdates, and adventures.
        </p>
        <div className="flex justify-center lg:justify-start mt-8">
          <Link
            href="/signin"
            id="btn"
            className="relative inline-block overflow-hidden rounded-full bg-purple-500 text-white font-roboto px-8 py-4 shadow-lg group"
          >
            <div className="absolute top-0 left-[-100%] w-full h-full bg-purple-600 transition-all duration-500 ease-out group-hover:left-0 z-0"></div>
            <span className="relative z-10 font-semibold text-sm md:text-md text-center block">
              Share Your Dog & Borrow a Friend
            </span>
          </Link>
        </div>
      </div>

      {/* Right Image Collage */}
      <div className="hidden lg:block lg:w-1/2 relative h-[600px] mt-12 lg:mt-0">
        {/* Blurred Backdrop */}
        <div className="absolute flex items-center justify-center rounded-full w-[30rem] h-[30rem] overflow-hidden">
          <Image
            src={backdrop}
            alt="A blurred backdrop"
            width={500}
            height={500}
            placeholder="blur"
            className="w-full h-full object-cover m-2"
          />
        </div>

        {/* Lady with Dog */}
        <div className="absolute top-50 -left-20">
          <div className="absolute mt-16 -ml-8 w-[40rem] h-[26rem]">
            {' '}
            <Image
              src={ladyWithDog}
              alt="woman hugging a dog"
              width={1000}
              height={1000}
              placeholder="blur"
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 w-full h-[80%] bg-gradient-to-t from-white via-white/98 to-transparent"></div>
          </div>
        </div>
        {/* Dog Images */}
        <div className="absolute top-80 right-10 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <Image src={dog1} alt="dog1" placeholder="blur" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-0 right-10 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <Image src={dog2} alt="dog2" placeholder="blur" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <Image src={dog3} alt="dog3" placeholder="blur" className="w-full h-full object-cover" />
        </div>
      </div>
    </main>
  );
};

export default SkippyHero;

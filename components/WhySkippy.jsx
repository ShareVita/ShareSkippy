'use client';

import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dogRunning from '../public/assets/images/dogRunning.jpg';
import MobileWhySkippy from './MobileWhySkippy';

gsap.registerPlugin(ScrollTrigger);

const WhySkippy = () => {
  useGSAP(() => {
    gsap.from('#why', {
      yPercent: 50,
      opacity: 0,
      duration: 2,
      ease: 'power1.inOut',
      stagger: 0.5,
      scrollTrigger: {
        trigger: '#why',
        start: 'top 90%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        markers: false,
      },
    });
  }, []);
  return (
    <section
      id="whySkippy"
      className="relative w-full h-[600px] bg-cover object-cover bg-center mx-auto mt-16 py-16 font-signika md:bg-fixed md:h-[550px]"
      style={{ backgroundImage: `url(${dogRunning.src})` }}
    >
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      ></div>
      <div className="absolute top-0 left-0 w-full h-full py-2 z-100 text-white">
        <h3 className="font-signika text-4xl text-center font-semibold mt-4 text-white lg:mt-16">
          Why ShareSkippy
        </h3>
        <MobileWhySkippy />
        <div className="flex flex-col items-center justify-center text-white lg:mt-12">
          <div className="hidden w-full items-center justify-center gap-8 w-full text-black lg:flex">
            <div className="relative flex flex-col items-center justify-center text-center font-roboto rounded-xl p-4 glassmorphism shadow-md w-72 h-24">
              <h6 className="font-lg font-semibold">For Dog Lovers</h6>
              <p className="font-normal text-sm">
                Companionship & adventures, no ownership required
              </p>
            </div>
            <div
              className="relative flex flex-col items-center justify-center text-center font-roboto rounded-xl p-4 glassmorphism shadow-md w-72 h-24"
              id="why"
            >
              <h6 className="font-lg font-semibold">For Dog Owners</h6>
              <p className="font-normal text-sm">Free help keeping pups happy & active</p>
            </div>
            <div
              className="relative flex flex-col items-center justify-center text-center font-roboto rounded-xl p-4 glassmorphism shadow-md w-72 h-24"
              id="why"
            >
              <h6 className="font-lg font-semibold">For Communities</h6>
              <p className="font-normal text-sm">
                Stronger neighborhood bonds through shared love for dogs
              </p>
            </div>
          </div>
          <p className="font-signika w-11/12 text-center md:w-7/12 lg:w-1/2 lg:mt-8">
            Did you know over 70% of city dogs don&apos;t get enough exercise? Life happens — owners
            get busy, work long hours, face health issues, or juggle tight budgets. But every pup
            still deserves to run, play, and explore. <br />
            That&apos;s where you come in: volunteer, make a dog&apos;s day (and a human&apos;s!),
            and get the best reward ever: puppy love. ❤️
          </p>
          <Link
            href="/signin"
            className="relative inline-block overflow-hidden rounded-full bg-purple-500 text-white font-roboto mt-8 px-8 py-4 shadow-lg group lg:mt-8"
          >
            <div className="absolute top-0 left-[-100%] w-full h-full bg-purple-600 transition-all duration-500 ease-out group-hover:left-0 z-0"></div>

            <span className="relative z-10 font-semibold text-md">Become a Pet Pal</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhySkippy;

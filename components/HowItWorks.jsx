'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import sign from '../public/assets/images/sign.png';
import dog4 from '../public/assets/images/dog4.png';

gsap.registerPlugin(ScrollTrigger);

const HowItWorks = () => {
  useGSAP(() => {
    gsap.from('#steps', {
      xPercent: 50,
      opacity: 0,
      duration: 2,
      ease: 'power1.inOut',
      stagger: 0.5,
      scrollTrigger: {
        trigger: '#steps',
        start: 'top 90%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        markers: false,
      },
    });
  }, []);
  return (
    <section className="w-11/12 mx-auto font-roboto py-16" id="howItWorks">
      <div className="relative w-full flex items-center justify-center">
        <Image src={sign} alt="How it works" width={300} height={300} className="hidden md:block" />
        <Image src={sign} alt="How it works" width={250} height={250} className="md:hidden" />
        <h3 className="absolute bottom-5 font-signika text-2xl font-semibold text-center">
          Get Started in <br />3 Easy Steps
        </h3>
      </div>
      <div className="w-11/12 mx-auto mt-12 mb-8 flex gap-4 items-center justify-center">
        <div className="hidden w-1/2 items-center justify-center md:flex">
          <Image src={dog4} alt="dog" width={250} height={250} />
        </div>
        <div className="w-full md:w-1/2">
          <div
            className="relative font-roboto rounded-xl p-4 glassmorphism shadow-md w-72"
            id="steps"
          >
            <h6 className="font-lg font-semibold">Create Your Profile</h6>
            <p className="font-normal text-xs">Are you a dog owner or dog lover?</p>
            <h4 className="absolute -top-5 -left-3 rounded-full p-4 text-center flex items-center justify-center border-4 border-purple-300 shadow-md font-signika bg-purple-500 w-10 h-10">
              1
            </h4>
          </div>
          <div
            className="relative font-roboto rounded-xl p-4 glassmorphism shadow-md mt-6 ml-8 w-72"
            id="steps"
          >
            <h6 className="font-lg font-semibold">Connect with Matches</h6>
            <p className="font-normal text-xs">Browse verified dog lovers in your area.</p>
            <h4 className="absolute -top-5 -left-3 rounded-full p-4 text-center flex items-center justify-center border-4 border-purple-300 shadow-md font-signika bg-purple-500 w-10 h-10">
              2
            </h4>
          </div>
          <div
            className="relative font-roboto rounded-xl p-4 glassmorphism shadow-md mt-6 ml-16 w-72"
            id="steps"
          >
            <h6 className="font-lg font-semibold">Schedule Adventures</h6>
            <p className="font-normal text-xs">Message, meet up, and watch tails wag!</p>
            <h4 className="absolute -top-5 -left-3 rounded-full p-4 text-center flex items-center justify-center border-4 border-purple-300 shadow-md font-signika bg-purple-500 w-10 h-10">
              3
            </h4>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center w-full">
        {' '}
        <Link
          href="/signin"
          className="relative inline-block overflow-hidden rounded-full bg-purple-500 text-white font-roboto mt-8 px-8 py-4 shadow-lg group"
        >
          <div className="absolute top-0 left-[-100%] w-full h-full bg-purple-600 transition-all duration-500 ease-out group-hover:left-0 z-0"></div>

          <span className="relative z-10 font-semibold text-md">Find your pack</span>
        </Link>
      </div>
    </section>
  );
};

export default HowItWorks;

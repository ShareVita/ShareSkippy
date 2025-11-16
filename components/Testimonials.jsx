'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import Image from 'next/image';
import { testimonials } from '@/lib/utils/constants';

const Testimonials = () => {
  const testimonialDivRef = useRef([]);
  const testimonialSpanRef = useRef([]);
  const animRef = useRef(null);

  // state for the slider playing progress (to keep track of the whole slider animation)
  const [sliderAnimation, setSliderAnimation] = useState({
    isPlaying: false,
    isEnd: false,
    isLastSlider: false,
    sliderId: 0,
    startPlay: false,
    stopPlay: false,
  });
  const { isPlaying, startPlay, sliderId, isEnd, stopPlay } = sliderAnimation;

  useGSAP(() => {
    // slider animation to move the slide out of the screen and bring the next slide in
    gsap.to('#slider', {
      transform:
        window.innerWidth < 760
          ? `translateX(${-105 * sliderId}%)` // mobile
          : window.innerWidth < 1200
            ? `translateX(${-102 * sliderId}%)` // tablet
            : `translateX(${-100 * sliderId}%)`, // laptop
      duration: 2,
      ease: 'power2.inOut',
    });
    // slider animation to start the slider animation when it is in the view
    gsap.to('#slider', {
      scrollTrigger: {
        trigger: '#slider',
        toggleActions: 'restart none none none',
      },
      // once the in view restart is complete this function should be called so the carousel and the other
      // slider animation will start
      onComplete: () => {
        setSliderAnimation((pre) => ({
          ...pre,
          startPlay: true,
          isPlaying: true,
        }));
      },
    });
  }, [isEnd, sliderId]);
  // to animate the progress
  useEffect(() => {
    let currentProgress = 0;
    const startTime = performance.now();
    const span = testimonialSpanRef.current;

    if (span[sliderId]) {
      // animation to move the indicator
      animRef.current = gsap.to(span[sliderId], {
        onUpdate: () => {
          // get the progress of the video
          let progress = 0;

          if (animRef.current) {
            progress = Math.ceil(animRef.current.progress() * 100);
          }

          if (progress != currentProgress) {
            currentProgress = progress;

            // set the width of the progress bar
            gsap.to(testimonialDivRef.current[sliderId], {
              width:
                window.innerWidth < 760
                  ? '10vw' // mobile
                  : window.innerWidth < 1200
                    ? '10vw' // tablet
                    : '4vw', // laptop
            });
            // set the background color of the progress bar
            gsap.to(span[sliderId], {
              width: `${currentProgress}%`,
              backgroundColor: 'purple',
            });
          }
        },
        // when the video is ended, replace the progress bar with the indicator and change the
        // background color
        onComplete: () => {
          if (isPlaying) {
            gsap.to(testimonialDivRef.current[sliderId], {
              width: '12px',
            });
            gsap.to(span[sliderId], {
              backgroundColor: '#0517df',
            });
            if (sliderId !== 5) {
              handleProcess('slide-end', sliderId);
            } else {
              handleProcess('slide-reset', 0);
            }
          }
        },
      });
      // restart the progress animation when the image is back to the first image(once the image resets)
      if (sliderId == 0) {
        animRef.current.restart();
      }
      // function to update the progress bar
      const animUpdate = () => {
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        animRef.current?.progress(Math.min(elapsed / 5, 1));
      };
      if (isPlaying && !stopPlay) {
        // ticker to update the progress bar
        gsap.ticker.add(animUpdate);
        // cleanup on state change or unmount
        return () => gsap.ticker.remove(animUpdate);
      } else {
        // remove the ticker when the slider animation is paused (progress bar is stopped)
        gsap.ticker.remove(animUpdate);
      }
    }
  }, [startPlay, sliderId, stopPlay]);

  // for when the play|pause|rest button is clicked, we check the argument and handle the slider animation
  // using the current state of the slider
  const handleProcess = (type, i) => {
    switch (type) {
      case 'slide-end':
        setSliderAnimation((prev) => ({
          ...prev,
          isEnd: true,
          sliderId: i + 1,
        }));
        break;
      case 'slide-last':
        setSliderAnimation((prev) => ({ ...prev, isLastSlider: true }));
        break;
      case 'slide-reset':
        setSliderAnimation((prev) => ({
          ...prev,
          sliderId: i,
          isLastSlider: false,
        }));
        break;
      case 'slide-play':
        if (animRef.current) {
          // resume the animation
          animRef.current.resume();
        }
        setSliderAnimation((prev) => ({
          ...prev,
          isPlaying: !prev.isPlaying,
          stopPlay: false,
        }));
        break;
      default:
        return sliderAnimation;
    }
  };
  // fucntion to make the clicked dots move to the img the represent
  const handleDotClick = (index) => {
    const lastIndex = sliderId;
    // Kill existing animation
    if (animRef.current) {
      animRef.current.kill();
    }
    // If there was a previously active image (not the first click), reset its width and progress
    if (lastIndex !== index) {
      // Reset the width of the previous dot (lastIndex)
      gsap.to(testimonialDivRef.current[lastIndex], {
        width: '12px',
      });
      // Reset the progress bar width of the previous dot (lastIndex)
      gsap.to(testimonialSpanRef.current[lastIndex], {
        width: '0%', // Reset progress
        backgroundColor: '#e2e8f0', // Reset color
      });
    }

    // Update state to navigate and play
    setSliderAnimation((prev) => ({
      ...prev,
      sliderId: index,
      isPlaying: true,
      stopPlay: false,
      isLastSlider: index === testimonials.length - 1,
      startPlay: true,
    }));
  };
  return (
    <section className="flex flex-col items-center justify-center mb-16 pt-32" id="testimonials">
      <h2 className="font-signika text-center text-4xl font-semibold">Testimonials</h2>
      <ul className="relative flex items-center justify-between gap-4 overflow-x-hidden mt-12 w-full">
        {testimonials.map((item) => (
          <li
            id="slider"
            key={item.id}
            className="w-[70vw] h-[28vh] bg-gray-100 mx-2 shrink-0 rounded-xl overflow-hidden md:w-[70vw] lg:w-[30vw] md:h-[32vh]"
          >
            <div className="w-full h-full p-4 rounded-xl flex flex-col items-center justify-between relative glassmorphism">
              <blockquote className="font-signika text-sm">
                &quot;{item.testimonial}&quot;
              </blockquote>
              <div className="w-full flex items-center justify-between">
                <span className="font-inter">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-xs text-black/80">{item.text}</p>
                </span>
                <Image src={item.dog} alt={`${item.name}'s dog`} width={50} height={50} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="relative w-48 flex items-center justify-center rounded-full my-8 mx-auto">
        {testimonials.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              testimonialDivRef.current[i] = el;
            }}
            onClick={() => handleDotClick(i)}
            className="w-3 h-3 relative bg-purple-400 mx-2 rounded-full cursor-pointer lg:w-3 lg:h-3 dot"
          >
            <span
              // to keep track of the playing progress
              ref={(el) => {
                testimonialSpanRef.current[i] = el;
              }}
              className="w-full h-full rounded-full absolute"
            />
          </div>
        ))}
      </div>
      <Link
        href="/signin"
        className="relative inline-block overflow-hidden rounded-xl bg-purple-600 text-white font-roboto px-6 py-2 shadow-lg group"
      >
        <div className="absolute top-0 left-[-100%] w-full h-full bg-purple-700 transition-all duration-300 ease-out group-hover:left-0 z-0"></div>

        <span className="relative z-10 font-semibold text-md">Join Now</span>
      </Link>
    </section>
  );
};

export default Testimonials;

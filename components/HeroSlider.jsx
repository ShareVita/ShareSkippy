'use client';

import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { slider } from '@/lib/utils/constants';

const HeroSlider = () => {
  const sliderDivRef = useRef([]);
  const sliderSpanRef = useRef([]);
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

  //   useEffect(() => {
  //     const updatedsliders = sliders.slice(0, -2);
  //     setslidersBtns(updatedsliders);
  //   }, []);

  useGSAP(() => {
    // slider animation to move the slide out of the screen and bring the next slide in
    gsap.to('#slides', {
      transform:
        window.innerWidth < 760
          ? `translateX(${-104 * sliderId}%)` // mobile
          : window.innerWidth < 1200
            ? `translateX(${-102 * sliderId}%)` // tablet
            : `translateX(${-101 * sliderId}%)`, // laptop
      duration: 2,
      ease: 'power2.inOut',
    });
    // slider animation to start the slider animation when it is in the view
    gsap.to('#slides', {
      scrollTrigger: {
        trigger: '#slides',
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
    const span = sliderSpanRef.current;

    if (span[sliderId]) {
      // animation to move the indicator
      animRef.current = gsap.to(span[sliderId], {
        onUpdate: () => {
          let progress = 0;

          if (animRef.current) {
            progress = Math.ceil(animRef.current.progress() * 100);
          }

          if (progress != currentProgress) {
            currentProgress = progress;

            // set the width of the progress bar
            gsap.to(sliderDivRef.current[sliderId], {
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
        onComplete: () => {
          if (isPlaying) {
            gsap.to(sliderDivRef.current[sliderId], {
              width: '12px',
            });
            gsap.to(span[sliderId], {
              backgroundColor: '#0517df',
            });
            if (sliderId !== 9) {
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
      gsap.to(sliderDivRef.current[lastIndex], {
        width: '12px',
      });
      // Reset the progress bar width of the previous dot (lastIndex)
      gsap.to(sliderSpanRef.current[lastIndex], {
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
      isLastSlider: index === slider.length - 1,
      startPlay: true,
    }));
  };

  return (
    <main className="flex flex-col items-center justify-center -mt-40 z-100 lg:-mt-24">
      <ul className="relative flex items-center justify-between gap-4 overflow-x-hidden mt-12 mx-auto w-full font-signika">
        {slider.map((slide, i) => (
          <li
            id="slides"
            key={i}
            className="p-4 w-full text-center mx-auto shrink-0 rounded-xl overflow-hidden flex flex-col items-center justify-between relative text-black"
          >
            <p className="w-11/12 mx-auto font-semibold md:w-7/12 md:text-md lg:text-lg lg:w-9/12">
              {slide}
            </p>
          </li>
        ))}
      </ul>
      <div className="hidden relative w-[300px] items-center justify-center rounded-full mb-8 mx-auto lg:flex">
        {slider.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              sliderDivRef.current[i] = el;
            }}
            onClick={() => handleDotClick(i)}
            className="w-3 h-3 relative bg-purple-400 mx-2 rounded-full cursor-pointer"
          >
            <span
              // to keep track of the playing progress
              ref={(el) => {
                sliderSpanRef.current[i] = el;
              }}
              className="w-full h-full rounded-full absolute"
            />
          </div>
        ))}
      </div>
    </main>
  );
};

export default HeroSlider;

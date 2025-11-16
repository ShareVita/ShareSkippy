'use client';
import { createClient } from '@/libs/supabase/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { renderSchemaTags } from '@/libs/seo';
import SkippyHero from '../components/SkippyHero';
import Community from '@/components/Community';
import HowItWorks from '@/components/HowItWorks';
import WhySkippy from '@/components/WhySkippy';
import HeroSlider from '@/components/HeroSlider';
import Testimonials from '@/components/Testimonials';

// Carousel messages for the hero section
const carouselMessages = [
  "Going on a date? Grab a pup first — it's the perfect wingman. If it flops, at least someone's happy to see you. 🐾",
  'Need an instant mood booster? A wagging tail beats meditation apps, trust us. 🐶',
  'Owners get reliable walkers. Dog-lovers get their canine fix. Everyone swipes right on more belly rubs.',
  "Love dogs but don't love vet bills, pet insurance, and 5AM potty breaks? Borrow one instead. 100% joy, 0% pee stains.",
  'Think of us as Tinder for dogs… but without the awkward small talk.',
  'Have a dog desperate for a friend? Set up a puppy playdate. Warning: your dog might end up with a better social life than you.',
  "Some owners can't give their dogs enough walks — maybe they're elderly, disabled, or working 80-hour tech weeks. Meanwhile, plenty of dog lovers are dying to hike, run, or cuddle. We make the match.",
  'Some pups need more play, some humans need more pup. Put them together and boom — happy dogs, happy people, fewer chewed remotes.',
  'Your dog wants a marathon. You want a burrito. No shame — this is where ShareSkippy saves the day.',
  "When dogs get more love, humans get more joy. It's science. (Okay, maybe not peer-reviewed, but just look at their faces.)",
];

// Community stories
const communityStories = [
  {
    quote: 'I cant have a dog in my apartment, but now I hike with Max every week.',
    author: 'Sarah, Dog Lover',
  },
  {
    quote:
      "I work from home and needed a break from Zoom meetings. Walking neighbors' dogs gives me fresh air, exercise, and some seriously good puppy therapy.",
    author: 'Mike, Remote Worker',
  },
  {
    quote:
      "My dog has boundless energy, and I couldn't keep up. Now he gets playdates with other pups, and I get peace of mind knowing he's happy and socialized.",
    author: 'Lisa, Dog Owner',
  },
  {
    quote: 'Recovering from surgery, my neighbors made sure Bella still got her daily walks.',
    author: 'David, Recovering Owner',
  },
  {
    quote:
      'My parents are elderly and their dog, Charlie, needs more exercise than they can manage. Neighbors who step in have been a lifesaver — Charlie is thrilled, and my parents feel supported.',
    author: 'Jennifer, Family Member',
  },
  {
    quote:
      'Single mom here — I was overwhelmed trying to juggle work, school, and my two kids. Now my pup gets outside while I prep dinner.',
    author: 'Maria, Single Parent',
  },
  {
    quote:
      "I've always wanted a dog but live in an apartment that doesn't allow pets. Now I get weekend puppy cuddles, and it's the highlight of my week.",
    author: 'Alex, Apartment Dweller',
  },
  {
    quote:
      "After moving to a new neighborhood, I didn't know anyone. Walking dogs with neighbors helped me make friends and get my daily steps in.",
    author: 'Tom, New Neighbor',
  },
  {
    quote:
      "I work long hours and couldn't give Luna the walks she needed. Now neighbors help take her on hikes, and she's happier than ever.",
    author: 'Rachel, Busy Professional',
  },
  {
    quote:
      'I was recovering from illness and worried about leaving my dog alone. With help from local dog lovers, he still gets daily playtime and has discovered his love for swimming.',
    author: 'James, Recovering Owner',
  },
];

export default function Home() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Get user session
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Redirect logged-in users to community page
  useEffect(() => {
    if (!loading && user) {
      router.push('/community');
    }
  }, [user, loading, router]);

  // Auto-rotate carousel messages
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % carouselMessages.length);
    }, 5000); // Changed to 5 seconds for better readability

    return () => clearInterval(interval);
  }, [isPaused]);

  // // Handle carousel navigation
  // const goToPrevious = () => {
  //   setCurrentMessageIndex((prev) => (prev - 1 < 0 ? carouselMessages.length - 1 : prev - 1));
  // };

  // const goToNext = () => {
  //   setCurrentMessageIndex((prev) => (prev + 1) % carouselMessages.length);
  // };

  // const togglePause = () => {
  //   setIsPaused(!isPaused);
  // };

  // // Handle button clicks - redirect to signin page
  // const handleButtonClick = (e) => {
  //   e.preventDefault();
  //   window.location.href = '/signin';
  // };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while redirecting logged-in users
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to community...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderSchemaTags()}
      <div className="min-h-screen">
        {/* Hero Section */}
        <SkippyHero />
        <HeroSlider />
        {/* How It Works Section */}
        <HowItWorks />
        {/* Why ShareSkippy Section */}
        <WhySkippy />
        {/* Community Stories Section */}
        <Testimonials />
        {/* Closing CTA Section */}
        <Community />
      </div>
    </>
  );
}

import Link from 'next/link';

const Community = () => {
  return (
    <section className="font-inter w-11/12 mx-auto rounded-4xl px-3 py-8 glassmorphism flex flex-col items-center justify-center my-8 md:p-8">
      <h1 className="text-xl w-8/12 mx-auto text-center font-semibold mb-2 lg:text-3xl">
        Join the dog-sharing community that puts love before money.
      </h1>
      <p className="text-sm max-sm:text-center">
        Help dogs, support neighbors, and share the joy of companionship.
      </p>
      <Link
        href="/signin"
        className="relative inline-block overflow-hidden rounded-full bg-purple-500 text-white font-roboto mt-8 px-8 py-4 shadow-lg group"
      >
        <div className="absolute top-0 left-[-100%] w-full h-full bg-purple-600 transition-all duration-500 ease-out group-hover:left-0 z-0"></div>

        <span className="relative z-10 font-semibold text-md">Join the Community</span>
      </Link>
    </section>
  );
};

export default Community;

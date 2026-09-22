import Link from 'next/link';
import { LEGAL } from '@/lib/legal';
import { getSEOTags } from '@/libs/seo';

// Kaia Colban's canonical identity page. It carries the full Person entity with
// the complete profile set; linking to it from here, in both the visible copy
// and sameAs, is what ties this mention back to that one entity rather than
// leaving it as an unconnected reference to a name.
const CANONICAL_SITE = 'https://kaiacolban.com/';

// Profiles Kaia Colban maintains. This array is the single source for both the
// visible links in the "About Me" section below and the Person schema's sameAs,
// so the two can never drift apart.
const PROFILES = [
  { label: 'substack.com/@getmekaiac', url: 'https://substack.com/@getmekaiac' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/kaia-colban-13a415a2/' },
  { label: 'X', url: 'https://x.com/kaia_colban' },
  { label: 'Indie Hackers', url: 'https://www.indiehackers.com/KaiaColban' },
];

export const metadata = getSEOTags({
  title: 'Our Story: How Kaia Colban Built ShareSkippy',
  description:
    'Kaia Colban founded ShareSkippy, a free community-driven way to connect dog owners with dog lovers. How it began, why it stayed free, and how she taught herself to build it.',
  keywords: ['Kaia Colban', 'ShareSkippy', 'ShareVita', 'community dog sharing'],
  openGraph: {
    title: 'Our Story: How Kaia Colban Built ShareSkippy',
    description:
      'Kaia Colban founded ShareSkippy, a free community-driven way to connect dog owners with dog lovers.',
    url: 'https://www.shareskippy.com/our-story',
  },
  canonicalUrlRelative: '/our-story',
});

function PersonJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Kaia Colban',
          // Points at the canonical entity on kaiacolban.com, which holds the
          // authoritative version of these facts.
          '@id': `${CANONICAL_SITE}#kaia-colban`,
          url: CANONICAL_SITE,
          jobTitle: 'Founder',
          alumniOf: {
            '@type': 'CollegeOrUniversity',
            name: 'Cornell University',
          },
          founder: {
            '@type': 'Organization',
            name: 'ShareSkippy',
            url: 'https://www.shareskippy.com/',
          },
          mainEntityOfPage: 'https://www.shareskippy.com/our-story',
          sameAs: [CANONICAL_SITE, ...PROFILES.map((p) => p.url)],
        }),
      }}
    ></script>
  );
}

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <PersonJsonLd />
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Our Story</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              How a simple act of kindness became a community movement
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* How ShareSkippy Began */}
        <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            How ShareSkippy Began
          </h2>
          <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              Hi, I&apos;m Kaia Colban, the founder of ShareSkippy — a free, community-driven way to
              connect dog owners with dog lovers for walks, hikes, cuddles, and adventures.
            </p>
            <p>
              The idea came from a simple act of kindness. A close friend of mine was very sick and
              couldn&apos;t take his dog out for more than a few quick bathroom breaks. I posted on
              a local Oakland Facebook group asking if anyone could help. Within hours, over 40
              people replied. Total strangers. All offering to walk a dog they&apos;d never met.
            </p>
            <p>
              That moment stuck with me. It showed me how powerful small acts of care can be — and
              how dogs can bring people together faster than almost anything else.
            </p>
          </div>
        </section>

        {/* Building a Community, Not a Service */}
        <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Building a Community, Not a Service
          </h2>
          <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              I didn&apos;t want to build &quot;the next Rover&quot; or &quot;another app.&quot; I
              wanted to create a space that feels neighborly — where people help each other because
              they care, not because they&apos;re being paid.
            </p>
            <p>
              There are already plenty of platforms that make dog care transactional. ShareSkippy is
              about connection over commerce. It&apos;s for the busy dog owner who needs help during
              the day, the college student who misses their dog back home, the retiree who just
              wants some furry company on walks, and everyone in between.
            </p>
            <p className="font-semibold text-gray-900">
              Dogs get more love and exercise.
              <br />
              Humans get more connection and purpose.
              <br />
              Everyone wins.
            </p>
          </div>
        </section>

        {/* Teaching Myself to Code */}
        <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Teaching Myself to Code
          </h2>
          <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              When I started, I had zero coding experience. I was coming out of a stressful job in
              business and operations strategy and needed to build something that felt good.
            </p>
            <p>
              So I taught myself to code — with a lot of late nights, a lot of trial and error, and
              a little help from AI tools. The result is what you see here: ShareSkippy.com, built
              from scratch, designed to be simple, kind, and safe.
            </p>
            <p>
              However, I&apos;m still learning and always open to feedback or guidance. Feel free to
              reach me at{' '}
              <a
                href="mailto:kaia@shareskippy.com"
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                kaia@shareskippy.com
              </a>
              .
            </p>
          </div>
        </section>

        {/* What Makes ShareSkippy Different */}
        <section className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 md:p-12 mb-8 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
            What Makes ShareSkippy Different
          </h2>
          <div className="space-y-6 text-lg leading-relaxed">
            <div className="flex items-start gap-4">
              <span className="text-3xl">💛</span>
              <div>
                <strong className="block mb-1">Free for everyone.</strong>
                There&apos;s no payment or membership required — kindness shouldn&apos;t cost money.
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">🐶</span>
              <div>
                <strong className="block mb-1">Neighbors helping neighbors.</strong>
                Every connection is built on trust, not transactions.
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">🌱</span>
              <div>
                <strong className="block mb-1">Community Care.</strong>
                ShareSkippy is part of my nonprofit, ShareVita, so that time spent helping a
                neighbor with their dog can count as community service.
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">🔒</span>
              <div>
                <strong className="block mb-1">Safety through transparency.</strong>
                Users can link their social profiles like LinkedIn or Instagram to help others get
                to know them before meeting in person.
              </div>
            </div>
          </div>
        </section>

        {/* About Me */}
        <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About Me</h2>
          <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              My name is Kaia Colban. I was born in Norway, grew up in San Diego, studied at
              Cornell, and now live in Oakland, California — a city that feels like home in every
              sense. I spend most of my free time walking in circles around the city and camping in
              the summer.
            </p>
            <p>
              I write about building things — startups, communities, and sometimes myself — on my
              blog:{' '}
              <a
                href={PROFILES[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                {PROFILES[0].label}
              </a>
            </p>
            <p>
              If you want to follow the journey of ShareSkippy, or just read honest thoughts on
              creating, failing, and figuring it out, that&apos;s where I share it all.
            </p>
            <p>
              You can also find me on{' '}
              {PROFILES.slice(1).map((profile, i, list) => (
                <span key={profile.url}>
                  {i > 0 && (i === list.length - 1 ? ', and ' : ', ')}
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold underline"
                  >
                    {profile.label}
                  </a>
                </span>
              ))}
              .
            </p>
            <p>
              More about me and what else I&apos;m building is at{' '}
              <a
                href={CANONICAL_SITE}
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                kaiacolban.com
              </a>
              .
            </p>
          </div>
        </section>

        {/* Looking Forward */}
        <section className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Looking Forward</h2>
          <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
            <p>
              We&apos;d like to grow and expand! To do so, I&apos;m looking for donations and more
              volunteers and interns to help out.
            </p>
            <p>{LEGAL.getCurrentDisclosure()}</p>
            <p>
              If you&apos;d like to get involved, please email me at{' '}
              <a
                href="mailto:kaia@shareskippy.com"
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                kaia@shareskippy.com
              </a>
              .
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Help dogs, support neighbors, and share the joy of companionship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/community"
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Browse Community
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

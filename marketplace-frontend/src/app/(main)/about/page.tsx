export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">About Us</h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          A community built by collectors, for collectors.
        </p>
      </div>

      <div className="space-y-10 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Story</h2>
          <p className="leading-relaxed">
            Collectibles Marketplace was born out of a simple frustration: there was no good place online specifically for serious collectors to connect, showcase their collections, and trade with people who truly understood the hobby.
          </p>
          <p className="leading-relaxed mt-3">
            We started with die-cast cars and scale models — the kind of items where condition, edition, and provenance matter enormously. Over time we expanded to action figures, trading cards, coins, vintage toys, and everything in between.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What We Believe</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: '🤝',
                title: 'Community First',
                body: 'Every feature we build is designed to strengthen connections between collectors — not just enable transactions.',
              },
              {
                icon: '🔍',
                title: 'Authenticity Matters',
                body: 'We encourage honest condition grading, detailed photos, and transparent descriptions so buyers know exactly what they\'re getting.',
              },
              {
                icon: '🌱',
                title: 'Every Collection Grows',
                body: 'Whether you have 5 items or 5,000, your collection is worth showcasing and your expertise is worth sharing.',
              },
            ].map((card) => (
              <div key={card.title} className="bg-gray-50 rounded-2xl p-5">
                <p className="text-3xl mb-3">{card.icon}</p>
                <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What You Can Do Here</h2>
          <ul className="space-y-2 text-gray-600">
            {[
              'List your collection publicly or keep it private',
              'Mark items as For Sale, For Trade, or Collection Only',
              'Discover other collectors and browse their items',
              'Send contact requests and chat directly',
              'Build your collector profile and reputation',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-primary-50 border border-primary-100 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Join the Community</h2>
          <p className="text-gray-600 mb-4">
            Sign up for free and start showcasing your collection today. No listing fees, no commissions.
          </p>
          <a
            href="/signup"
            className="inline-block px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Create your account →
          </a>
        </section>
      </div>
    </div>
  );
}

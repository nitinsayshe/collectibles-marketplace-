import Link from 'next/link';

const links = {
  Marketplace: [
    { label: 'Browse Items', href: '/products' },
    { label: 'Collectors', href: '/collectors' },
    { label: 'My Collection', href: '/my-collection' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
  Legal: [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-primary-400">◆</span> Collectibles
            </Link>
            <p className="text-sm mt-3 leading-relaxed">
              A community marketplace for serious collectors. Buy, sell, and trade die-cast cars, figures, cards, and more.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{group}</p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Collectibles Marketplace. All rights reserved.</p>
          <p className="text-xs text-gray-600">Made with care for collectors.</p>
        </div>
      </div>
    </footer>
  );
}

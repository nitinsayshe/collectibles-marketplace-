'use client';

import { useState } from 'react';

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'Is Collectibles Marketplace free to use?',
        a: 'Yes, completely free. There are no listing fees, no commissions, and no subscription required. Sign up and start listing your collection immediately.',
      },
      {
        q: 'Who can join?',
        a: 'Anyone aged 18 or above who collects or is interested in collectibles — die-cast cars, action figures, trading cards, coins, stamps, vintage toys, and more.',
      },
      {
        q: 'Do I need to sell to join?',
        a: 'Not at all. You can list items as "Collection Only" to show off your collection without selling or trading anything. Many collectors join purely to display their items and connect with others.',
      },
    ],
  },
  {
    category: 'Listings & Products',
    items: [
      {
        q: 'What statuses can I set for my items?',
        a: '"For Sale" (with a price), "For Trade" (open to offers), "Collection Only" (visible but not for sale), or "Hidden" (only you can see it). You can change this any time from My Collection.',
      },
      {
        q: 'Can I hide an item temporarily?',
        a: 'Yes. Hover over any card in My Collection and click "Hide". The item disappears from public view but stays in your collection. Click "Show" to make it visible again.',
      },
      {
        q: 'How do I edit or delete a listing?',
        a: 'Go to My Collection, hover over the card, and click "Edit" to change details or "Delete" to remove it permanently. Changes are reflected immediately.',
      },
      {
        q: 'What image should I use?',
        a: 'Currently we support image URLs. Paste a direct link to a hosted image (e.g. from Google Photos, Imgur, etc.). We recommend using a clear photo against a neutral background.',
      },
    ],
  },
  {
    category: 'Contacting Other Collectors',
    items: [
      {
        q: 'How do I message another collector?',
        a: 'Open any product listing and click "Contact Collector". Write a brief introduction and send a contact request. Once they accept, a chat opens and you can message in real time.',
      },
      {
        q: 'Can I reject a contact request?',
        a: 'Yes. Go to the bell icon (Contact Requests) in the top navigation. You can accept or reject any pending request. Rejected requests are removed without notifying the sender.',
      },
      {
        q: 'Are my contact details visible to everyone?',
        a: 'No. Your phone number and WhatsApp are only visible to collectors you have explicitly connected with (accepted contact request). Your city and Instagram are shown on your public profile if you add them.',
      },
    ],
  },
  {
    category: 'Safety & Trust',
    items: [
      {
        q: 'How do I report a suspicious listing or user?',
        a: 'Contact us via the Contact page with the username or listing URL and a description of your concern. We review all reports promptly.',
      },
      {
        q: 'Is my password safe?',
        a: 'Yes. Passwords are hashed using bcrypt before storage and are never readable, even by us. We strongly recommend using a unique password for your account.',
      },
      {
        q: 'What payment methods are recommended?',
        a: 'We don\'t process payments — that\'s arranged directly between buyer and seller. We recommend using traceable payment methods (UPI, bank transfer) and documented shipping with tracking.',
      },
    ],
  },
  {
    category: 'Account & Profile',
    items: [
      {
        q: 'Can I change my username?',
        a: 'Usernames are currently fixed after registration as they are used in your public profile URL. If you need a change, contact support.',
      },
      {
        q: 'How do I make my profile private?',
        a: 'Go to Profile → Edit Profile and toggle "Public profile" off. Your profile will no longer appear in the Collectors directory.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Contact us at support@collectibles.market with your account email and we will delete your account and all associated data within 30 days.',
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <span className={`text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${open ? 'rotate-45' : ''}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="text-sm text-gray-600 leading-relaxed pb-4 -mt-1">{a}</p>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-500">Everything you need to know about using the Platform.</p>
      </div>

      <div className="space-y-10">
        {faqs.map((group) => (
          <section key={group.category}>
            <h2 className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {group.category}
            </h2>
            <div className="bg-white border border-gray-200 rounded-2xl px-5 divide-y divide-gray-100">
              {group.items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-gray-700 font-medium mb-1">Still have a question?</p>
        <p className="text-sm text-gray-500 mb-4">We're happy to help — reach out directly.</p>
        <a
          href="/contact"
          className="inline-block px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Contact us
        </a>
      </div>
    </div>
  );
}

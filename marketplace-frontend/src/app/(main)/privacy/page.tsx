const LAST_UPDATED = 'September 2026';

const sections = [
  {
    title: '1. Information We Collect',
    items: [
      { label: 'Account data', detail: 'Username, email address, and password (stored as a secure hash).' },
      { label: 'Profile data', detail: 'Display name, bio, avatar URL, city, phone, WhatsApp, and Instagram handle — only what you choose to provide.' },
      { label: 'Listing data', detail: 'Product titles, descriptions, images, prices, and availability status.' },
      { label: 'Usage data', detail: 'Pages visited, features used, and general interaction patterns to improve the Platform.' },
      { label: 'Communications', detail: 'Messages exchanged between users through our chat system.' },
    ],
  },
  {
    title: '2. How We Use Your Information',
    items: [
      { label: 'Account management', detail: 'To create and maintain your account and authenticate you securely.' },
      { label: 'Platform functionality', detail: 'To display your profile, listings, and facilitate connections with other collectors.' },
      { label: 'Communication', detail: 'To send important account notices, security alerts, and (with your consent) platform updates.' },
      { label: 'Improvement', detail: 'To understand how the Platform is used and improve features and performance.' },
      { label: 'Safety', detail: 'To detect and prevent fraud, abuse, and violations of our Terms.' },
    ],
  },
  {
    title: '3. Information Sharing',
    items: [
      { label: 'Public profile', detail: 'If your profile is set to public, your display name, bio, city, and Instagram handle are visible to other users.' },
      { label: 'Contact details', detail: 'Your phone and WhatsApp number are only shared with collectors you have explicitly connected with.' },
      { label: 'No sale of data', detail: 'We do not sell, rent, or trade your personal information to third parties.' },
      { label: 'Legal requirements', detail: 'We may disclose information if required by law or to protect the rights and safety of our users.' },
    ],
  },
  {
    title: '4. Data Retention',
    body: 'We retain your account and listing data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or compliance purposes.',
  },
  {
    title: '5. Security',
    body: 'We use industry-standard security measures including encrypted passwords (bcrypt), HTTPS in transit, and JWT-based authentication. No system is completely secure, and we encourage you to use a strong, unique password for your account.',
  },
  {
    title: '6. Your Rights',
    items: [
      { label: 'Access', detail: 'You can view and export your data at any time from your profile settings.' },
      { label: 'Correction', detail: 'You can update your information through your profile page at any time.' },
      { label: 'Deletion', detail: 'You can delete your account and all associated data by contacting us.' },
      { label: 'Opt-out', detail: 'You can opt out of non-essential communications in your account settings.' },
    ],
  },
  {
    title: '7. Cookies',
    body: 'We use only essential cookies and browser localStorage for authentication (JWT token storage). We do not use tracking or advertising cookies.',
  },
  {
    title: '8. Contact',
    body: 'For any privacy-related questions or requests, contact us at privacy@collectibles.market.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
        <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
      </div>

      <p className="text-gray-600 mb-10 leading-relaxed">
        This Privacy Policy explains how Collectibles Marketplace collects, uses, and protects your personal information. We are committed to handling your data responsibly and transparently.
      </p>

      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{s.title}</h2>
            {'body' in s && s.body ? (
              <p className="text-gray-600 leading-relaxed">{s.body}</p>
            ) : (
              <div className="space-y-3">
                {s.items?.map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="text-sm font-medium text-gray-800 min-w-[130px] flex-shrink-0">{item.label}</span>
                    <span className="text-sm text-gray-600 leading-relaxed">{item.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
